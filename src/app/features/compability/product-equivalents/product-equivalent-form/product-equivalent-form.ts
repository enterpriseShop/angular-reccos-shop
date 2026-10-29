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
import { TooltipDirective } from '../../../../design-system/tooltip/tooltip';
import { ProductEquivalentService } from '../../../../core/services/product-equivalent';
import { ToastService } from '../../../../core/services/toast';
import {
  CreateProductEquivalentDto,
  UpdateProductEquivalentDto,
} from '../../../../core/models/product-equivalent';
import { AutocompleteSelectComponent } from '../../../../design-system/autocomplete-select/autocomplete-select';
import { ProductService } from '../../../../core/services/product-service';
import { ProductEquivalentResponse } from '../../../../core/models/compatibility/product-equivalent/product-equivalent-response';
import { AutocompleteOption } from '../../../../core/models/design-system/auto-complete.model';
import { ProductFilterRequest } from '../../../../core/models/products/product-filter-request.model';
import { GeneralOptionQuery } from '../../../../core/models/generals/general-option-query.model';

@Component({
  selector: 'app-product-equivalent-form',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    AppIconComponent,
    DrawerComponent,
    AutocompleteSelectComponent,
    TooltipDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-equivalent-form.html',
  styleUrl: './product-equivalent-form.css',
})
export class ProductEquivalentFormComponent {
  private toastService = inject(ToastService);
  private productService = inject(ProductService);
  private equivalentService = inject(ProductEquivalentService);

  readonly isOpen = input<boolean>(false);
  readonly mode = input<'create' | 'edit' | 'view'>('create');
  readonly equivalent = input<ProductEquivalentResponse | null>(null);

  readonly closeForm = output<void>();
  readonly equivalentSaved = output<ProductEquivalentResponse>();

  // State Signals
  readonly isSubmitting = signal<boolean>(false);
  readonly loadingProducts = signal<boolean>(false);
  readonly productOptions = signal<AutocompleteOption[]>([]);

  // Form Field Signals
  readonly productId = signal<string>('');
  readonly equivalentProductId = signal<string>('');
  readonly observation = signal<string>('');

  // Validation Errors
  readonly formErrors = signal<Record<string, string>>({});

  productParams: ProductFilterRequest = {
    search: null,
    active: null,
    parent_id: null,
    page: 1,
    per_page: 20,
  };

  constructor() {
    this.loadProducts(this.productParams);

    effect(() => {
      const open = this.isOpen();
      const item = this.equivalent();
      const currentMode = this.mode();

      if (open) {
        this.formErrors.set({});

        if ((currentMode === 'edit' || currentMode === 'view') && item) {
          const originId = item.product.id || item.product?.id || '';
          const targetId = item.id || item.equivalent_product?.id || '';
          this.productId.set(originId);
          this.equivalentProductId.set(targetId);
          this.observation.set(item.observation || '');

          // If products aren't in current options, fetch them
          if (item.product && !this.productOptions().some((p) => p.value === originId)) {
            this.productOptions.update((opts) => [
              ...opts,
              {
                label: item.product.name,
                value: originId,
                sublabel: item.product.name || 'N/A',
                disabled: false,
                description: item.product.slug || '',
                icon: 'package',
                is_parent: false,
              },
            ]);
          }
          if (item.equivalent_product && !this.productOptions().some((p) => p.value === targetId)) {
            this.productOptions.update((opts) => [
              ...opts,
              {
                label: item.equivalent_product!.name,
                value: targetId,
                sublabel: item.equivalent_product!.name || 'N/A',
                disabled: false,
                description: item.equivalent_product!.slug || '',
                icon: 'package',
                is_parent: false,
              },
            ]);
          }
        } else {
          // Reset
          this.productId.set('');
          this.equivalentProductId.set('');
          this.observation.set('');
        }
      }
    });
  }

