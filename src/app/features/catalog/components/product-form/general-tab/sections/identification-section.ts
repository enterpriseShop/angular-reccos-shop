import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { InputComponent } from '../../../../../../design-system/input/input';
import { SelectComponent } from '../../../../../../design-system/select/select';
import { AutocompleteSelectComponent } from '../../../../../../design-system/autocomplete-select/autocomplete-select';
import { SelectOption } from '../../../../../../core/models/design-system/select-option.model';
import { GeneralOptionQuery } from '../../../../../../core/models/generals/general-option-query.model';
import { AutocompleteOption } from '../../../../../../core/models/design-system/auto-complete.model';

@Component({
  selector: 'app-product-identification-section',
  standalone: true,
  imports: [InputComponent, SelectComponent, AutocompleteSelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="bg-white dark:bg-slate-800 rounded-[12px] border border-gray-200/80 dark:border-slate-700/80 p-6 shadow-2xs space-y-4"
    >
      <div class="border-b border-gray-100 dark:border-slate-700/60 pb-3">
        <h3 class="text-xs font-bold text-gray-900 dark:text-slate-200 uppercase tracking-wider">
          Identificação & Classificação
        </h3>
        <p class="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
          Códigos de controle e classificações principais do produto no sistema
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Categoria -->
        <app-autocomplete-select
          label="Categoria Principal"
          [required]="true"
          placeholder="Selecione ou busque uma categoria..."
          [options]="categoryOptions()"
          [value]="formCategoryId()"
          [disabled]="isReadOnly()"
          [error]="errors()['category_id']"
          (valueChange)="fieldChange.emit({ field: 'category_id', value: $event })"
          (searchQueryChange)="categorySearch.emit($event)"
        />

        <!-- Fabricante -->
        <app-autocomplete-select
          label="Fabricante / Marca"
          placeholder="Selecione ou busque a marca..."
          [options]="manufacturerOptions()"
          [value]="formManufacturerId()"
          [disabled]="isReadOnly()"
          (valueChange)="fieldChange.emit({ field: 'manufacturer_id', value: $event })"
          (searchQueryChange)="manufacturerSearch.emit($event)"
        />

        <!-- Origem da Peça -->
        <app-select
          label="Origem da Peça"
          placeholder="Selecione a origem..."
          [options]="partOriginOptions()"
          [value]="formPartOriginId()"
          [disabled]="isReadOnly()"
          [error]="errors()['part_origin_id']"
          (valueChange)="fieldChange.emit({ field: 'part_origin_id', value: $event })"
        />

        <!-- Status -->
        @if (!isCreateMode()) {
          <app-select
            label="Status do Cadastro"
            placeholder="Selecione o status..."
            [options]="statusOptions()"
            [value]="formStatusId()"
            [disabled]="isReadOnly()"
            (valueChange)="fieldChange.emit({ field: 'status_id', value: $event })"
          />
        }

        <!-- Código Interno (SKU / Reccos) -->
        <app-input
          label="Código Reccos / SKU Interno"
          placeholder="Ex.: REC-10293"
          [value]="formInternalCode()"
          [disabled]="isReadOnly()"
          helperText="Código interno único de identificação"
          (valueChange)="fieldChange.emit({ field: 'internal_code', value: $event })"
        />

        <!-- Código de Barras (EAN / GTIN) -->
        <app-input
          label="Código de Barras (EAN / GTIN)"
          placeholder="Ex.: 7891234567890"
          [value]="formBarcode()"
          [disabled]="isReadOnly()"
          (valueChange)="fieldChange.emit({ field: 'barcode', value: $event })"
        />
      </div>
    </div>
  `,
})
export class ProductIdentificationSectionComponent {
  readonly formCategoryId = input<string>('');
  readonly formManufacturerId = input<string>('');
  readonly formPartOriginId = input<string>('');
  readonly formStatusId = input<string>('');
  readonly formInternalCode = input<string>('');
  readonly formBarcode = input<string>('');

  readonly isReadOnly = input<boolean>(false);
  readonly isCreateMode = input<boolean>(false);
  readonly errors = input<Record<string, string>>({});

  readonly categoryOptions = input<AutocompleteOption[]>([]);
  readonly manufacturerOptions = input<AutocompleteOption[]>([]);
  readonly partOriginOptions = input<SelectOption[]>([]);
  readonly statusOptions = input<SelectOption[]>([]);

  readonly fieldChange = output<{ field: string; value: string }>();
  readonly categorySearch = output<GeneralOptionQuery>();
  readonly manufacturerSearch = output<GeneralOptionQuery>();
}
