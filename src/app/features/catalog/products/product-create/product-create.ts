import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { PageHeaderComponent } from '../../../../design-system/page-header/page-header';
import { ButtonComponent } from '../../../../design-system/button/button';
import { ConfirmDialogComponent } from '../../../../design-system/dialog/confirm-dialog';
import { ProductGeneralTabComponent } from '../product-form/general-tab/general-tab';
import { ProductCreateStepperComponent } from '../product-form/stepper/product-create-stepper';
import { CategoryService } from '../../../../core/services/category-service';
import { ManufacturerService } from '../../../../core/services/manufacture-service';
import { WarehouseService } from '../../../../core/services/warehouse-service';
import { ProductService } from '../../../../core/services/product-service';
import { ToastService } from '../../../../core/services/toast';
import { SelectOption } from '../../../../core/models/design-system/select-option.model';
import { GeneralOptionQuery } from '../../../../core/models/generals/general-option-query.model';
import {
  createFormToGeneralSource,
  defaultProductCreateFormState,
  ProductCreateFormState,
  toCreateProductPayload,
  toProductGeneralFormData,
} from '../../../../core/models/products/product-create.model';
import { PartOriginService } from '../../../../core/services/part-origins-service';
import { UnitSaleService } from '../../../../core/services/unit-sale-service';
import { AutocompleteOption } from '../../../../core/models/design-system/auto-complete.model';
import { StatusStore } from '../../../../core/store/status-store/status-store';
import { CategoryStore } from '../../../../core/store/category-store/category-store';
import { UnitSaleStore } from '../../../../core/store/unit-sale/unit-sale-store';
import { WarehouseStore } from '../../../../core/store/warehouse/warehouse-store';
import { PartOriginStore } from '../../../../core/store/part-origin/part-origin-store';
import { ManufacturerStore } from '../../../../core/store/manufacturer-store/manufacturer-store';

