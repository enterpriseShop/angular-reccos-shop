import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { PageHeaderComponent } from '../../../design-system/page-header/page-header';
import { ButtonComponent } from '../../../design-system/button/button';
import { ConfirmDialogComponent } from '../../../design-system/dialog/confirm-dialog';
import { ProductGeneralTabComponent } from '../components/product-form/general-tab/general-tab';
import { ProductCreateStepperComponent } from '../components/product-form/stepper/product-create-stepper';
import { CategoryService } from '../../../core/services/category-service';
import { ManufacturerService } from '../../../core/services/manufacture-service';
import { PartOriginService } from '../../../core/services/part-origins-service';
import { ProductService } from '../../../core/services/product-service';
import { ToastService } from '../../../core/services/toast';
import { AutocompleteOption } from '../../../design-system/autocomplete-select/autocomplete-select';
import { DSelectOption } from '../../../core/models/design-system/select-option.model';
import { GeneralOptionQuery } from '../../../core/models/generals/general-option-query.model';
import {
  createFormToGeneralSource,
  defaultProductCreateFormState,
  ProductCreateFormState,
  toCreateProductPayload,
  toProductGeneralFormData,
} from '../../../core/models/products/product-create.model';

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
  private categoryService = inject(CategoryService);
  private manufacturerService = inject(ManufacturerService);
  private partOriginService = inject(PartOriginService);
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
  readonly fetchedManufacturers = signal<AutocompleteOption[]>([]);
  readonly fetchedPartOrigins = signal<DSelectOption[]>([]);

  readonly generalForm = computed(() =>
    toProductGeneralFormData(createFormToGeneralSource(this.createForm())),
  );

  readonly generalFormOptions = computed(() => ({
    categoryOptions: this.fetchedCategories(),
    categoryLoading: this.categoryLoading(),
    manufacturerOptions: this.fetchedManufacturers(),
    manufacturerLoading: this.manufacturerLoading(),
    partOriginOptions: this.fetchedPartOrigins(),
    unitOptions: this.unitOptions,
    statusOptions: [],
  }));

  readonly breadcrumbs = [
    { label: 'Catálogo', route: '/catalog/products' },
    { label: 'Produtos', route: '/catalog/products' },
    { label: 'Novo Produto' },
  ];

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

  ngOnInit(): void {
    this.loadInitialOptions(this.queries);
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
      short_description: 'shortDescription',
      shortDescription: 'shortDescription',
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
    const p = this.createForm();

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
    if (!p.partOriginId) {
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
