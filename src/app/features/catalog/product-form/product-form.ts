import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageHeaderComponent } from '../../../design-system/page-header/page-header';
import { InputComponent } from '../../../design-system/input/input';
import { SelectComponent, SelectOption } from '../../../design-system/select/select';
import { ButtonComponent } from '../../../design-system/button/button';
import { ConfirmDialogComponent } from '../../../design-system/dialog/confirm-dialog';
import { AppIconComponent } from '../../../design-system/icon/app-icon';
import { ToastService } from '../../../core/services/toast';
import { ShellStateService } from '../../../core/services/shell-state';
import { ProductService } from '../../../core/services/product-service';
import { ProductResponse } from '../../../core/models/products/product-response.model';

export type ProductFormMode = 'create' | 'edit' | 'view' | 'duplicate';
export type FormTab = 'geral' | 'comercial' | 'compatibilidade' | 'midia' | 'administracao';

export interface OemCodeItem {
  id: string;
  manufacturer: string;
  oemCode: string;
  isPrimary: boolean;
}

export interface ProductCodeItem {
  id: string;
  type: string;
  code: string;
}

export interface EquivalentProductItem {
  id: string;
  productName: string;
  notes: string;
}

export interface VehicleApplicationItem {
  id: string;
  brand: string;
  model: string;
  version: string;
  engine: string;
  startYear: number;
  endYear: number;
}

export interface MediaImageItem {
  id: string;
  url: string;
  name: string;
  size: string;
  isPrimary: boolean;
  order: number;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
}

export interface SupplierItem {
  id: string;
  supplierName: string;
  supplierCode: string;
  purchasePrice: number;
  leadTimeDays: number;
  isPreferential: boolean;
}

