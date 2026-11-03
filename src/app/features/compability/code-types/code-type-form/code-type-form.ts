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
import { SelectComponent } from '../../../../design-system/select/select';
import { ToastService } from '../../../../core/services/toast';
import { ProductCodeTypeService } from '../../../../core/services/product-code-tyes';
import { ProductCodeTypeResponse } from '../../../../core/models/compatibility/product-code-type/product-code-type-response.model';
import { ProductCodeTypeRequest } from '../../../../core/models/compatibility/product-code-type/product-code-type-request.model';
import { SelectOption } from '../../../../core/models/design-system/select-option.model';
import { StatusStore } from '../../../../core/store/status-store/status-store';

@Component({
  selector: 'app-code-type-form',
  standalone: true,
  imports: [CommonModule, ButtonComponent, AppIconComponent, DrawerComponent, SelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './code-type-form.html',
  styleUrl: './code-type-form.css',
})
export class CodeTypeFormComponent {
  private statusStore = inject(StatusStore);
  private toastService = inject(ToastService);
  private productCodeTypeService = inject(ProductCodeTypeService);

  readonly isOpen = input<boolean>(false);
  readonly mode = input<'create' | 'edit' | 'view'>('create');
  readonly codeType = input<ProductCodeTypeResponse | null>(null);

  readonly closeForm = output<void>();
  readonly codeTypeSaved = output<ProductCodeTypeResponse>();

  readonly isSubmitting = signal<boolean>(false);

  // Form Fields
  readonly name = signal<string>('');
  readonly description = signal<string>('');
  readonly status_id = signal<string>('');

  readonly statusOptions = computed<SelectOption[]>(() => {
    const result = this.statusStore
      .optionList()
      .filter((m) => m.module === 'PRODUCT_CODE_TYPE')
      .map((m) => ({
        ...m,
        disabled: false,
        module: '',
      }));

    return result;
  });

  readonly formErrors = signal<Record<string, string>>({});

  constructor() {
    effect(() => {
      const open = this.isOpen();
      const item = this.codeType();
      const currentMode = this.mode();

      if (open) {
        this.formErrors.set({});

        if ((currentMode === 'edit' || currentMode === 'view') && item) {
          this.name.set(item.name || '');
          this.description.set(item.description || '');
          this.status_id.set(item.status?.id || '');
        } else {
          this.name.set('');
          this.description.set('');
          this.status_id.set('');
        }
      }
    });
  }

  readonly formTitle = computed(() => {
    switch (this.mode()) {
      case 'edit':
        return 'Editar Tipo de Código';
      case 'view':
        return 'Detalhes do Tipo de Código';
      case 'create':
      default:
        return 'Novo Tipo de Código';
    }
  });

  readonly isReadOnly = computed(() => this.mode() === 'view');

  onNameChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.name.set(val);
    this.clearFieldError('name');
  }

  onDescriptionChange(event: Event): void {
    const val = (event.target as HTMLTextAreaElement).value;
    this.description.set(val);
    this.clearFieldError('description');
  }

  onStatusChange(val: string): void {
    this.status_id.set(val);
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
    const nameVal = this.name().trim();

    if (!nameVal) {
      errors['name'] = 'O nome do tipo de código é obrigatório.';
    } else if (nameVal.length > 100) {
      errors['name'] = 'O nome não pode exceder 100 caracteres.';
    }

    if (this.description().length > 255) {
      errors['description'] = 'A descrição não pode exceder 255 caracteres.';
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

    const payload: ProductCodeTypeRequest = {
      name: this.name().trim(),
      description: this.description().trim() || '',
      status_id: this.status_id() || null,
    };

    if (this.mode() === 'edit' && this.codeType()?.id) {
      const id = this.codeType()!.id;
      this.productCodeTypeService.update(id, payload).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          this.toastService.success(
            'Tipo Atualizado',
            `O tipo "${response.data.name}" foi atualizado com sucesso.`,
          );
          this.codeTypeSaved.emit(response.data);
          this.close();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const msg = err.error?.message || err.message || 'Erro ao atualizar tipo de código.';
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
      this.productCodeTypeService.create(payload).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          this.toastService.success(
            'Tipo Cadastrado',
            `O tipo "${response.data.name}" foi registrado com sucesso.`,
          );
          this.codeTypeSaved.emit(response.data);
          this.close();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const msg = err.error?.message || err.message || 'Erro ao cadastrar tipo de código.';
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
