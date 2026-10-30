import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  computed,
  effect,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../../design-system/button/button';
import { AppIconComponent } from '../../../../design-system/icon/app-icon';
import { DrawerComponent } from '../../../../design-system/drawer/drawer';
import { AutocompleteSelectComponent } from '../../../../design-system/autocomplete-select/autocomplete-select';
import { SelectComponent } from '../../../../design-system/select/select';
import { ProductCodeService } from '../../../../core/services/product-code';
import { ToastService } from '../../../../core/services/toast';
import { CreateProductCodeDto, UpdateProductCodeDto } from '../../../../core/models/product-code';
import { ProductCodeTypeService } from '../../../../core/services/product-code-tyes';
import { ProductService } from '../../../../core/services/product-service';
import { ProductCodeResponse } from '../../../../core/models/compatibility/product-codes/product-codes-response.model';
import { AutocompleteOption } from '../../../../core/models/design-system/auto-complete.model';
import { ProductCodeTypeFiltersRequest } from '../../../../core/models/compatibility/product-code-type/product-code-types-filters.model';
import { ProductFilterRequest } from '../../../../core/models/products/product-filter-request.model';
import { GeneralOptionQuery } from '../../../../core/models/generals/general-option-query.model';
import { SelectOption } from '../../../../core/models/design-system/select-option.model';

@Component({
  selector: 'app-product-code-form',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    AppIconComponent,
    DrawerComponent,
    AutocompleteSelectComponent,
    SelectComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-code-form.html',
  styleUrl: './product-code-form.css',
})
export class ProductCodeFormComponent {
  private toastService = inject(ToastService);
  private productService = inject(ProductService);
  private productCodeService = inject(ProductCodeService);
  private productCodeTypeService = inject(ProductCodeTypeService);

  readonly isOpen = input<boolean>(false);
  readonly mode = input<'create' | 'edit' | 'view'>('create');
  readonly ProductCodeResponse = input<ProductCodeResponse | null>(null);

  readonly closeForm = output<void>();
  readonly productCodeSaved = output<ProductCodeResponse>();

  // Reactive State Signals
  readonly isSubmitting = signal<boolean>(false);
  readonly loadingTypes = signal<boolean>(false);
  readonly loadingProducts = signal<boolean>(false);

  readonly typeOptions = signal<AutocompleteOption[]>([]);
  readonly productOptions = signal<AutocompleteOption[]>([]);

  readonly statusOptions: SelectOption[] = [];

  // Form Field Signals
  readonly productId = signal<string>('');
  readonly codeTypeId = signal<string>('');
  readonly code = signal<string>('');
  readonly statusId = signal<string>('st-02');

  // Validation Errors
  readonly formErrors = signal<Record<string, string>>({});

  page = signal<number>(1);
  perPage = signal<number>(30);

  params: ProductCodeTypeFiltersRequest = {
    name: null,
    active: null,
    page: this.page(),
    per_page: this.perPage(),
  };

  productParams: ProductFilterRequest = {
    search: null,
    active: null,
    parent_id: null,
    page: 1,
    per_page: 20,
  };

  constructor() {
    effect(() => {
      const open = this.isOpen();
      const item = this.ProductCodeResponse();
      const currentMode = this.mode();

      if (open) {
        if (this.productOptions().length === 0) {
          this.loadCodeTypes(this.params);
          this.getProducts(this.productParams);
        }

        this.formErrors.set({});

        if ((currentMode === 'edit' || currentMode === 'view') && item) {
          this.productId.set(item.product_id || item.product?.id || '');
          this.codeTypeId.set(item.code_type_id || item.code_type?.id || '');
          this.code.set(item.code || '');
          this.statusId.set(item.status?.name || '');
        } else {
          // Create Mode Reset
          this.productId.set('');
          this.codeTypeId.set('');
          this.code.set('');
          this.statusId.set('st-02');
        }
      }
    });
  }

  loadCodeTypes(params: ProductCodeTypeFiltersRequest): void {
    this.loadingTypes.set(true);
    // As per specification: only active types must be offered for new registrations
    this.productCodeTypeService.getAll(params).subscribe({
      next: (res) => {
        this.loadingTypes.set(false);
        if (res && res.data) {
          this.typeOptions.set(
            res.data.map((t) => ({
              value: t.id,
              label: t.name,
              sublabel: t.description ?? '',
              disabled: false,
              icon: '',
              is_parent: false,
              description: t.description ?? '',
            })),
          );
        }
      },
      error: () => {
        this.loadingTypes.set(false);
      },
    });
  }