export interface ProductNoteItem {
  id: string;
  type: 'Geral' | 'Técnica' | 'Comercial' | 'Fiscal';
  description: string;
  date: string;
  author: string;
}

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    PageHeaderComponent,
    InputComponent,
    SelectComponent,
    ButtonComponent,
    ConfirmDialogComponent,
    AppIconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
})
export class ProductFormComponent implements OnInit {
  readonly shellState = inject(ShellStateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private toastService = inject(ToastService);

  readonly mode = signal<ProductFormMode>('create');
  readonly activeTab = signal<FormTab>('geral');
  readonly isSaving = signal<boolean>(false);
  readonly isDragging = signal<boolean>(false);
  readonly isFormDirty = signal<boolean>(false);

  // Dialog States
  readonly deleteProductDialogOpen = signal<boolean>(false);
  readonly unsavedChangesDialogOpen = signal<boolean>(false);
  readonly deleteImageDialogOpen = signal<boolean>(false);
  readonly selectedImageForDelete = signal<MediaImageItem | null>(null);

  // Validation errors map
  readonly errors = signal<Record<string, string>>({});

  // Form Fields State (Signals)
  readonly formName = signal<string>('');
  readonly formInternalCode = signal<string>('');
  readonly formCategoryId = signal<string>('');
  readonly formManufacturerId = signal<string>('');
  readonly formPartOriginId = signal<string>('');
  readonly formUnitId = signal<string>('');
  readonly formStatusId = signal<string>('st-01');
  readonly formDescription = signal<string>('');

  readonly formWeight = signal<number>(0);
  readonly formHeight = signal<number>(0);
  readonly formWidth = signal<number>(0);
  readonly formLength = signal<number>(0);

  readonly formPrice = signal<number>(0);
  readonly formPromotionalPrice = signal<number | null>(null);
  readonly formPromotionStartDate = signal<string>('');
  readonly formPromotionEndDate = signal<string>('');
  readonly formWarehouseId = signal<string>('wh-01');
  readonly formQuantity = signal<number>(0);
  readonly formMinQuantity = signal<number>(0);
  readonly formAllowBackorder = signal<boolean>(false);

  // Collection Signals
  readonly oemCodes = signal<OemCodeItem[]>([]);
  readonly productCodes = signal<ProductCodeItem[]>([]);
  readonly equivalentProducts = signal<EquivalentProductItem[]>([]);
  readonly vehicleApplications = signal<VehicleApplicationItem[]>([]);
  readonly mediaImages = signal<MediaImageItem[]>([]);
  readonly suppliers = signal<SupplierItem[]>([]);
  readonly selectedTagIds = signal<string[]>([]);
  readonly productNotes = signal<ProductNoteItem[]>([]);

  readonly product = signal<ProductResponse>({
    id: 'p0000000-0002-0000-0000-000000000002',
    status: {
      id: 's0000000-0001-0000-0000-000000000001',
      module: 'PRODUCT',
      code: 'DRAFT',
      name: 'Rascunho',
      color: '#64748B',
      icon: 'file-text',
    },
    category: {
      id: 'c0000000-0013-0000-0000-000000000013',
      name: 'Filtros de Óleo',
      slug: 'filtros-de-oleo',
    },
    manufacturer: {
      id: 'm0000000-0001-0000-0000-000000000001',
      name: 'Bosch',
      slug: 'bosch',
    },
    internal_code: 'OF-002',
    name: 'Filtro de Óleo Bosch OF-002',
    slug: 'filtro-de-oleo-bosch-of-002',
    icon: null,
    image: null,
    short_description: 'Filtro de óleo paralelo Bosch',
    description: 'Filtro de óleo paralelo de alta qualidade para linha VW/Fiat 1.0 e 1.6.',
    weight: '0.300',
    height: '10.00',
    width: '8.00',
    length: '8.00',
    featured: false,
    active: 0,
    is_sellable: false,
    commercial_status: 'ready',
    pricing: {
      regular_price: 35.9,
      promotional_price: 29.9,
      current_price: 29.9,
      is_on_promotion: true,
      promotion_start: '2026-07-01',
      promotion_end: '2026-12-31',
      active: true,
      display: {
        from: 35.9,
        to: 29.9,
        label: 'de R$ 35,90 por R$ 29,90',
      },
    },
    inventory: {
      quantity: 50,
      reserved_quantity: 0,
      available_quantity: 50,
      minimum_quantity: 5,
      maximum_quantity: 300,
      allow_backorder: true,
      active: true,
    },
  });

  // Static Dropdown Options
  readonly categoryOptions: SelectOption[] = [
    { label: 'Sistemas de Freios', value: 'cat-01' },
    { label: 'Motor & Transmissão', value: 'cat-02' },
    { label: 'Suspensão & Direção', value: 'cat-03' },
    { label: 'Sistema Elétrico', value: 'cat-04' },
    { label: 'Arrefecimento', value: 'cat-05' },
  ];

  readonly manufacturerOptions: SelectOption[] = [
    { label: 'Bosch', value: 'm-01' },
    { label: 'Continental', value: 'm-02' },
    { label: 'Monroe', value: 'm-03' },
    { label: 'NGK', value: 'm-04' },
    { label: 'Fremax', value: 'm-05' },
    { label: 'Magneti Marelli', value: 'm-06' },
    { label: 'Sachs', value: 'm-07' },
  ];

  readonly partOriginOptions: SelectOption[] = [
    { label: 'Nacional', value: 'po-01' },
    { label: 'Importado Direto', value: 'po-02' },
    { label: 'Original OEM', value: 'po-03' },
    { label: 'Aftermarket Premium', value: 'po-04' },
  ];

  readonly unitOptions: SelectOption[] = [
    { label: 'UN - Unidade', value: 'u-01' },
    { label: 'JG - Jogo', value: 'u-02' },
    { label: 'PC - Peça', value: 'u-03' },
    { label: 'PAR - Par', value: 'u-04' },
    { label: 'KG - Quilograma', value: 'u-05' },
  ];

  readonly statusOptions: SelectOption[] = [
    { label: 'Ativo', value: 'st-01' },
    { label: 'Inativo', value: 'st-02' },
    { label: 'Em Homologação', value: 'st-03' },
  ];

  readonly warehouseOptions: SelectOption[] = [
    { label: 'Depósito Central SP', value: 'wh-01' },
    { label: 'Depósito Filial PR', value: 'wh-02' },
    { label: 'Depósito Distribuição RJ', value: 'wh-03' },
  ];

  readonly availableTags = [
    { id: 'tag-1', label: 'Garantia 12 Meses' },
    { id: 'tag-2', label: 'Linha Leve' },
    { id: 'tag-3', label: 'Alto Giro' },
    { id: 'tag-4', label: 'Primeira Linha' },
    { id: 'tag-5', label: 'Importado' },
    { id: 'tag-6', label: 'Oferta Especial' },
  ];

  readonly isReadOnly = computed(() => this.mode() === 'view');

  readonly headerTitle = computed(() => {
    switch (this.mode()) {
      case 'edit':
        return 'Editar Produto';
      case 'view':
        return 'Visualizar Produto';
      case 'duplicate':
        return 'Novo Produto';
      default:
        return 'Novo Produto';
    }
  });

  readonly breadcrumbs = computed(() => {
    const actionLabel = this.headerTitle();
    return [
      { label: 'Catálogo', route: '/catalog/products' },
      { label: 'Produtos', route: '/catalog/products' },
      { label: actionLabel },
    ];
  });

  ngOnInit(): void {
    const url = this.router.url;
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.productById(id);
    }

    console.log('[URL CHEGANDO AQUI]', url);

    if (url.includes('/new')) {
      this.mode.set('create');
    }
    // else if (url.includes('/edit')) {
    //   this.mode.set('edit');
    //   this.loadMockProduct(id);
    // } else if (url.includes('/view') || (id && !url.includes('/duplicate'))) {
    //   this.mode.set('view');
    //   this.loadMockProduct(id);
    // } else if (url.includes('/duplicate')) {
    //   this.mode.set('duplicate');
    //   this.loadMockProduct(id);
    //   // Backend mandate rule for duplicate: clean internal_code automatically
    //   this.formInternalCode.set('');
    // }
  }