@Component({
  selector: 'app-product-create',
  standalone: true,
  imports: [
    PageHeaderComponent,
    ButtonComponent,
    ConfirmDialogComponent,
    ProductGeneralTabComponent,
    ProductCreateStepperComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-create.html',
})
export class ProductCreateComponent implements OnInit {
  private router = inject(Router);
  private productService = inject(ProductService);
  private unitSaleService = inject(UnitSaleService);
  private categoryService = inject(CategoryService);
  private warehouseService = inject(WarehouseService);
  private partOriginService = inject(PartOriginService);
  private manufacturerService = inject(ManufacturerService);
  private toastService = inject(ToastService);

  readonly createStep = signal<number>(1);
  readonly isSaving = signal<boolean>(false);
  readonly isFormDirty = signal<boolean>(false);
  readonly unsavedChangesDialogOpen = signal<boolean>(false);
  readonly errors = signal<Record<string, string>>({});

  readonly createForm = signal<ProductCreateFormState>(defaultProductCreateFormState());

  readonly categoryLoading = signal<boolean>(false);
  readonly fetchedCategories = signal<AutocompleteOption[]>([]);
  readonly manufacturerLoading = signal<boolean>(false);
  readonly fetchedManufacturers = signal<Partial<AutocompleteOption>[]>([]);
  readonly fetchedPartOrigins = signal<SelectOption[]>([]);

  readonly statusStore = inject(StatusStore);
  readonly categoryStore = inject(CategoryStore);
  readonly unitSaleStore = inject(UnitSaleStore);
  readonly warehouseStore = inject(WarehouseStore);
  readonly partOriginStore = inject(PartOriginStore);
  readonly manufacturerStore = inject(ManufacturerStore);

  readonly generalForm = computed(() =>
    toProductGeneralFormData(createFormToGeneralSource(this.createForm())),
  );

  readonly generalFormOptions = computed(() => ({
    unitOptions: this.unitSaleStore.optionList(),
    statusOptions: this.statusStore.optionList(),
    categoryOptions: this.categoryStore.optionList(),
    warehouseOptions: this.warehouseStore.optionList(),
    partOriginOptions: this.partOriginStore.optionList(),
    manufacturerOptions: this.manufacturerStore.optionList(),
  }));

  // readonly generalFormOptions = computed(() => ({
  //   categoryOptions: this.fetchedCategories(),
  //   manufacturerOptions: this.fetchedManufacturers(),
  //   partOriginOptions: this.fetchedPartOrigins(),
  //   unitOptions: this.unitOptions(),
  //   warehouseOptions: [],
  //   statusOptions: [],
  // }));

  readonly breadcrumbs = [
    { label: 'Catálogo', route: '/catalog/products' },
    { label: 'Produtos', route: '/catalog/products' },
    { label: 'Novo Produto' },
  ];

  private queries: GeneralOptionQuery = {
    search: null,
    active: null,
    per_page: null,
    page: null,
    manufacturer_id: null,
  };

  readonly unitOptions = signal<SelectOption[]>([]);

  ngOnInit(): void {
    this.loadInitialOptions(this.queries);
  }

  loadInitialOptions(query: GeneralOptionQuery): void {
    this.categoryLoading.set(true);
    this.categoryService.getOptions(query).subscribe({
      next: (res) => {
        const opts: AutocompleteOption[] = (res.data || []).map((c) => ({
          label: c.label,
          value: c.value,
          sublabel: c.sublabel,
          icon: c.icon || 'folder',
          description: c.description,
          disabled: false,
        }));
        this.fetchedCategories.set(opts);
        this.categoryLoading.set(false);
      },
      error: () => this.categoryLoading.set(false),
    });

    this.manufacturerLoading.set(true);
    this.manufacturerService.getOptions(query).subscribe({
      next: (res) => {
        const opts: Partial<AutocompleteOption>[] = (res.data || []).map((m) => ({
          label: m.label,
          value: m.value,
          sublabel: m.sublabel,
        }));
        this.fetchedManufacturers.set(opts);
        this.manufacturerLoading.set(false);
      },
      error: () => this.manufacturerLoading.set(false),
    });

    this.partOriginService.getAll(this.queries).subscribe({
      next: (res) => {
        const opts: SelectOption[] = (res.data || []).map((p) => ({
          label: p.name,
          value: p.id,
          sublabel: p.description,
          disabled: false,
        }));
        this.fetchedPartOrigins.set(opts);
      },
    });

    this.warehouseService.getAll(this.queries).subscribe({
      next: (res) => {
        console.log('[Warehouses] ', res);
      },
      error: (err) => {
        console.log('[Error] ', err);
      },
    });

    this.unitSaleService.getOptions(query).subscribe({
      next: (res) => {
        const opts: SelectOption[] = (res.data || []).map((u) => ({
          label: u.label,
          value: u.value,
          sublabel: u.sublabel,
          disabled: false,
        }));
        this.unitOptions.set(opts);
      },
    });
  }

  setCreateStep(step: number): void {
    if (step < 1 || step > 3) return;
    this.createStep.set(step);
  }

  nextCreateStep(): void {
    if (this.createStep() < 3) {
      this.createStep.update((s) => s + 1);
    }
  }

  prevCreateStep(): void {
    if (this.createStep() > 1) {
      this.createStep.update((s) => s - 1);
    }
  }

  updateField(field: string, val: string): void {
    this.isFormDirty.set(true);
    const fieldMapping: Record<string, keyof ProductCreateFormState> = {
      name: 'name',
      internal_code: 'internal_code',
      barcode: 'barcode',
      category_id: 'category_id',
      manufacturer_id: 'manufacturer_id',
      part_origin_id: 'part_origin_id',
      unit_id: 'unit_id',
      short_description: 'short_description',
    };
    const key = fieldMapping[field];
    if (key) {
      this.createForm.update((p) => ({ ...p, [key]: val }));
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
    if (field === 'featured') {
      this.isFormDirty.set(true);
      this.createForm.update((p) => ({ ...p, featured: val }));
    }
  }

  updateNumberField(field: string, valStr: string): void {
    this.isFormDirty.set(true);
    const num = parseFloat(valStr) || 0;
    const fieldMapping: Record<string, keyof ProductCreateFormState> = {
      weight: 'weight',
      height: 'height',
      width: 'width',
      length: 'length',
    };
    const key = fieldMapping[field];
    if (key) {
      this.createForm.update((p) => ({ ...p, [key]: num }));
    }
  }

  updateDescription(val: string): void {
    this.isFormDirty.set(true);
    this.createForm.update((p) => ({ ...p, description: val }));
  }

  onCategorySearch(query: GeneralOptionQuery): void {
    this.categoryLoading.set(true);
    this.categoryService.getOptions(query).subscribe({
      next: (res) => {
        const opts: AutocompleteOption[] = (res.data || []).map((c) => ({
          label: c.label,
          value: c.value,
          disabled: false,
          sublabel: c.sublabel,
          icon: c.icon || 'folder',
          description: c.description,
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
          value: m.value,
          disabled: false,
          sublabel: m.sublabel,
          icon: 'folder',
          description: '',
        }));
        this.fetchedManufacturers.set(opts);
        this.manufacturerLoading.set(false);
      },
      error: () => this.manufacturerLoading.set(false),
    });
  }

  validateForm(): boolean {
    const errs: Record<string, string> = {};
    const p = this.createForm();

    if (!p.name.trim()) {
      errs['name'] = 'O nome do produto é obrigatório.';
    }
    if (!p.internal_code.trim()) {
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
    if (!p.part_origin_id) {
      errs['part_origin_id'] = 'Selecione a origem da peça.';
    }

    this.errors.set(errs);
    return Object.keys(errs).length === 0;
  }

  saveProduct(): void {
    if (!this.validateForm()) {
      this.toastService.error(
        'Não foi possível salvar o produto.',
        'Verifique os campos obrigatórios destacados.',
      );
      return;
    }

    this.isSaving.set(true);
    const payload = toCreateProductPayload(createFormToGeneralSource(this.createForm()));

    this.productService.create(payload).subscribe({
      next: (response) => {
        this.isSaving.set(false);
        this.isFormDirty.set(false);
        this.toastService.success(
          '✔ Produto criado com sucesso.',
          'Entidade principal cadastrada. Você já pode enriquecer as informações complementares.',
        );
        const newId = response.id || '1';
        this.router.navigate(['/catalog/products', newId, 'edit'], {
          replaceUrl: true,
          state: { productJustCreated: true },
        });
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
}