  getProducts(params: ProductFilterRequest): void {
    this.loadingProducts.set(true);
    this.productService.getAll(params).subscribe({
      next: (res) => {
        if (res && res.data) {
          const opts: AutocompleteOption[] = [
            {
              label: 'Todos os Produtos',
              value: '',
              sublabel: '',
              disabled: false,
              icon: '',
              is_parent: false,
              description: '',
            },
            ...res.data.map((p) => ({
              value: p.id,
              label: p.name,
              sublabel: p.internal_code || 'S/C',
              disabled: false,
              icon: '',
              is_parent: false,
              description: '',
            })),
          ];
          this.productOptions.set(opts);
        }
      },
      error: () => {
        this.loadingProducts.set(false);
      },
    });
  }

  onProductSearch(query: Partial<GeneralOptionQuery>): void {
    this.getProducts({ ...this.productParams, search: query.search || '' });
  }

  // Derived Title & Read-only Mode
  readonly formTitle = computed(() => {
    switch (this.mode()) {
      case 'edit':
        return 'Editar Código de Produto';
      case 'view':
        return 'Detalhes do Código de Produto';
      case 'create':
      default:
        return 'Novo Código de Produto';
    }
  });

  readonly isReadOnly = computed(() => this.mode() === 'view');

  readonly selectedProduct = computed(() => {
    const id = this.productId();
    return this.productOptions().find((p) => String(p.value) === String(id));
  });

  readonly selectedType = computed(() => {
    const id = this.codeTypeId();
    return this.typeOptions().find((t) => String(t.value) === String(id));
  });

  onProductSelect(opt: AutocompleteOption): void {
    this.productId.set(String(opt.value));
    this.clearFieldError('product_id');
  }

  onTypeSelect(opt: AutocompleteOption): void {
    this.codeTypeId.set(String(opt.value));
    this.clearFieldError('code_type_id');
  }

  onCodeChange(event: Event): void {
    const rawVal = (event.target as HTMLInputElement).value;
    // Preserve letters, numbers, and leading zeros
    this.code.set(rawVal.trim());
    this.clearFieldError('code');
  }

  private clearFieldError(field: string): void {
    this.formErrors.update((errs) => {
      const copy = { ...errs };
      delete copy[field];
      return copy;
    });
  }

  validateForm(): boolean {
    const errors: Record<string, string> = {};
    const prodVal = this.productId().trim();
    const typeVal = this.codeTypeId().trim();
    const codeVal = this.code().trim();

    if (!prodVal) {
      errors['product_id'] = 'Selecione o produto associado.';
    }

    if (!typeVal) {
      errors['code_type_id'] = 'Selecione o tipo de código.';
    }

    if (!codeVal) {
      errors['code'] = 'O código é obrigatório.';
    } else if (codeVal.length > 100) {
      errors['code'] = 'O código não pode exceder 100 caracteres.';
    }

    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  onSubmit(): void {
    if (this.isReadOnly()) {
      this.close();
      return;
    }

    if (!this.validateForm()) {
      this.toastService.error(
        'Formulário Inválido',
        'Corrija os campos indicados antes de salvar.',
      );
      return;
    }

    this.isSubmitting.set(true);

    const payload: CreateProductCodeDto | UpdateProductCodeDto = {
      product_id: this.productId().trim(),
      code_type_id: this.codeTypeId().trim(),
      code: this.code().trim(),
      status_id: this.statusId(),
    };

    if (this.mode() === 'edit' && this.ProductCodeResponse()?.id) {
      const id = this.ProductCodeResponse()!.id;
      this.productCodeService.update(id, payload).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          this.toastService.success(
            'Código Atualizado',
            `O código "${response.data.code}" foi atualizado com sucesso.`,
          );
          this.productCodeSaved.emit(response.data);
          this.close();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const msg = err.error?.message || err.message || 'Erro ao atualizar código de produto.';
          this.toastService.error('Falha ao Salvar', msg);
          if (err.error?.errors) {
            const serverErrors: Record<string, string> = {};
            for (const key of Object.keys(err.error.errors)) {
              serverErrors[key] = Array.isArray(err.error.errors[key])
                ? err.error.errors[key][0]
                : String(err.error.errors[key]);
            }
            this.formErrors.set(serverErrors);
          }
        },
      });
    } else {
      this.productCodeService.create(payload as CreateProductCodeDto).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          this.toastService.success(
            'Código Cadastrado',
            `O código "${response.data.code}" foi associado ao produto com sucesso.`,
          );
          this.productCodeSaved.emit(response.data);
          this.close();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const msg = err.error?.message || err.message || 'Erro ao cadastrar código de produto.';
          this.toastService.error('Falha ao Salvar', msg);
          if (err.error?.errors) {
            const serverErrors: Record<string, string> = {};
            for (const key of Object.keys(err.error.errors)) {
              serverErrors[key] = Array.isArray(err.error.errors[key])
                ? err.error.errors[key][0]
                : String(err.error.errors[key]);
            }
            this.formErrors.set(serverErrors);
          }
        },
      });
    }
  }

  close(): void {
    this.closeForm.emit();
  }
}