  productById(productId: string) {
    this.productService.getById(productId).subscribe({
      next: (response) => {
        console.log(response);
        // this.product = response;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  loadMockProduct(id: string | null): void {
    if (id) {
      console.log('Loading product data for ID:', id);
    }
    // Populate form with realistic data matching specification contract
    this.formName.set('Jogo de Pastilhas de Freio Dianteira');
    this.formInternalCode.set('REC-10029');
    this.formCategoryId.set('cat-01');
    this.formManufacturerId.set('m-01');
    this.formPartOriginId.set('po-01');
    this.formUnitId.set('u-02');
    this.formStatusId.set('st-01');
    this.formDescription.set(
      'Jogo de pastilhas de freio dianteiras de alta performance, compostas por massa cerâmica de baixo ruído e menor liberação de poeira nas rodas. Homologado para veículos de passeio leves.',
    );

    this.formWeight.set(1.45);
    this.formHeight.set(8.5);
    this.formWidth.set(12.0);
    this.formLength.set(18.0);

    this.formPrice.set(189.9);
    this.formPromotionalPrice.set(169.9);
    this.formPromotionStartDate.set('2026-07-01');
    this.formPromotionEndDate.set('2026-08-31');
    this.formWarehouseId.set('wh-01');
    this.formQuantity.set(45);
    this.formMinQuantity.set(10);
    this.formAllowBackorder.set(true);

    this.oemCodes.set([
      { id: 'oem-1', manufacturer: 'Volkswagen / Audi', oemCode: '5U0698151A', isPrimary: true },
      { id: 'oem-2', manufacturer: 'Bosch Global', oemCode: '0986BB0781', isPrimary: false },
    ]);

    this.productCodes.set([
      { id: 'pc-1', type: 'EAN-13', code: '7891234567890' },
      { id: 'pc-2', type: 'Código Fábrica', code: 'BOSCH-PAD-409' },
    ]);

    this.equivalentProducts.set([
      {
        id: 'eq-1',
        productName: 'Cobreq N-238 Pastilha Dianteira',
        notes: 'Equivalência direta 100%',
      },
      { id: 'eq-2', productName: 'Fras-le PD/102', notes: 'Linha alternativa mercado' },
    ]);

    this.vehicleApplications.set([
      {
        id: 'veh-1',
        brand: 'Volkswagen',
        model: 'Gol G5 / G6 / G7',
        version: '1.0 / 1.6 8V',
        engine: 'EA111 Flex',
        startYear: 2008,
        endYear: 2022,
      },
      {
        id: 'veh-2',
        brand: 'Volkswagen',
        model: 'Voyage',
        version: '1.6 8V Trend',
        engine: 'EA111 Flex',
        startYear: 2009,
        endYear: 2021,
      },
    ]);

    this.mediaImages.set([
      {
        id: 'img-1',
        url: 'https://picsum.photos/seed/brake_pads_1/400/300',
        name: 'pastilha_freio_frente.jpg',
        size: '1.2 MB',
        isPrimary: true,
        order: 1,
        status: 'completed',
        progress: 100,
      },
      {
        id: 'img-2',
        url: 'https://picsum.photos/seed/brake_pads_2/400/300',
        name: 'pastilha_freio_verso.jpg',
        size: '980 KB',
        isPrimary: false,
        order: 2,
        status: 'completed',
        progress: 100,
      },
    ]);

    this.suppliers.set([
      {
        id: 'sup-1',
        supplierName: 'Distribuidora Automotiva SP',
        supplierCode: 'SUP-BOSCH-882',
        purchasePrice: 112.5,
        leadTimeDays: 3,
        isPreferential: true,
      },
    ]);

    this.selectedTagIds.set(['tag-1', 'tag-2', 'tag-4']);

    this.productNotes.set([
      {
        id: 'note-1',
        type: 'Técnica',
        description: 'Pastilhas com mola antirruído inclusa no kit.',
        date: '27/07/2026',
        author: 'Engenharia de Produto',
      },
    ]);
  }

  setActiveTab(tab: FormTab): void {
    this.activeTab.set(tab);
  }

  tabClasses(tab: FormTab): string {
    const base =
      'pb-3 px-1 border-b-2 font-medium text-xs flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap';
    if (this.activeTab() === tab) {
      return `${base} border-[#4F8A6B] text-[#4F8A6B] font-semibold dark:text-[#5BAE6A] dark:border-[#5BAE6A]`;
    }
    return `${base} border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200`;
  }

  hasTabError(tab: FormTab): boolean {
    const errs = this.errors();
    if (tab === 'geral') {
      return !!(
        errs['name'] ||
        errs['internal_code'] ||
        errs['category_id'] ||
        errs['manufacturer_id'] ||
        errs['unit_id'] ||
        errs['status_id']
      );
    }
    if (tab === 'comercial') {
      return !!errs['price'];
    }
    return false;
  }

  updateField(field: string, val: string): void {
    this.isFormDirty.set(true);
    switch (field) {
      case 'name':
        this.formName.set(val);
        break;
      case 'internal_code':
        this.formInternalCode.set(val);
        break;
      case 'category_id':
        this.formCategoryId.set(val);
        break;
      case 'manufacturer_id':
        this.formManufacturerId.set(val);
        break;
      case 'part_origin_id':
        this.formPartOriginId.set(val);
        break;
      case 'unit_id':
        this.formUnitId.set(val);
        break;
      case 'status_id':
        this.formStatusId.set(val);
        break;
      case 'promotion_start_date':
        this.formPromotionStartDate.set(val);
        break;
      case 'promotion_end_date':
        this.formPromotionEndDate.set(val);
        break;
      case 'warehouse_id':
        this.formWarehouseId.set(val);
        break;
    }

    if (this.errors()[field]) {
      this.errors.update((e) => {
        const copy = { ...e };
        delete copy[field];
        return copy;
      });
    }
  }

  updateNumberField(field: string, valStr: string): void {
    this.isFormDirty.set(true);
    const num = parseFloat(valStr) || 0;
    switch (field) {
      case 'weight':
        this.formWeight.set(num);
        break;
      case 'height':
        this.formHeight.set(num);
        break;
      case 'width':
        this.formWidth.set(num);
        break;
      case 'length':
        this.formLength.set(num);
        break;
      case 'price':
        this.formPrice.set(num);
        break;
      case 'quantity':
        this.formQuantity.set(num);
        break;
      case 'min_quantity':
        this.formMinQuantity.set(num);
        break;
    }

    if (this.errors()[field]) {
      this.errors.update((e) => {
        const copy = { ...e };
        delete copy[field];
        return copy;
      });
    }
  }

  updateNullableNumberField(field: string, valStr: string): void {
    this.isFormDirty.set(true);
    const val = valStr.trim() === '' ? null : parseFloat(valStr);
    if (field === 'promotional_price') {
      this.formPromotionalPrice.set(val);
    }
  }

  onTextareaInput(event: Event): void {
    this.isFormDirty.set(true);
    const val = (event.target as HTMLTextAreaElement).value;
    this.formDescription.set(val);
  }

  toggleBackorder(): void {
    if (this.isReadOnly()) return;
    this.isFormDirty.set(true);
    this.formAllowBackorder.update((v) => !v);
  }

  // --- COMPATIBILIDADE COLLECTIONS ---
  openAddOemModal(): void {
    const code = prompt('Digite o Código OEM:');
    if (!code) return;
    const manufacturer = prompt('Digite o Fabricante/Montadora:', 'Volkswagen') || 'Montadora';
    this.oemCodes.update((list) => [
      ...list,
      {
        id: 'oem-' + Date.now(),
        manufacturer,
        oemCode: code.toUpperCase(),
        isPrimary: list.length === 0,
      },
    ]);
    this.isFormDirty.set(true);
  }

  setPrimaryOem(id: string): void {
    this.oemCodes.update((list) => list.map((o) => ({ ...o, isPrimary: o.id === id })));
    this.isFormDirty.set(true);
  }

  removeOemCode(id: string): void {
    this.oemCodes.update((list) => list.filter((o) => o.id !== id));
    this.isFormDirty.set(true);
  }

  openAddProductCodeModal(): void {
    const code = prompt('Digite o Código:');
    if (!code) return;
    const type = prompt('Digite o Tipo (Ex.: EAN-13, Código Fábrica):', 'EAN-13') || 'Geral';
    this.productCodes.update((list) => [...list, { id: 'pc-' + Date.now(), type, code }]);
    this.isFormDirty.set(true);
  }

  removeProductCode(id: string): void {
    this.productCodes.update((list) => list.filter((p) => p.id !== id));
    this.isFormDirty.set(true);
  }

  openAddEquivalentModal(): void {
    const name = prompt('Digite o Nome do Produto Equivalente:');
    if (!name) return;
    const notes = prompt('Observação de equivalência:', 'Compatibilidade direta') || '';
    this.equivalentProducts.update((list) => [
      ...list,
      { id: 'eq-' + Date.now(), productName: name, notes },
    ]);
    this.isFormDirty.set(true);
  }

  removeEquivalent(id: string): void {
    this.equivalentProducts.update((list) => list.filter((e) => e.id !== id));
    this.isFormDirty.set(true);
  }

  openAddVehicleModal(): void {
    const brand = prompt('Marca do Veículo:', 'Volkswagen') || 'Volkswagen';
    const model = prompt('Modelo:', 'Gol') || 'Modelo';
    const engine = prompt('Motorização:', '1.6 8V') || '1.0';
    this.vehicleApplications.update((list) => [
      ...list,
      {
        id: 'veh-' + Date.now(),
        brand,
        model,
        version: 'Flex',
        engine,
        startYear: 2015,
        endYear: 2022,
      },
    ]);
    this.isFormDirty.set(true);
  }

  removeVehicleApplication(id: string): void {
    this.vehicleApplications.update((list) => list.filter((v) => v.id !== id));
    this.isFormDirty.set(true);
  }

  // --- MÍDIA UPLOAD ---
  onDragOver(e: DragEvent): void {
    e.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(e: DragEvent): void {
    e.preventDefault();
    this.isDragging.set(false);
  }

  onFileDrop(e: DragEvent): void {
    e.preventDefault();
    this.isDragging.set(false);
    if (e.dataTransfer?.files) {
      this.handleFiles(Array.from(e.dataTransfer.files));
    }
  }

  onFileSelected(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
    }
  }

  handleFiles(files: File[]): void {
    files.forEach((file) => {
      if (file.size > 2 * 1024 * 1024) {
        this.toastService.error(
          'Arquivo Excede Limite',
          `O arquivo ${file.name} possui mais de 2 MB.`,
        );
        return;
      }

      const newImg: MediaImageItem = {
        id: 'img-' + Date.now() + Math.random().toString(36).substring(2, 5),
        url: URL.createObjectURL(file),
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        isPrimary: this.mediaImages().length === 0,
        order: this.mediaImages().length + 1,
        status: 'uploading',
        progress: 0,
      };

      this.mediaImages.update((list) => [...list, newImg]);
      this.simulateAsyncUpload(newImg.id);
    });
    this.isFormDirty.set(true);
  }

  simulateAsyncUpload(imgId: string): void {
    let prog = 0;
    const interval = setInterval(() => {
      prog += 25;
      this.mediaImages.update((list) =>
        list.map((img) => (img.id === imgId ? { ...img, progress: prog } : img)),
      );

      if (prog >= 100) {
        clearInterval(interval);
        this.mediaImages.update((list) =>
          list.map((img) => (img.id === imgId ? { ...img, status: 'completed' } : img)),
        );
      }
    }, 200);
  }

  setPrimaryImage(id: string): void {
    this.mediaImages.update((list) => list.map((img) => ({ ...img, isPrimary: img.id === id })));
    this.isFormDirty.set(true);
  }

  confirmDeleteImage(img: MediaImageItem): void {
    this.selectedImageForDelete.set(img);
    this.deleteImageDialogOpen.set(true);
  }

  executeDeleteImage(): void {
    const img = this.selectedImageForDelete();
    if (img) {
      this.mediaImages.update((list) => {
        const filtered = list.filter((i) => i.id !== img.id);
        if (img.isPrimary && filtered.length > 0) {
          filtered[0].isPrimary = true;
        }
        return filtered;
      });
      this.toastService.success('Imagem Removida', `${img.name} foi removida da galeria.`);
    }
    this.deleteImageDialogOpen.set(false);
  }

  // --- ADMINISTRAÇÃO COLLECTIONS ---
  openAddSupplierModal(): void {
    const name = prompt('Nome do Fornecedor:');
    if (!name) return;
    const code = prompt('Código no Fornecedor:', 'SUP-01') || 'SUP-01';
    this.suppliers.update((list) => [
      ...list,
      {
        id: 'sup-' + Date.now(),
        supplierName: name,
        supplierCode: code,
        purchasePrice: 100.0,
        leadTimeDays: 5,
        isPreferential: list.length === 0,
      },
    ]);
    this.isFormDirty.set(true);
  }

  removeSupplier(id: string): void {
    this.suppliers.update((list) => list.filter((s) => s.id !== id));
    this.isFormDirty.set(true);
  }

  isTagSelected(tagId: string): boolean {
    return this.selectedTagIds().includes(tagId);
  }

  toggleTag(tagId: string): void {
    if (this.isReadOnly()) return;
    this.isFormDirty.set(true);
    if (this.isTagSelected(tagId)) {
      this.selectedTagIds.update((ids) => ids.filter((id) => id !== tagId));
    } else {
      this.selectedTagIds.update((ids) => [...ids, tagId]);
    }
  }

  openAddNoteModal(): void {
    const desc = prompt('Descrição da Nota/Observação:');
    if (!desc) return;
    this.productNotes.update((list) => [
      ...list,
      {
        id: 'note-' + Date.now(),
        type: 'Geral',
        description: desc,
        date: new Date().toLocaleDateString('pt-BR'),
        author: 'Usuário do Sistema',
      },
    ]);
    this.isFormDirty.set(true);
  }

  removeNote(id: string): void {
    this.productNotes.update((list) => list.filter((n) => n.id !== id));
    this.isFormDirty.set(true);
  }

  // --- SAVE & VALIDATE ---
  validateForm(): boolean {
    const errs: Record<string, string> = {};

    if (!this.formName().trim()) {
      errs['name'] = 'O nome do produto é obrigatório.';
    }
    if (!this.formInternalCode().trim()) {
      errs['internal_code'] = 'O código interno é obrigatório.';
    }
    if (!this.formCategoryId()) {
      errs['category_id'] = 'Selecione uma categoria.';
    }
    if (!this.formManufacturerId()) {
      errs['manufacturer_id'] = 'Selecione um fabricante.';
    }
    if (!this.formUnitId()) {
      errs['unit_id'] = 'Selecione a unidade de medida.';
    }
    if (!this.formStatusId()) {
      errs['status_id'] = 'Selecione o status do produto.';
    }
    if (this.formPrice() <= 0) {
      errs['price'] = 'Informe um preço base válido superior a zero.';
    }

    this.errors.set(errs);

    if (Object.keys(errs).length > 0) {
      if (this.hasTabError('geral')) {
        this.activeTab.set('geral');
      } else if (this.hasTabError('comercial')) {
        this.activeTab.set('comercial');
      }
      return false;
    }

    return true;
  }

  saveProduct(continueEditing: boolean): void {
    if (!this.validateForm()) {
      this.toastService.error(
        'Não foi possível salvar o produto.',
        'Verifique os campos obrigatórios destacados.',
      );
      return;
    }

    this.isSaving.set(true);

    // Build backend JSON payload matching specification contract
    const payload = {
      name: this.formName(),
      internal_code: this.formInternalCode(),
      category_id: this.formCategoryId(),
      manufacturer_id: this.formManufacturerId(),
      part_origin_id: this.formPartOriginId() || null,
      unit_id: this.formUnitId(),
      status_id: this.formStatusId(),
      description: this.formDescription(),
      weight: this.formWeight(),
      height: this.formHeight(),
      width: this.formWidth(),
      length: this.formLength(),
      price: this.formPrice(),
      promotional_price: this.formPromotionalPrice(),
      promotion_start_date: this.formPromotionStartDate() || null,
      promotion_end_date: this.formPromotionEndDate() || null,
      warehouse_id: this.formWarehouseId(),
      quantity: this.formQuantity(),
      min_quantity: this.formMinQuantity(),
      allow_backorder: this.formAllowBackorder(),
      tag_ids: this.selectedTagIds(),
    };

    console.log('Sending Product Payload to Backend API:', payload);

    setTimeout(() => {
      this.isSaving.set(false);
      this.isFormDirty.set(false);
      this.toastService.success(
        'Produto salvo com sucesso.',
        'Todas as informações comerciais e técnicas foram salvas.',
      );

      if (!continueEditing) {
        this.router.navigate(['/catalog/products']);
      } else if (this.mode() === 'create' || this.mode() === 'duplicate') {
        this.mode.set('edit');
      }
    }, 600);
  }

  onCancel(): void {
    if (this.isFormDirty()) {
      this.unsavedChangesDialogOpen.set(true);
    } else {
      this.navigateBack();
    }
  }

  navigateBack(): void {
    this.router.navigate(['/catalog/products']);
  }

  executeExitWithoutSave(): void {
    this.unsavedChangesDialogOpen.set(false);
    this.navigateBack();
  }

  switchToEdit(): void {
    const id = this.route.snapshot.paramMap.get('id') || '1';
    this.router.navigate(['/catalog/products', id, 'edit']);
    this.mode.set('edit');
  }

  switchToDuplicate(): void {
    const id = this.route.snapshot.paramMap.get('id') || '1';
    this.router.navigate(['/catalog/products', id, 'duplicate']);
    this.mode.set('duplicate');
    this.formInternalCode.set('');
    this.toastService.info(
      'Modo Duplicar',
      'Código interno limpo automaticamente conforme regra do sistema.',
    );
  }

  confirmDeleteProduct(): void {
    this.deleteProductDialogOpen.set(true);
  }

  executeDeleteProduct(): void {
    this.deleteProductDialogOpen.set(false);
    this.toastService.success(
      'Produto Excluído',
      'O produto foi removido do catálogo com sucesso.',
    );
    this.router.navigate(['/catalog/products']);
  }
}
