import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Location } from '@angular/common';
import { PageHeaderComponent } from '../../../design-system/page-header/page-header';
import { ButtonComponent } from '../../../design-system/button/button';
import { ConfirmDialogComponent } from '../../../design-system/dialog/confirm-dialog';
import { AppIconComponent } from '../../../design-system/icon/app-icon';
import { ProductGeneralTabComponent } from '../components/product-form/general-tab/general-tab';
import { ProductCommercialTabComponent } from '../components/product-form/commercial-tab/commercial-tab';
import { ProductInventoryTabComponent } from '../components/product-form/inventory-tab/inventory-tab';
import { ProductCompatibilityTabComponent } from '../components/product-form/compatibility-tab/compatibility-tab';
import { ProductWorkspaceSidebarComponent } from '../components/product-form/sidebar/product-workspace-sidebar';
import { ShellStateService } from '../../../core/services/shell-state';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../core/services/product-service';
import { ToastService } from '../../../core/services/toast';
import { GeneralOptionQuery } from '../../../core/models/generals/general-option-query.model';
import { ProductResponse } from '../../../core/models/products/product-response.model';
import {
  UpdateProductPayload,
  mapResponseToPayload,
  defaultUpdatePayload,
  UpdateProductInventoryPayload,
} from '../../../core/models/products/product-request.model';
import { isCompatibilityWorkspaceTab } from '../../../core/config/compatibility-modules.config';
import { ProductGeneralFormData } from '../../../core/models/products/product-create.model';
import { FormTab, MediaImageItem, ProductWorkspaceMode } from '../models/product-workspace.model';
import { initialProductPayload } from '../../../core/utils/product-initial-payload';
import { OemCodeService } from '../../../core/services/code-oem-service';
import { ManufacturerOption } from '../../../core/models/manufactureres/manufaturer-options.model';
import { OemCode } from '../../../core/models/oem-codes/oem-codes.model';
import { ProductByIdService } from '../../../core/services/product-by-id-service';
import { StatusStore } from '../../../core/store/status-store/status-store';
import { CategoryStore } from '../../../core/store/category-store/category-store';
import { UnitSaleStore } from '../../../core/store/unit-sale/unit-sale-store';
import { WarehouseStore } from '../../../core/store/warehouse/warehouse-store';
import { ManufacturerStore } from '../../../core/store/manufacturer-store/manufacturer-store';
import { PartOriginStore } from '../../../core/store/part-origin/part-origin-store';

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
    ProductWorkspaceSidebarComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-workspace.html',
  styleUrl: './product-workspace.css',
})
export class ProductWorkspaceComponent implements OnInit {
  private router = inject(Router);
  private location = inject(Location);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);
  readonly shellState = inject(ShellStateService);
  private productService = inject(ProductService);
  private oemCodeService = inject(OemCodeService);
  private productByIdService = inject(ProductByIdService);

  readonly statusStore = inject(StatusStore);
  readonly categoryStore = inject(CategoryStore);
  readonly unitSaleStore = inject(UnitSaleStore);
  readonly warehouseStore = inject(WarehouseStore);
  readonly partOriginStore = inject(PartOriginStore);
  readonly manufacturerStore = inject(ManufacturerStore);

  readonly activeTab = signal<FormTab>('geral');
  readonly mode = signal<ProductWorkspaceMode>('edit');

  readonly isSaving = signal<boolean>(false);
  readonly isDragging = signal<boolean>(false);
  readonly isFormDirty = signal<boolean>(false);
  readonly deleteImageDialogOpen = signal<boolean>(false);
  readonly deleteProductDialogOpen = signal<boolean>(false);
  readonly unsavedChangesDialogOpen = signal<boolean>(false);
  readonly productCreatedSuccessBanner = signal<boolean>(false);

  readonly oemCodeIds = signal<string[]>([]);
  readonly errors = signal<Record<string, string>>({});

  readonly manufacturers = signal<ManufacturerOption[]>([]);
  readonly manufacturersByProduct = signal<OemCode[]>([]);
  readonly selectedImageForDelete = signal<MediaImageItem | null>(null);

  readonly product = signal<ProductResponse>(initialProductPayload);
  readonly productForm = signal<UpdateProductPayload>(defaultUpdatePayload());

  readonly currentStatus = computed(() => this.product()?.status ?? null);

  readonly generalForm = computed<ProductGeneralFormData>(() => {
    const p = this.productForm();
    return {
      name: p.name || '',
      slug: p.slug || '',
      short_description: p.short_description || '',
      description: p.description || '',
      category_id: p.category_id || '',
      manufacturer_id: p.manufacturer_id || '',
      part_origin_id: p.part_origin_id || '',
      status_id: p.status_id || '',
      internal_code: p.internal_code || '',
      barcode: p.barcode || '',
      unit_id: p.unit_id || '',
      weight: p.weight || 0,
      height: p.height || 0,
      width: p.width || 0,
      length: p.length || 0,
      featured: !!p.featured,
      active: p.active !== undefined ? !!p.active : true,
    };
  });

  readonly generalFormOptions = computed(() => ({
    unitOptions: this.unitSaleStore.optionList(),
    statusOptions: this.statusStore.optionList(),
    categoryOptions: this.categoryStore.optionList(),
    warehouseOptions: this.warehouseStore.optionList(),
    partOriginOptions: this.partOriginStore.optionList(),
    manufacturerOptions: this.manufacturerStore.optionList(),
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
    per_page: null,
    page: null,
    manufacturer_id: null,
  };

  readonly availableTags = [];

  ngOnInit(): void {
    const url = this.router.url;
    const id = this.route.snapshot.paramMap.get('id');
    const state = this.location.getState() as any;

    this.productCreatedSuccessBanner.set(!!state?.['productJustCreated']);

    setTimeout(() => {
      this.queries.per_page = 10;
      this.queries.page = 1;
      this.getOemCodeByManufacturer(this.queries);
    }, 100);

    if (id) {
      this.mode.set(url.includes('/view') ? 'view' : 'edit');
      this.productById(id);
    }
  }

  getOemCodeByManufacturer(query: GeneralOptionQuery) {
    this.oemCodeService.getByManufacturer(query).subscribe({
      next: (response) => {
        const codes = response.data || [];
        this.manufacturersByProduct.set(codes);
      },
      error: (err) => {
        this.manufacturersByProduct.set([]);
        this.toastService.error('Erro', err.error.data.messsage);
      },
    });
  }

  productById(productId: string): void {
    this.productByIdService.getProduct(productId).subscribe({
      next: (prodData) => {
        this.oemCodeIds.set(prodData.oem_codes.map((o) => o.id));
        this.product.set(prodData);
        this.productForm.set(mapResponseToPayload(prodData));
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.toastService.error('Erro', 'Não foi possível carregar os dados do produto.');
      },
    });
  }

  setActiveTab(tab: FormTab): void {
    console.log('tab', tab);
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
        errs['unit_id']
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
    const fieldMapping: Record<string, keyof UpdateProductPayload> = {
      name: 'name',
      internal_code: 'internal_code',
      barcode: 'barcode',
      category_id: 'category_id',
      manufacturer_id: 'manufacturer_id',
      part_origin_id: 'part_origin_id',
      unit_id: 'unit_id',
      status_id: 'status_id',
      slug: 'slug',
      short_description: 'short_description',
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
    const fieldMapping: Record<string, keyof UpdateProductPayload> = {
      weight: 'weight',
      height: 'height',
      width: 'width',
      length: 'length',
    };
    const key = fieldMapping[field];
    if (key) {
      this.productForm.update((p) => ({ ...p, [key]: num }));
    } else if (field === 'price') {
      this.productForm.update((p) => ({
        ...p,
        price: {
          ...(p.price || {}),
          price: num,
        },
      }));
    } else if (field === 'quantity') {
      this.updateInventoryField('quantity', num);
    } else if (field === 'min_quantity') {
      this.updateInventoryField('minimum_quantity', num);
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
      this.productForm.update((p) => ({
        ...p,
        price: {
          ...(p.price || {}),
          promotional_price: val,
        },
      }));
    } else if (field === 'max_quantity') {
      this.updateInventoryField('maximum_quantity', val);
    }
  }

  private updateInventoryField(key: string, val: any): void {
    this.productForm.update((p) => {
      const invs = p.inventories || [];
      const first = invs[0] || { warehouse_id: '', quantity: 0 };
      return {
        ...p,
        inventories: [
          {
            ...first,
            [key]: val,
          },
        ],
      };
    });
    console.log('[this.productForm()] ', this.productForm());
  }

  updateDescription(val: string): void {
    this.isFormDirty.set(true);
    this.productForm.update((p) => ({ ...p, description: val }));
  }

  toggleIsInvoiced(): void {
    // Não suportado diretamente no payload, mas mantido se necessário localmente.
  }

  onInventoriesChange(inventories: UpdateProductInventoryPayload[]): void {
    this.isFormDirty.set(true);
    this.productForm.update((p) => ({ ...p, inventories }));
    if (this.errors()['inventories']) {
      this.errors.update((e) => {
        const copy = { ...e };
        delete copy['inventories'];
        return copy;
      });
    }
  }

  toggleBackorder(): void {
    if (this.isReadOnly()) return;
    this.isFormDirty.set(true);
    this.productForm.update((p) => {
      const invs = p.inventories || [];
      const first = invs[0] || { warehouse_id: '', quantity: 0 };
      return {
        ...p,
        inventories: [
          {
            ...first,
            allow_backorder: !first.allow_backorder,
          },
        ],
      };
    });
  }

  openAddOemModal(): void {
    const newId = 'oem-' + Date.now();

    this.product.update((p) => ({
      ...p,
      oem_codes: p.oem_codes,
    }));

    this.productForm.update((pf) => ({
      ...pf,
      oem_code_ids: [newId, ...(pf.oem_code_ids || this.product().oem_codes.map((o) => o.id))],
    }));

    this.isFormDirty.set(true);
  }

  setPrimaryOem(id: string): void {
    this.product.update((p) => ({
      ...p,
      oem_codes: p.oem_codes.map((o) => ({ ...o, is_primary: o.id === id })),
    }));
    this.isFormDirty.set(true);
  }

  removeOemCode(id: string): void {
    this.product.update((p) => ({
      ...p,
      oem_codes: p.oem_codes.filter((o) => o.id !== id),
    }));

    this.productForm.update((pf) => ({
      ...pf,
      oem_code_ids: (pf.oem_code_ids || this.product().oem_codes.map((o) => o.id)).filter(
        (oId) => oId !== id,
      ),
    }));

    this.isFormDirty.set(true);
  }

  toggleOemStatus(id: string): void {
    console.log(id);
    // No backend, o status do OEM é atualizado individualmente
  }

  openAddProductCodeModal(): void {
    const code = prompt('Digite o Código:');
    if (!code) return;
    const type = prompt('Digite o Tipo (Ex.: EAN-13, Código Fábrica):', 'EAN-13') || 'Geral';

    const newId = 'pc-' + Date.now();
    const newCode = { id: newId, type, code, active: true };

    this.product.update((p) => ({
      ...p,
      codes: [...p.codes, newCode],
    }));

    this.productForm.update((pf) => ({
      ...pf,
      product_code_ids: [...(pf.product_code_ids || this.product().codes.map((c) => c.id)), newId],
    }));

    this.isFormDirty.set(true);
  }

  removeProductCode(id: string): void {
    this.product.update((p) => ({
      ...p,
      codes: p.codes.filter((pc) => pc.id !== id),
    }));

    this.productForm.update((pf) => ({
      ...pf,
      product_code_ids: (pf.product_code_ids || this.product().codes.map((c) => c.id)).filter(
        (pcId) => pcId !== id,
      ),
    }));

    this.isFormDirty.set(true);
  }

  toggleProductCodeStatus(id: string): void {
    console.log(id);
    // No backend
  }

  openAddEquivalentModal(): void {
    const name = prompt('Digite o Nome do Produto Equivalente:');
    if (!name) return;
    const notes = prompt('Observação de equivalência:', 'Compatibilidade direta') || '';

    const newId = 'eq-' + Date.now();
    const newEquivalent = {
      id: newId,
      observation: notes,
      product: { id: '', name: '', slug: '' },
      equivalent_product: { id: newId, name, slug: '' },
    };

    this.product.update((p) => ({
      ...p,
      equivalents: [...p.equivalents, newEquivalent],
    }));

    this.productForm.update((pf) => ({
      ...pf,
      equivalent_product_ids: [
        ...(pf.equivalent_product_ids || this.product().equivalents.map((e) => e.id)),
        newId,
      ],
    }));

    this.isFormDirty.set(true);
  }

  removeEquivalent(id: string): void {
    this.product.update((p) => ({
      ...p,
      equivalents: p.equivalents.filter((e) => e.id !== id),
    }));

    this.productForm.update((pf) => ({
      ...pf,
      equivalent_product_ids: (
        pf.equivalent_product_ids || this.product().equivalents.map((e) => e.id)
      ).filter((eqId) => eqId !== id),
    }));

    this.isFormDirty.set(true);
  }

  toggleEquivalentStatus(id: string): void {
    console.log(id);
    // No backend
  }

  openAddVehicleModal(): void {
    const brand = prompt('Marca do Veículo:', 'Volkswagen') || 'Volkswagen';
    const model = prompt('Modelo:', 'Gol') || 'Modelo';
    const engine = prompt('Motorização:', '1.6 8V') || '1.0';

    const newId = 'veh-' + Date.now();
    const newApplication = {
      id: newId,
      manufacturer: { id: '', name: brand, slug: '' },
      model,
      year_from: 2015,
      year_to: 2022,
      engine,
      details: 'Flex',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.product.update((p) => ({
      ...p,
      applications: [...p.applications, newApplication],
    }));

    this.productForm.update((pf) => ({
      ...pf,
      application_ids: [
        ...(pf.application_ids || this.product().applications.map((a) => a.id)),
        newId,
      ],
    }));

    this.isFormDirty.set(true);
  }

  removeVehicleApplication(id: string): void {
    this.product.update((p) => ({
      ...p,
      applications: p.applications.filter((v) => v.id !== id),
    }));

    this.productForm.update((pf) => ({
      ...pf,
      application_ids: (pf.application_ids || this.product().applications.map((a) => a.id)).filter(
        (aId) => aId !== id,
      ),
    }));

    this.isFormDirty.set(true);
  }

  toggleVehicleStatus(id: string): void {
    console.log(id);
    // No backend
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
    console.log(files);
    // Media handling
  }

  confirmDeleteImage(img: MediaImageItem): void {
    this.selectedImageForDelete.set(img);
    this.deleteImageDialogOpen.set(true);
  }

  executeDeleteImage(): void {
    this.deleteImageDialogOpen.set(false);
  }

  openAddSupplierModal(): void {
    const name = prompt('Nome do Fornecedor:');
    if (!name) return;
    const code = prompt('Código no Fornecedor:', 'SUP-01') || 'SUP-01';

    const newId = 'sup-' + Date.now();
    const newSupplier = {
      id: newId,
      supplier_name: name,
      supplier_code: code,
      pivot: {
        purchase_price: '100.00',
        lead_time_days: 5,
        is_preferential: this.product().suppliers.length === 0,
      },
    } as any;

    this.product.update((p) => ({
      ...p,
      suppliers: [...p.suppliers, newSupplier],
    }));

    this.productForm.update((pf) => ({
      ...pf,
      supplier_ids: [...(pf.supplier_ids || this.product().suppliers.map((s) => s.id)), newId],
    }));

    this.isFormDirty.set(true);
  }

  removeSupplier(id: string): void {
    this.product.update((p) => ({
      ...p,
      suppliers: p.suppliers.filter((s) => s.id !== id),
    }));

    this.productForm.update((pf) => ({
      ...pf,
      supplier_ids: (pf.supplier_ids || this.product().suppliers.map((s) => s.id)).filter(
        (sId) => sId !== id,
      ),
    }));

    this.isFormDirty.set(true);
  }

  setPreferentialSupplier(id: string): void {
    this.product.update((p) => ({
      ...p,
      suppliers: p.suppliers.map((s) => ({
        ...s,
        preferred: s.id === id,
      })),
    }));
    this.isFormDirty.set(true);
  }

  toggleSupplierStatus(id: string): void {
    console.log(id);
    // No backend
  }

  toggleTag(tagId: string): void {
    if (this.isReadOnly()) return;
    this.isFormDirty.set(true);

    this.product.update((p) => {
      const exists = p.tags.some((t) => t.id === tagId);
      return {
        ...p,
        tags: exists
          ? p.tags.filter((t) => t.id !== tagId)
          : [...p.tags, { id: tagId, name: '' } as any],
      };
    });

    this.productForm.update((pf) => {
      const currentTags = pf.tag_ids || this.product().tags.map((t) => t.id);
      const exists = currentTags.includes(tagId);
      return {
        ...pf,
        tag_ids: exists ? currentTags.filter((id) => id !== tagId) : [...currentTags, tagId],
      };
    });
  }

  // openAddNoteModal(): void {}

  // removeNote(id: string): void {}

  // toggleNoteStatus(id: string): void {}

  onCategorySearch(query: GeneralOptionQuery): void {
    this.categoryStore.loadOptions(query);
  }

  onManufacturerSearch(query: GeneralOptionQuery): void {
    this.manufacturerStore.loadOptions(query);
  }

  // onCategorySearch(query: GeneralOptionQuery): void {
  //   this.categoryLoading.set(true);
  //   this.categoryStore.loadOptions(query).subscribe({
  //     next: (res) => {
  //       const opts: AutocompleteOption[] = (res.data || []).map((c) => ({
  //         label: c.label,
  //         value: c.id,
  //         sublabel: c.description,
  //         icon: c.icon || 'folder',
  //       }));
  //       this.fetchedCategories.set(opts);
  //       this.categoryLoading.set(false);
  //     },
  //     error: () => this.categoryLoading.set(false),
  //   });
  // }

  // onManufacturerSearch(query: GeneralOptionQuery): void {
  //   this.manufacturerLoading.set(true);
  //   this.manufacturerService.getOptions(query).subscribe({
  //     next: (res) => {
  //       const opts: AutocompleteOption[] = (res.data || []).map((m) => ({
  //         label: m.label,
  //         value: m.id,
  //         sublabel: m.description,
  //       }));
  //       this.fetchedManufacturers.set(opts);
  //       this.manufacturerLoading.set(false);
  //     },
  //     error: () => this.manufacturerLoading.set(false),
  //   });
  // }

  validateForm(): boolean {
    const errs: Record<string, string> = {};
    const p = this.productForm();

    if (!p.name?.trim()) {
      errs['name'] = 'O nome do produto é obrigatório.';
    }
    if (!p.internal_code?.trim()) {
      errs['internal_code'] = 'O código interno é obrigatório.';
    }
    if (!p.category_id) {
      errs['category_id'] = 'Selecione uma categoria.';
    }
    if (!p.manufacturer_id) {
      errs['manufacturer_id'] = 'Selecione um fabricante.';
    }
    if (!p.unit_id) {
      errs['unit_id'] = 'Selecione a unidade de medida.';
    }

    this.errors.set(errs);

    if (Object.keys(errs).length > 0) {
      if (this.hasTabError('geral')) {
        this.activeTab.set('geral');
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
    const payload = this.productForm();

    // console.log('[SAVE PRODUCT UPDATE]', payload);
    // return;

    this.productService.update(id!, payload).subscribe({
      next: (response) => {
        this.isSaving.set(false);
        this.isFormDirty.set(false);
        this.toastService.success(response.message, 'Informações atualizadas no sistema.');

        const prodData = response.data || response;
        this.product.set(prodData);
        this.productForm.set(mapResponseToPayload(prodData));

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

  onOemFiltersChange(filters: GeneralOptionQuery): void {
    console.log('filters', filters);
    this.getOemCodeByManufacturer(filters);
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
