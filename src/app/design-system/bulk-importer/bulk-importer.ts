import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  input,
  output,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { AppIconComponent } from '../icon/app-icon';
import { ButtonComponent } from '../button/button';
import { ProductService } from '../../core/services/product-service';
import {
  NormalizedProductRow,
  ProductImportPayload,
} from '../../core/models/products/product-import.model';

export type ImportState = 'idle' | 'parsing' | 'preview' | 'submitting' | 'success' | 'error';

@Component({
  selector: 'app-bulk-importer',
  standalone: true,
  imports: [CommonModule, AppIconComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bulk-importer.html',
})
export class BulkImporterComponent {
  private productService = inject(ProductService, { optional: true });

  readonly title = input<string>('Carregar Arquivo');
  readonly description = input<string>(
    'Selecione um arquivo CSV ou Excel com a estrutura definida para importar novos produtos.',
  );

  // Handlers e eventos
  readonly importHandler = input<((payload: unknown) => Promise<unknown>) | null>(null);
  readonly downloadTemplate = input<(() => void) | null>(null);
  readonly downloadTemplateXLSX = output<void>();
  readonly importSuccess = output<{ processId: string }>();

  // Estados
  readonly state = signal<ImportState>('idle');
  readonly fileName = signal<string | null>(null);
  readonly fileSize = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly processId = signal<string | null>(null);

  // Dados do preview
  readonly rawHeaders = signal<string[]>([]);
  readonly previewRows = signal<NormalizedProductRow[]>([]);
  readonly batchError = signal<string | null>(null);

  // Computeds
  readonly totalRows = computed(() => this.previewRows().length);
  readonly validRows = computed(() => this.previewRows().filter((r) => r.errors.length === 0));
  readonly invalidRows = computed(() => this.previewRows().filter((r) => r.errors.length > 0));
  readonly hasBatchError = computed(
    () => !!this.batchError() || this.totalRows() > 100 || this.totalRows() === 0,
  );
  readonly canSubmit = computed(
    () =>
      this.totalRows() > 0 &&
      this.totalRows() <= 100 &&
      this.invalidRows().length === 0 &&
      !this.batchError(),
  );

  onFileSelected(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    if (inputEl.files?.length) {
      this.processFile(inputEl.files[0]);
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files.length) {
      this.processFile(event.dataTransfer.files[0]);
    }
  }

  private processFile(file: File): void {
    this.fileName.set(file.name);
    this.fileSize.set(this.formatFileSize(file.size));
    this.state.set('parsing');
    this.errorMessage.set(null);
    this.batchError.set(null);

    const isCsv = file.name.toLowerCase().endsWith('.csv');
    const isXlsx =
      file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls');

    if (!isCsv && !isXlsx) {
      this.showFileError('Formato inválido. Por favor, envie um arquivo .csv ou .xlsx.');
      return;
    }

    if (isCsv) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = (e.target?.result as string) || '';
          const rawData = this.parseCsv(text);
          this.handleParsedData(rawData);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Falha ao processar arquivo CSV.';
          this.showFileError(msg);
        }
      };
      reader.onerror = () => this.showFileError('Erro ao ler arquivo.');
      reader.readAsText(file, 'UTF-8');
    } else {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const buffer = e.target?.result as ArrayBuffer;
          const data = new Uint8Array(buffer);
          const XLSX = await this.ensureXlsx();
          const workbook = XLSX.read(data, { type: 'array' });

          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rawData: Record<string, unknown>[] = XLSX.utils.sheet_to_json(worksheet);

          this.handleParsedData(rawData);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Falha ao ler planilha Excel.';
          this.showFileError(msg);
        }
      };
      reader.onerror = () => this.showFileError('Erro ao ler arquivo.');
      reader.readAsArrayBuffer(file);
    }
  }

  private handleParsedData(rawData: Record<string, unknown>[]): void {
    if (!rawData || rawData.length === 0) {
      this.batchError.set('O arquivo enviado está vazio.');
      this.previewRows.set([]);
      this.state.set('preview');
      return;
    }

    this.rawHeaders.set(Object.keys(rawData[0] || {}));

    let batchErrMsg: string | null = null;
    if (rawData.length > 100) {
      batchErrMsg = `O lote possui ${rawData.length} linhas. O limite máximo permitido é de 100 linhas por envio.`;
    }

    const internalCodes = new Set<string>();
    const barcodes = new Set<string>();
    const normalizedList: NormalizedProductRow[] = [];

    for (let i = 0; i < rawData.length; i++) {
      const raw = rawData[i];
      const rowErrors: string[] = [];

      const internal_code = this.extractField(raw, [
        'internal_code',
        'codigo_interno',
        'código interno',
        'codigo',
        'código',
        'sku',
      ]);
      const name = this.extractField(raw, [
        'name',
        'nome',
        'descricao',
        'descrição',
        'denominacao',
        'denominação',
        'produto',
      ]);
      const category_id = this.extractField(raw, [
        'category_id',
        'category',
        'categoria',
        'categoria_id',
      ]);
      const manufacturer_id = this.extractField(raw, [
        'manufacturer_id',
        'manufacturer',
        'fabricante',
        'fabricante_id',
        'marca',
      ]);
      const part_origin_id = this.extractField(raw, [
        'part_origin_id',
        'origin',
        'origem',
        'origem_id',
        'origem da peça',
        'origem_da_peca',
      ]);
      const unit_id = this.extractField(raw, [
        'unit_id',
        'unit',
        'unidade',
        'unidade_id',
        'unidade de medida',
        'unidade_medida',
      ]);
      const barcodeRaw = this.extractField(raw, [
        'barcode',
        'codigo_barras',
        'código de barras',
        'codigo de barras',
        'ean',
        'gtin',
      ]);
      const barcode = barcodeRaw && barcodeRaw.trim().length > 0 ? barcodeRaw.trim() : null;

      // Validações obrigatórias
      if (!internal_code) rowErrors.push('Código Interno obrigatório');
      if (!name) rowErrors.push('Nome obrigatório');
      if (!category_id) rowErrors.push('Categoria obrigatória');
      if (!manufacturer_id) rowErrors.push('Fabricante obrigatório');
      if (!part_origin_id) rowErrors.push('Origem obrigatória');
      if (!unit_id) rowErrors.push('Unidade obrigatória');

      // Validação de duplicação de internal_code no lote
      if (internal_code) {
        if (internalCodes.has(internal_code)) {
          const dupMsg = `Erro na linha ${i + 1}: O código interno "${internal_code}" está duplicado no lote.`;
          rowErrors.push(`Código interno duplicado: ${internal_code}`);
          if (!batchErrMsg) batchErrMsg = dupMsg;
        } else {
          internalCodes.add(internal_code);
        }
      }

      // Validação de duplicação de barcode preenchido no lote
      if (barcode) {
        if (barcodes.has(barcode)) {
          const dupMsg = `Erro na linha ${i + 1}: O código de barras "${barcode}" está duplicado no lote.`;
          rowErrors.push(`Código de barras duplicado: ${barcode}`);
          if (!batchErrMsg) batchErrMsg = dupMsg;
        } else {
          barcodes.add(barcode);
        }
      }

      normalizedList.push({
        index: i + 1,
        internal_code,
        name,
        category_id,
        manufacturer_id,
        part_origin_id,
        unit_id,
        barcode,
        raw,
        errors: rowErrors,
      });
    }

    this.previewRows.set(normalizedList);
    this.batchError.set(batchErrMsg);
    this.state.set('preview');
  }

  async submitBatch(): Promise<void> {
    if (this.previewRows().length === 0) {
      this.batchError.set('Nenhum dado para enviar.');
      return;
    }

    if (this.previewRows().length > 100) {
      this.batchError.set(
        `O lote possui ${this.previewRows().length} linhas. O limite máximo permitido é de 100 linhas por envio.`,
      );
      return;
    }

    if (this.batchError()) {
      return;
    }

    if (this.invalidRows().length > 0) {
      this.errorMessage.set(
        `Existem ${this.invalidRows().length} linha(s) com erros de validação. Corrija o arquivo antes de enviar.`,
      );
      return;
    }

    this.state.set('submitting');
    this.errorMessage.set(null);

    const payload: ProductImportPayload = {
      products: this.previewRows().map((row) => ({
        internal_code: row.internal_code,
        name: row.name,
        category_id: row.category_id,
        manufacturer_id: row.manufacturer_id,
        part_origin_id: row.part_origin_id,
        unit_id: row.unit_id,
        barcode: row.barcode ? row.barcode : null,
      })),
    };

    try {
      let result: any;
      if (this.productService) {
        result = await firstValueFrom(this.productService.importProducts(payload));
      } else if (this.importHandler()) {
        result = await this.importHandler()!(payload);
      } else {
        throw new Error('Serviço de importação não configurado.');
      }

      const processId = result?.process_id || result?.data?.process_id || 'ID gerado';
      this.processId.set(processId);
      this.successMessage.set(
        `Sucesso! Lote recebido para processamento assíncrono. Process ID: ${processId}`,
      );
      this.state.set('success');
      this.importSuccess.emit({ processId });
    } catch (err: any) {
      this.state.set('preview');
      if (err?.status === 422) {
        const errorDetail =
          err?.error?.message ||
          (err?.error?.errors ? JSON.stringify(err.error.errors) : 'Erro de validação (422)');
        this.errorMessage.set(`Erro de validação (422): ${errorDetail}`);
      } else {
        this.errorMessage.set(
          err?.error?.message ||
            err?.message ||
            'Erro de conexão ao tentar enviar o lote para o servidor.',
        );
      }
    }
  }

  reset(): void {
    this.state.set('idle');
    this.fileName.set(null);
    this.fileSize.set(null);
    this.errorMessage.set(null);
    this.batchError.set(null);
    this.previewRows.set([]);
    this.rawHeaders.set([]);
    this.processId.set(null);
  }

  private extractField(row: Record<string, unknown>, candidateKeys: string[]): string {
    const entries: [string, unknown][] = Object.entries(row).map(([k, v]) => [
      String(k)
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '_'),
      v,
    ]);

    for (const key of candidateKeys) {
      const keyNorm = key
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '_');

      const match = entries.find(([k]) => k === keyNorm || k.includes(keyNorm));
      if (match && match[1] !== undefined && match[1] !== null) {
        const val = String(match[1]).trim();
        if (val.length > 0) return val;
      }
    }

    for (const key of candidateKeys) {
      if (row[key] !== undefined && row[key] !== null) {
        const val = String(row[key]).trim();
        if (val.length > 0) return val;
      }
    }

    return '';
  }

  private parseCsv(text: string): Record<string, unknown>[] {
    const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];

    const firstLine = lines[0];
    const commaCount = (firstLine.match(/,/g) || []).length;
    const semicolonCount = (firstLine.match(/;/g) || []).length;
    const delimiter = semicolonCount > commaCount ? ';' : ',';

    const splitRow = (rowStr: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < rowStr.length; i++) {
        const char = rowStr[i];
        if (char === '"') {
          if (inQuotes && rowStr[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === delimiter && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = splitRow(lines[0]);
    const rows: Record<string, unknown>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = splitRow(lines[i]);
      if (values.every((v) => !v)) continue;
      const rowObj: Record<string, unknown> = {};
      headers.forEach((h, idx) => {
        rowObj[h] = values[idx] !== undefined ? values[idx] : '';
      });
      rows.push(rowObj);
    }

    return rows;
  }

  private async ensureXlsx(): Promise<any> {
    if (typeof window !== 'undefined' && (window as any).XLSX) {
      return (window as any).XLSX;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
      script.onload = () => resolve((window as any).XLSX);
      script.onerror = () =>
        reject(new Error('Não foi possível carregar o leitor de arquivos XLSX.'));
      document.head.appendChild(script);
    });
  }

  private showFileError(msg: string): void {
    this.state.set('error');
    this.errorMessage.set(msg);
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }
}