  loadProducts(params: ProductFilterRequest): void {
    this.loadingProducts.set(true);
    this.productService.getAll(params).subscribe({
      next: (res) => {
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
            sublabel: p.description ?? '',
            disabled: false,
            icon: '',
            is_parent: false,
            description: '',
          })),
        ];
        this.productOptions.set(opts);
      },
    });
  }

  onProductSearch(params: Partial<GeneralOptionQuery>) {
    console.log(params);
    this.loadProducts(this.productParams);
  }

  // Titles & Mode
  readonly formTitle = computed(() => {
    switch (this.mode()) {
      case 'edit':
        return 'Editar Equivalência de Produto';
      case 'view':
        return 'Detalhes da Equivalência';
      case 'create':
      default:
        return 'Novo Relacionamento de Equivalência';
    }
  });

  readonly isReadOnly = computed(() => this.mode() === 'view');
  readonly isEditMode = computed(() => this.mode() === 'edit');

  readonly selectedOriginProduct = computed(() => {
    const id = this.productId();
    if (!id) return null;
    return this.productOptions().find((p) => String(p.value) === String(id)) || null;
  });

  readonly selectedTargetProduct = computed(() => {
    const id = this.equivalentProductId();
    if (!id) return null;
    return this.productOptions().find((p) => String(p.value) === String(id)) || null;
  });

  readonly isSameProductError = computed(() => {
    const p1 = this.productId();
    const p2 = this.equivalentProductId();
    return Boolean(p1 && p2 && p1 === p2);
  });

  onOriginSelect(opt: AutocompleteOption): void {
    this.productId.set(String(opt.value));
    this.clearFieldError('product_id');
    this.checkSelfRelation();
  }

  onTargetSelect(opt: AutocompleteOption): void {
    this.equivalentProductId.set(String(opt.value));
    this.clearFieldError('equivalent_product_id');
    this.checkSelfRelation();
  }

  private checkSelfRelation(): void {
    if (
      this.productId() &&
      this.equivalentProductId() &&
      this.productId() === this.equivalentProductId()
    ) {
      this.formErrors.update((errs) => ({
        ...errs,
        equivalent_product_id: 'O produto equivalente não pode ser o mesmo produto de origem.',
      }));
    } else {
      this.clearFieldError('equivalent_product_id');
    }
  }

  onObservationChange(event: Event): void {
    const raw = (event.target as HTMLTextAreaElement).value;
    this.observation.set(raw);
    this.clearFieldError('observation');
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
    const origin = this.productId().trim();
    const target = this.equivalentProductId().trim();
    const obs = this.observation().trim();

    if (!origin) {
      errors['product_id'] = 'Selecione o produto de origem.';
    }

    if (!target) {
      errors['equivalent_product_id'] = 'Selecione o produto equivalente.';
    } else if (origin && target && origin === target) {
      errors['equivalent_product_id'] =
        'O produto equivalente não pode ser o mesmo produto de origem.';
    }

    if (obs.length > 255) {
      errors['observation'] = 'A observação não pode ultrapassar 255 caracteres.';
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
        'Verifique os dados da equivalência antes de salvar.',
      );
      return;
    }

    this.isSubmitting.set(true);

    if (this.mode() === 'edit' && this.equivalent()?.id) {
      const id = this.equivalent()!.id;
      const payload: UpdateProductEquivalentDto = {
        observation: this.observation().trim() || null,
      };

      this.equivalentService.update(id, payload).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          this.toastService.success(
            'Equivalência Atualizada',
            'A observação da equivalência foi salva com sucesso.',
          );
          this.equivalentSaved.emit(response.data);
          this.close();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const msg = err.error?.message || err.message || 'Erro ao atualizar equivalência.';
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
      const payload: CreateProductEquivalentDto = {
        product_id: this.productId().trim(),
        equivalent_product_id: this.equivalentProductId().trim(),
        observation: this.observation().trim() || null,
      };

      this.equivalentService.create(payload).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          this.toastService.success(
            'Equivalência Registrada',
            'Relacionamento entre os produtos estabelecido com sucesso.',
          );
          this.equivalentSaved.emit(response.data);
          this.close();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const msg =
            err.error?.message ||
            err.message ||
            'Erro ao registrar relacionamento de equivalência.';
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
