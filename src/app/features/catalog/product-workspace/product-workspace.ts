import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { PageHeaderComponent } from '../../../design-system/page-header/page-header';
import { ButtonComponent } from '../../../design-system/button/button';
import { ConfirmDialogComponent } from '../../../design-system/dialog/confirm-dialog';
import { AppIconComponent } from '../../../design-system/icon/app-icon';
import { ProductGeneralTabComponent } from '../components/product-form/general-tab/general-tab';
import { ProductCommercialTabComponent } from '../components/product-form/commercial-tab/commercial-tab';
import { ProductInventoryTabComponent } from '../components/product-form/inventory-tab/inventory-tab';
import { ProductCompatibilityTabComponent } from '../components/product-form/compatibility-tab/compatibility-tab';
import { ProductMediaTabComponent } from '../components/product-form/media-tab/media-tab';
import { ProductAdministrationTabComponent } from '../components/product-form/administration-tab/administration-tab';
import { ProductWorkspaceSidebarComponent } from '../components/product-form/sidebar/product-workspace-sidebar';
import { ShellStateService } from '../../../core/services/shell-state';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../core/services/product-service';
import { CategoryService } from '../../../core/services/category-service';
import { ManufacturerService } from '../../../core/services/manufacture-service';
import { StatusService } from '../../../core/services/status-service';
import { ToastService } from '../../../core/services/toast';
import { PartOriginService } from '../../../core/services/part-origins-service';
import { AutocompleteOption } from '../../../design-system/autocomplete-select/autocomplete-select';
import { DSelectOption } from '../../../core/models/design-system/select-option.model';
import { GeneralOptionQuery } from '../../../core/models/generals/general-option-query.model';
import { ProductResponse } from '../../../core/models/products/product-response.model';
import { UpdateProductPayload } from '../../../core/models/products/product-request.model';
import { isCompatibilityWorkspaceTab } from '../../../core/config/compatibility-modules.config';
import { toProductGeneralFormData } from '../../../core/models/products/product-create.model';
import {
  defaultProductFormData,
  FormTab,
  MediaImageItem,
  ProductFormData,
  ProductWorkspaceMode,
} from '../models/product-workspace.model';

