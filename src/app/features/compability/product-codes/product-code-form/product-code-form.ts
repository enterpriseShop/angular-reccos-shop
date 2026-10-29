import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  computed,
  effect,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../../design-system/button/button';
import { AppIconComponent } from '../../../../design-system/icon/app-icon';
import { DrawerComponent } from '../../../../design-system/drawer/drawer';
import { AutocompleteSelectComponent, AutocompleteOption } from '../../../../design-system/autocomplete-select/autocomplete-select';
import { SelectComponent } from '../../../../design-system/select/select';
import { ProductCodeService, ProductCodeTypeService } from '../../../../core/services/product-code';
import { ProductService } from '../../../../core/services/product';
import { ToastService } from '../../../../core/services/toast';
import {
  ProductCode,
  CreateProductCodeDto,
  UpdateProductCodeDto
} from '../../../../core/models/product-code';

@Component({
  selector: 'app-product-code-form',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    AppIconComponent,
    DrawerComponent,
    AutocompleteSelectComponent,
    SelectComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-code-form.html',
  styleUrl: './product-code-form.css'
})
export class ProductCodeFormComponent {
  private productCodeService = inject(ProductCodeService);
  private productCodeTypeService = inject(ProductCodeTypeService);
  private productService = inject(ProductService);
  private toastService = inject(ToastService);

  readonly isOpen = input<boolean>(false);
  readonly mode = input<'create' | 'edit' | 'view'>('create');
  readonly productCode = input<ProductCode | null>(null);

  readonly closeForm = output<void>();
  readonly productCodeSaved = output<ProductCode>();

  // Reactive State Signals
  readonly isSubmitting = signal<boolean>(false);
  readonly loadingTypes = signal<boolean>(false);
  readonly loadingProducts = signal<boolean>(false);

  readonly typeOptions = signal<AutocompleteOption[]>([]);
  readonly productOptions = signal<AutocompleteOption[]>([]);

  readonly statusOptions = [
    { label: 'Ativo', value: 'st-02' },
    { label: 'Inativo', value: 'st-03' }
  ];

  // Form Field Signals
  readonly productId = signal<string>('');
  readonly codeTypeId = signal<string>('');
  readonly code = signal<string>('');
  readonly statusId = signal<string>('st-02');

  // Validation Errors
  readonly formErrors = signal<Record<string, string>>({});

  constructor() {
    this.loadCodeTypes();
    this.loadProducts();

    effect(() => {
      const open = this.isOpen();
      const item = this.productCode();
      const currentMode = this.mode();

      if (open) {
        this.formErrors.set({});

        if ((currentMode === 'edit' || currentMode === 'view') && item) {
          this.productId.set(item.product_id || item.product?.id || '');
          this.codeTypeId.set(item.code_type_id || item.code_type?.id || '');
          this.code.set(item.code || '');
          this.statusId.set(item.status_id || (item.active ? 'st-02' : 'st-03'));
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

  loadCodeTypes(): void {
    this.loadingTypes.set(true);
    // As per specification: only active types must be offered for new registrations
    this.productCodeTypeService.getActiveTypes().subscribe({
      next: (res) => {
        this.loadingTypes.set(false);
        if (res && res.data) {
          this.typeOptions.set(
            res.data.map((t) => ({
              label: t.name,
              value: t.id,
              sublabel: t.description || undefined
            }))
          );
        }
      },
      error: () => {
        this.loadingTypes.set(false);
      }
    });
  }

  loadProducts(search?: string): void {
    this.loadingProducts.set(true);
    this.productService.getOptions(search, 30).subscribe({
      next: (res) => {
        this.loadingProducts.set(false);
        if (res && res.data) {
          this.productOptions.set(
            res.data.map((p) => ({
              label: p.label || p.name,
              value: p.id,
              sublabel: `Cód interno: ${p.internal_code || 'N/A'}`
            }))
          );
        }
      },
      error: () => {
        this.loadingProducts.set(false);
      }
    });
  }

  onProductSearch(query: string): void {
    this.loadProducts(query);
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
    return this.productOptions().find(p => String(p.value) === String(id));
  });

  readonly selectedType = computed(() => {
    const id = this.codeTypeId();
    return this.typeOptions().find(t => String(t.value) === String(id));
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
      this.toastService.error('Formulário Inválido', 'Corrija os campos indicados antes de salvar.');
      return;
    }

    this.isSubmitting.set(true);

    const payload: CreateProductCodeDto | UpdateProductCodeDto = {
      product_id: this.productId().trim(),
      code_type_id: this.codeTypeId().trim(),
      code: this.code().trim(),
      status_id: this.statusId()
    };

    if (this.mode() === 'edit' && this.productCode()?.id) {
      const id = this.productCode()!.id;
      this.productCodeService.update(id, payload).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          this.toastService.success(
            'Código Atualizado',
            `O código "${response.data.code}" foi atualizado com sucesso.`
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
        }
      });
    } else {
      this.productCodeService.create(payload as CreateProductCodeDto).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          this.toastService.success(
            'Código Cadastrado',
            `O código "${response.data.code}" foi associado ao produto com sucesso.`
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
        }
      });
    }
  }

  close(): void {
    this.closeForm.emit();
  }
}