@Component({
  selector: 'app-product-workspace',
  standalone: true,
  imports: [
    PageHeaderComponent,
    ButtonComponent,
    ConfirmDialogComponent,
    AppIconComponent,
    ProductGeneralTabComponent,
    ProductCommercialTabComponent,
    ProductInventoryTabComponent,
    ProductCompatibilityTabComponent,
    ProductMediaTabComponent,
    ProductAdministrationTabComponent,
    ProductWorkspaceSidebarComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-workspace.html',
  styleUrl: './product-workspace.css',
})
export class ProductWorkspaceComponent implements OnInit {
  readonly shellState = inject(ShellStateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private manufacturerService = inject(ManufacturerService);
  private statusService = inject(StatusService);
  private toastService = inject(ToastService);
  private partOriginService = inject(PartOriginService);

  readonly mode = signal<ProductWorkspaceMode>('edit');
  readonly activeTab = signal<FormTab>('geral');
  readonly isSaving = signal<boolean>(false);
  readonly isDragging = signal<boolean>(false);
  readonly isFormDirty = signal<boolean>(false);
  readonly productCreatedSuccessBanner = signal<boolean>(false);

  readonly categoryLoading = signal<boolean>(false);
  readonly fetchedCategories = signal<AutocompleteOption[]>([]);
  readonly manufacturerLoading = signal<boolean>(false);
  readonly fetchedManufacturers = signal<AutocompleteOption[]>([]);
  readonly fetchedStatuses = signal<DSelectOption[]>([]);
  readonly fetchedPartOrigins = signal<DSelectOption[]>([]);

  readonly deleteProductDialogOpen = signal<boolean>(false);
  readonly unsavedChangesDialogOpen = signal<boolean>(false);
  readonly deleteImageDialogOpen = signal<boolean>(false);
  readonly selectedImageForDelete = signal<MediaImageItem | null>(null);
  readonly errors = signal<Record<string, string>>({});

  readonly productForm = signal<ProductFormData>(defaultProductFormData());

  readonly categoryOptions = computed<AutocompleteOption[]>(() => this.fetchedCategories());
  readonly manufacturerOptions = computed<AutocompleteOption[]>(() => this.fetchedManufacturers());
  readonly statusOptions = computed<DSelectOption[]>(() => this.fetchedStatuses());

  readonly generalForm = computed(() => toProductGeneralFormData(this.productForm()));

  readonly generalFormOptions = computed(() => ({
    categoryOptions: this.categoryOptions(),
    categoryLoading: this.categoryLoading(),
    manufacturerOptions: this.manufacturerOptions(),
    manufacturerLoading: this.manufacturerLoading(),
    partOriginOptions: this.fetchedPartOrigins(),
    unitOptions: this.unitOptions,
    statusOptions: this.statusOptions(),
  }));

  readonly isReadOnly = computed(() => this.mode() === 'view');

  readonly isCompatibilityTab = computed(() => isCompatibilityWorkspaceTab(this.activeTab()));

  readonly headerTitle = computed(() =>
    this.mode() === 'edit' ? 'Editar Produto' : 'Visualizar Produto',
  );

  readonly breadcrumbs = computed(() => [
    { label: 'Catálogo', route: '/catalog/products' },
    { label: 'Produtos', route: '/catalog/products' },
    { label: this.headerTitle() },
  ]);

  private queries: GeneralOptionQuery = {
    search: null,
    active: null,
    limit: null,
  };

  readonly unitOptions: DSelectOption[] = [
    { label: 'Jogo', value: 'jogo' },
    { label: 'Peça', value: 'peça' },
    { label: 'Par', value: 'par' },
    { label: 'Kit', value: 'kit' },
    { label: 'Litro', value: 'litro' },
    { label: 'Metro', value: 'metro' },
    { label: 'Rolo', value: 'rolo' },
    { label: 'Caixa', value: 'caixa' },
    { label: 'Conjunto', value: 'conjunto' },
  ];

  readonly warehouseOptions: DSelectOption[] = [
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

  ngOnInit(): void {
    const url = this.router.url;
    const id = this.route.snapshot.paramMap.get('id');

    this.productCreatedSuccessBanner.set(!!history.state?.['productJustCreated']);

    this.loadInitialOptions(this.queries);

    if (id) {
      this.mode.set(url.includes('/view') ? 'view' : 'edit');
      this.productById(id);
    }
  }

  loadInitialOptions(query: GeneralOptionQuery): void {
    this.categoryLoading.set(true);
    this.categoryService.getOptions(query).subscribe({
      next: (res) => {
        const opts: AutocompleteOption[] = (res.data || []).map((c) => ({
          label: c.label,
          value: c.id,
          sublabel: c.description,
          icon: c.icon || 'folder',
        }));
        this.fetchedCategories.set(opts);
        this.categoryLoading.set(false);
      },
      error: () => this.categoryLoading.set(false),
    });

    this.manufacturerLoading.set(true);
    this.manufacturerService.getOptions(query).subscribe({
      next: (res) => {
        const opts: AutocompleteOption[] = (res.data || []).map((m) => ({
          label: m.label,
          value: m.id,
          sublabel: m.description,
        }));
        this.fetchedManufacturers.set(opts);
        this.manufacturerLoading.set(false);
      },
      error: () => this.manufacturerLoading.set(false),
    });

    this.statusService.getOptions('PRODUCT').subscribe({
      next: (res) => {
        const opts: DSelectOption[] = (res.data || []).map((s) => ({
          label: s.label,
          value: s.id,
        }));
        this.fetchedStatuses.set(opts);
      },
    });

    this.partOriginService.getAll(this.queries).subscribe({
      next: (res) => {
        const opts: DSelectOption[] = (res.data || []).map((p) => ({
          label: p.name,
          value: p.id,
        }));
        this.fetchedPartOrigins.set(opts);
      },
    });
  }

  productById(productId: string): void {
    this.productService.getById(productId).subscribe({
      next: (response: ProductResponse) => this.populateForm(response),
      error: (error) => {
        console.error('Error loading product:', error);
        this.toastService.error('Erro', 'Não foi possível carregar os dados do produto.');
      },
    });
  }

  populateForm(prod: ProductResponse): void {
    const pricingObj = prod.pricing as unknown as Record<string, unknown> | undefined;
    const inventoryObj = prod.inventory as unknown as Record<string, unknown> | undefined;
    const rawPrice = prod['price'] as unknown as
      | {
          price?: number;
          promotional_price?: number;
          promotion_start?: string;
          promotion_end?: string;
        }
      | undefined;

    this.productForm.set({
      categoryId: prod.category?.id || (prod['category_id'] as string) || '',
      manufacturerId: prod.manufacturer?.id || (prod['manufacturer_id'] as string) || '',
      partOriginId: (prod['part_origin_id'] as string) || '',
      statusId: prod.status?.id || (prod['status_id'] as string) || 'st-01',
      internalCode: prod.internal_code || '',
      barcode: (prod['barcode'] as string) || '',

      name: prod.name || '',
      slug: prod.slug || '',
      shortDescription: (prod['short_description'] as string) || '',
      description: prod.description || '',

      weight: parseFloat(prod.weight as string) || 0,
      height: parseFloat(prod.height as string) || 0,
      width: parseFloat(prod.width as string) || 0,
      length: parseFloat(prod.length as string) || 0,
      unitId: (prod['unit'] || prod['unit_id'] || 'un') as string,

      featured: !!prod['featured'],
      active: prod['active'] !== undefined ? !!prod['active'] : true,

      price: prod.pricing?.regular_price || rawPrice?.price || 0,
      promotionalPrice: prod.pricing?.promotional_price || rawPrice?.promotional_price || null,
      promotionStartDate: prod.pricing?.promotion_start || rawPrice?.promotion_start || '',
      promotionEndDate: prod.pricing?.promotion_end || rawPrice?.promotion_end || '',
      isInvoiced:
        typeof pricingObj?.['is_invoiced'] === 'boolean' ? pricingObj['is_invoiced'] : true,

      warehouseId: (inventoryObj?.['warehouse_id'] as string) || 'wh-01',
      quantity: prod.inventory?.quantity || 0,
      minQuantity: prod.inventory?.minimum_quantity || 0,
      maxQuantity: prod.inventory?.maximum_quantity || null,
      allowBackorder: !!prod.inventory?.allow_backorder,

      oemCodes: (prod['oem_codes'] as ProductFormData['oemCodes']) || [],
      productCodes: (prod['product_codes'] as ProductFormData['productCodes']) || [],
      equivalentProducts:
        (prod['equivalent_products'] as ProductFormData['equivalentProducts']) || [],
      vehicleApplications:
        (prod['vehicle_applications'] as ProductFormData['vehicleApplications']) || [],
      mediaImages: (prod['media_images'] as ProductFormData['mediaImages']) || [],
      suppliers: (prod['suppliers'] as ProductFormData['suppliers']) || [],
      selectedTagIds: (prod['tags'] as string[]) || [],
      productNotes: (prod['notes'] as ProductFormData['productNotes']) || [],
    });
  }

  setActiveTab(tab: FormTab): void {
    this.activeTab.set(tab);
  }

  closeSuccessBanner(): void {
    this.productCreatedSuccessBanner.set(false);
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
      return !!(
        errs['price'] ||
        errs['promotional_price'] ||
        errs['promotion_start_date'] ||
        errs['promotion_end_date']
      );
    }
    if (tab === 'inventario') {
      return !!(
        errs['warehouse_id'] ||
        errs['quantity'] ||
        errs['min_quantity'] ||
        errs['max_quantity']
      );
    }
    return false;
  }

  updateField(field: string, val: string): void {
    this.isFormDirty.set(true);
    const fieldMapping: Record<string, keyof ProductFormData> = {
      name: 'name',
      internal_code: 'internalCode',
      internalCode: 'internalCode',
      barcode: 'barcode',
      category_id: 'categoryId',
      categoryId: 'categoryId',
      manufacturer_id: 'manufacturerId',
      manufacturerId: 'manufacturerId',
      part_origin_id: 'partOriginId',
      partOriginId: 'partOriginId',
      unit_id: 'unitId',
      unitId: 'unitId',
      status_id: 'statusId',
      statusId: 'statusId',
      slug: 'slug',
      short_description: 'shortDescription',
      shortDescription: 'shortDescription',
      promotion_start_date: 'promotionStartDate',
      promotion_end_date: 'promotionEndDate',
      warehouse_id: 'warehouseId',
    };
    const key = fieldMapping[field];
    if (key) {
      this.productForm.update((p) => ({ ...p, [key]: val }));
    }

    if (this.errors()[field]) {
      this.errors.update((e) => {
        const copy = { ...e };
        delete copy[field];
        return copy;
      });
    }
  }

  updateBooleanField(field: string, val: boolean): void {
    this.isFormDirty.set(true);
    if (field === 'active') {
      this.productForm.update((p) => ({ ...p, active: val }));
    } else if (field === 'featured') {
      this.productForm.update((p) => ({ ...p, featured: val }));
    }
  }

  updateNumberField(field: string, valStr: string): void {
    this.isFormDirty.set(true);
    const num = parseFloat(valStr) || 0;
    const fieldMapping: Record<string, keyof ProductFormData> = {
      weight: 'weight',
      height: 'height',
      width: 'width',
      length: 'length',
      price: 'price',
      quantity: 'quantity',
      min_quantity: 'minQuantity',
    };
    const key = fieldMapping[field];
    if (key) {
      this.productForm.update((p) => ({ ...p, [key]: num }));
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
      this.productForm.update((p) => ({ ...p, promotionalPrice: val }));
    } else if (field === 'max_quantity') {
      this.productForm.update((p) => ({ ...p, maxQuantity: val }));
    }
  }

  updateDescription(val: string): void {
    this.isFormDirty.set(true);
    this.productForm.update((p) => ({ ...p, description: val }));
  }

  toggleIsInvoiced(): void {
    if (this.isReadOnly()) return;
    this.isFormDirty.set(true);
    this.productForm.update((p) => ({ ...p, isInvoiced: !p.isInvoiced }));
  }

  toggleBackorder(): void {
    if (this.isReadOnly()) return;
    this.isFormDirty.set(true);
    this.productForm.update((p) => ({ ...p, allowBackorder: !p.allowBackorder }));
  }

  openAddOemModal(): void {
    const code = prompt('Digite o Código OEM:');
    if (!code) return;
    const manufacturer = prompt('Digite o Fabricante/Montadora:', 'Volkswagen') || 'Montadora';
    this.productForm.update((p) => ({
      ...p,
      oemCodes: [
        ...p.oemCodes,
        {
          id: 'oem-' + Date.now(),
          manufacturer,
          oemCode: code.toUpperCase(),
          isPrimary: p.oemCodes.length === 0,
        },
      ],
    }));
    this.isFormDirty.set(true);
  }

  setPrimaryOem(id: string): void {
    this.productForm.update((p) => ({
      ...p,
      oemCodes: p.oemCodes.map((o) => ({ ...o, isPrimary: o.id === id })),
    }));
    this.isFormDirty.set(true);
  }

  removeOemCode(id: string): void {
    this.productForm.update((p) => ({
      ...p,
      oemCodes: p.oemCodes.filter((o) => o.id !== id),
    }));
    this.isFormDirty.set(true);
  }

  toggleOemStatus(id: string): void {
    if (this.isReadOnly()) return;
    this.isFormDirty.set(true);
    this.productForm.update((p) => ({
      ...p,
      oemCodes: p.oemCodes.map((o) =>
        o.id === id ? { ...o, status: o.status === 'Ativo' ? 'Inativo' : 'Ativo' } : o,
      ),
    }));
  }

  openAddProductCodeModal(): void {
    const code = prompt('Digite o Código:');
    if (!code) return;
    const type = prompt('Digite o Tipo (Ex.: EAN-13, Código Fábrica):', 'EAN-13') || 'Geral';
    this.productForm.update((p) => ({
      ...p,
      productCodes: [...p.productCodes, { id: 'pc-' + Date.now(), type, code }],
    }));
    this.isFormDirty.set(true);
  }

  removeProductCode(id: string): void {
    this.productForm.update((p) => ({
      ...p,
      productCodes: p.productCodes.filter((pc) => pc.id !== id),
    }));
    this.isFormDirty.set(true);
  }

  toggleProductCodeStatus(id: string): void {
    if (this.isReadOnly()) return;
    this.isFormDirty.set(true);
    this.productForm.update((p) => ({
      ...p,
      productCodes: p.productCodes.map((pc) =>
        pc.id === id ? { ...pc, status: pc.status === 'Ativo' ? 'Inativo' : 'Ativo' } : pc,
      ),
    }));
  }

  openAddEquivalentModal(): void {
    const name = prompt('Digite o Nome do Produto Equivalente:');
    if (!name) return;
    const notes = prompt('Observação de equivalência:', 'Compatibilidade direta') || '';
    this.productForm.update((p) => ({
      ...p,
      equivalentProducts: [
        ...p.equivalentProducts,
        { id: 'eq-' + Date.now(), productName: name, notes },
      ],
    }));
    this.isFormDirty.set(true);
  }

  removeEquivalent(id: string): void {
    this.productForm.update((p) => ({
      ...p,
      equivalentProducts: p.equivalentProducts.filter((e) => e.id !== id),
    }));
    this.isFormDirty.set(true);
  }

  toggleEquivalentStatus(id: string): void {
    if (this.isReadOnly()) return;
    this.isFormDirty.set(true);
    this.productForm.update((p) => ({
      ...p,
      equivalentProducts: p.equivalentProducts.map((e) =>
        e.id === id ? { ...e, status: e.status === 'Ativo' ? 'Inativo' : 'Ativo' } : e,
      ),
    }));
  }

  openAddVehicleModal(): void {
    const brand = prompt('Marca do Veículo:', 'Volkswagen') || 'Volkswagen';
    const model = prompt('Modelo:', 'Gol') || 'Modelo';
    const engine = prompt('Motorização:', '1.6 8V') || '1.0';
    this.productForm.update((p) => ({
      ...p,
      vehicleApplications: [
        ...p.vehicleApplications,
        {
          id: 'veh-' + Date.now(),
          brand,
          model,
          version: 'Flex',
          engine,
          startYear: 2015,
          endYear: 2022,
        },
      ],
    }));
    this.isFormDirty.set(true);
  }

  removeVehicleApplication(id: string): void {
    this.productForm.update((p) => ({
      ...p,
      vehicleApplications: p.vehicleApplications.filter((v) => v.id !== id),
    }));
    this.isFormDirty.set(true);
  }

  toggleVehicleStatus(id: string): void {
    if (this.isReadOnly()) return;
    this.isFormDirty.set(true);
    this.productForm.update((p) => ({
      ...p,
      vehicleApplications: p.vehicleApplications.map((v) =>
        v.id === id ? { ...v, status: v.status === 'Ativo' ? 'Inativo' : 'Ativo' } : v,
      ),
    }));
  }

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

      const currentImages = this.productForm().mediaImages;
      const newImg: MediaImageItem = {
        id: 'img-' + Date.now() + Math.random().toString(36).substring(2, 5),
        url: URL.createObjectURL(file),
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        isPrimary: currentImages.length === 0,
        order: currentImages.length + 1,
        status: 'uploading',
        progress: 0,
      };

      this.productForm.update((p) => ({
        ...p,
        mediaImages: [...p.mediaImages, newImg],
      }));
      this.simulateAsyncUpload(newImg.id);
    });
    this.isFormDirty.set(true);
  }

  simulateAsyncUpload(imgId: string): void {
    let prog = 0;
    const interval = setInterval(() => {
      prog += 25;
      this.productForm.update((p) => ({
        ...p,
        mediaImages: p.mediaImages.map((img) =>
          img.id === imgId ? { ...img, progress: prog } : img,
        ),
      }));

      if (prog >= 100) {
        clearInterval(interval);
        this.productForm.update((p) => ({
          ...p,
          mediaImages: p.mediaImages.map((img) =>
            img.id === imgId ? { ...img, status: 'completed' } : img,
          ),
        }));
      }
    }, 200);
  }

  setPrimaryImage(id: string): void {
    this.productForm.update((p) => ({
      ...p,
      mediaImages: p.mediaImages.map((img) => ({ ...img, isPrimary: img.id === id })),
    }));
    this.isFormDirty.set(true);
  }

  confirmDeleteImage(img: MediaImageItem): void {
    this.selectedImageForDelete.set(img);
    this.deleteImageDialogOpen.set(true);
  }

  executeDeleteImage(): void {
    const img = this.selectedImageForDelete();
    if (img) {
      this.productForm.update((p) => {
        const filtered = p.mediaImages.filter((i) => i.id !== img.id);
        if (img.isPrimary && filtered.length > 0) {
          filtered[0] = { ...filtered[0], isPrimary: true };
        }
        return { ...p, mediaImages: filtered };
      });
      this.toastService.success('Imagem Removida', `${img.name} foi removida da galeria.`);
    }
    this.deleteImageDialogOpen.set(false);
  }

  openAddSupplierModal(): void {
    const name = prompt('Nome do Fornecedor:');
    if (!name) return;
    const code = prompt('Código no Fornecedor:', 'SUP-01') || 'SUP-01';
    this.productForm.update((p) => ({
      ...p,
      suppliers: [
        ...p.suppliers,
        {
          id: 'sup-' + Date.now(),
          supplierName: name,
          supplierCode: code,
          purchasePrice: 100.0,
          leadTimeDays: 5,
          isPreferential: p.suppliers.length === 0,
        },
      ],
    }));
    this.isFormDirty.set(true);
  }

  removeSupplier(id: string): void {
    this.productForm.update((p) => ({
      ...p,
      suppliers: p.suppliers.filter((s) => s.id !== id),
    }));
    this.isFormDirty.set(true);
  }

  setPreferentialSupplier(id: string): void {
    if (this.isReadOnly()) return;
    this.isFormDirty.set(true);
    this.productForm.update((p) => ({
      ...p,
      suppliers: p.suppliers.map((s) => ({ ...s, isPreferential: s.id === id })),
    }));
  }

  toggleSupplierStatus(id: string): void {
    if (this.isReadOnly()) return;
    this.isFormDirty.set(true);
    this.productForm.update((p) => ({
      ...p,
      suppliers: p.suppliers.map((s) =>
        s.id === id ? { ...s, status: s.status === 'Ativo' ? 'Inativo' : 'Ativo' } : s,
      ),
    }));
  }

  toggleTag(tagId: string): void {
    if (this.isReadOnly()) return;
    this.isFormDirty.set(true);
    this.productForm.update((p) => {
      const exists = p.selectedTagIds.includes(tagId);
      return {
        ...p,
        selectedTagIds: exists
          ? p.selectedTagIds.filter((id) => id !== tagId)
          : [...p.selectedTagIds, tagId],
      };
    });
  }

  openAddNoteModal(): void {
    const desc = prompt('Descrição da Nota/Observação:');
    if (!desc) return;
    this.productForm.update((p) => ({
      ...p,
      productNotes: [
        ...p.productNotes,
        {
          id: 'note-' + Date.now(),
          type: 'Geral',
          description: desc,
          date: new Date().toLocaleDateString('pt-BR'),
          author: 'Usuário do Sistema',
        },
      ],
    }));
    this.isFormDirty.set(true);
  }

  removeNote(id: string): void {
    this.productForm.update((p) => ({
      ...p,
      productNotes: p.productNotes.filter((n) => n.id !== id),
    }));
    this.isFormDirty.set(true);
  }

  toggleNoteStatus(id: string): void {
    if (this.isReadOnly()) return;
    this.isFormDirty.set(true);
    this.productForm.update((p) => ({
      ...p,
      productNotes: p.productNotes.map((n) =>
        n.id === id ? { ...n, status: n.status === 'Ativo' ? 'Inativo' : 'Ativo' } : n,
      ),
    }));
  }

  onCategorySearch(query: GeneralOptionQuery): void {
    this.categoryLoading.set(true);
    this.categoryService.getOptions(query).subscribe({
      next: (res) => {
        const opts: AutocompleteOption[] = (res.data || []).map((c) => ({
          label: c.label,
          value: c.id,
          sublabel: c.description,
          icon: c.icon || 'folder',
        }));
        this.fetchedCategories.set(opts);
        this.categoryLoading.set(false);
      },
      error: () => this.categoryLoading.set(false),
    });
  }

  onManufacturerSearch(query: GeneralOptionQuery): void {
    this.manufacturerLoading.set(true);
    this.manufacturerService.getOptions(query).subscribe({
      next: (res) => {
        const opts: AutocompleteOption[] = (res.data || []).map((m) => ({
          label: m.label,
          value: m.id,
          sublabel: m.description,
        }));
        this.fetchedManufacturers.set(opts);
        this.manufacturerLoading.set(false);
      },
      error: () => this.manufacturerLoading.set(false),
    });
  }

  validateForm(): boolean {
    const errs: Record<string, string> = {};
    const p = this.productForm();

    if (!p.name.trim()) {
      errs['name'] = 'O nome do produto é obrigatório.';
    }
    if (!p.internalCode.trim()) {
      errs['internal_code'] = 'O código interno é obrigatório.';
    }
    if (!p.categoryId) {
      errs['category_id'] = 'Selecione uma categoria.';
    }
    if (!p.manufacturerId) {
      errs['manufacturer_id'] = 'Selecione um fabricante.';
    }
    if (!p.unitId) {
      errs['unit_id'] = 'Selecione a unidade de medida.';
    }
    if (p.price <= 0) {
      errs['price'] = 'O preço base deve ser maior que zero.';
    }

    this.errors.set(errs);

    if (Object.keys(errs).length > 0) {
      if (this.hasTabError('geral')) {
        this.activeTab.set('geral');
      } else if (this.hasTabError('comercial')) {
        this.activeTab.set('comercial');
      } else if (this.hasTabError('inventario')) {
        this.activeTab.set('inventario');
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

    const id = this.route.snapshot.paramMap.get('id');
    const p = this.productForm();

    const payload = {
      category_id: p.categoryId,
      manufacturer_id: p.manufacturerId,
      part_origin_id: p.partOriginId,
      status_id: p.statusId,
      internal_code: p.internalCode,
      barcode: p.barcode,

      name: p.name,
      slug: p.slug,
      short_description: p.shortDescription,
      description: p.description,

      weight: p.weight,
      height: p.height,
      width: p.width,
      length: p.length,
      unit: p.unitId,

      featured: p.featured,
      active: p.active,

      price: {
        price: p.price,
        promotional_price: p.promotionalPrice,
        promotion_start: p.promotionStartDate,
        promotion_end: p.promotionEndDate,
      },
      pricing: {
        regular_price: p.price,
        promotional_price: p.promotionalPrice,
        promotion_start: p.promotionStartDate,
        promotion_end: p.promotionEndDate,
        is_invoiced: p.isInvoiced,
      },
      inventory: {
        warehouse_id: p.warehouseId,
        quantity: p.quantity,
        minimum_quantity: p.minQuantity,
        maximum_quantity: p.maxQuantity,
        allow_backorder: p.allowBackorder,
      },
      oem_codes: p.oemCodes,
      product_codes: p.productCodes,
      equivalent_products: p.equivalentProducts,
      vehicle_applications: p.vehicleApplications,
      suppliers: p.suppliers,
      tags: p.selectedTagIds,
      notes: p.productNotes,
    };

    this.productService.update(id!, payload as UpdateProductPayload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.isFormDirty.set(false);
        this.toastService.success(
          'Produto salvo com sucesso.',
          'Informações atualizadas no sistema.',
        );

        if (!continueEditing) {
          this.router.navigate(['/catalog/products']);
        }
      },
      error: (err) => {
        this.isSaving.set(false);
        console.error('Error saving product:', err);
        this.toastService.error(
          'Erro ao salvar o produto',
          err.error?.message || err.message || 'Ocorreu um erro inesperado no servidor.',
        );
      },
    });
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

  confirmDeleteProduct(): void {
    this.deleteProductDialogOpen.set(true);
  }

  executeDeleteProduct(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productService.delete(id).subscribe({
        next: () => {
          this.deleteProductDialogOpen.set(false);
          this.toastService.success(
            'Produto Excluído',
            'O produto foi removido do catálogo com sucesso.',
          );
          this.router.navigate(['/catalog/products']);
        },
        error: () => {
          this.deleteProductDialogOpen.set(false);
          this.toastService.error('Erro', 'Não foi possível excluir o produto.');
        },
      });
    } else {
      this.deleteProductDialogOpen.set(false);
      this.navigateBack();
    }
  }
}
