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
import { ToastService } from '../../../../core/services/toast';
import { OemCodeService } from '../../../../core/services/code-oem-service';
import {
  ProductOemCodeRequest,
  ProductOemCodeResource,
} from '../../../../core/models/oem-codes/oem-codes.model';
import { ManufacturerStore } from '../../../../core/store/manufacturer-store/manufacturer-store';
import { SelectOption } from '../../../../core/models/design-system/select-option.model';

@Component({
  selector: 'app-oem-code-form',
  standalone: true,
  imports: [CommonModule, ButtonComponent, AppIconComponent, DrawerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './oem-code-form.html',
  styleUrl: './oem-code-form.css',
})
export class OemCodeFormComponent {
  private toastService = inject(ToastService);
  private oemCodeService = inject(OemCodeService);
  private manufacturerStore = inject(ManufacturerStore);

  readonly isOpen = input<boolean>(false);
  readonly mode = input<'create' | 'edit' | 'view'>('create');
  readonly oemCode = input<ProductOemCodeResource | null>(null);
  readonly options = input<SelectOption[]>([]);

  readonly closeForm = output<void>();
  readonly oemCodeSaved = output<ProductOemCodeResource>();

  // Reactive State Signals
  readonly isSubmitting = signal<boolean>(false);

  // Form Field Signals matching CreateProductOemCodeRequest / UpdateProductOemCodeRequest
  readonly manufacturerId = signal<string>('');
  readonly code = signal<string>('');

  // Validation Errors
  readonly formErrors = signal<Record<string, string>>({});

  constructor() {
    effect(() => {
      const open = this.isOpen();
      const item = this.oemCode();
      const currentMode = this.mode();

      if (open) {
        this.formErrors.set({});

        if ((currentMode === 'edit' || currentMode === 'view') && item) {
          this.manufacturerId.set(item.manufacturer.id);
          this.code.set(item.oem_code);
        } else {
          // Create Mode Reset
          this.manufacturerId.set('');
          this.code.set('');
        }
      }
    });
  }

  // Derived Title & Read-only Mode
  readonly formTitle = computed(() => {
    switch (this.mode()) {
      case 'edit':
        return 'Editar Código OEM';
      case 'view':
        return 'Detalhes do Código OEM';
      case 'create':
      default:
        return 'Novo Código OEM';
    }
  });

  readonly isReadOnly = computed(() => this.mode() === 'view');

  readonly selectedManufacturerName = computed(() => {
    const id = this.manufacturerId();
    const found = this.options().find((m) => m.value === id);
    return found ? found.label : this.oemCode()?.manufacturer?.name || 'Não selecionado';
  });

  // Input event handlers
  onManufacturerChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.manufacturerId.set(value);

    if (this.formErrors()['manufacturer_id']) {
      this.clearFieldError('manufacturer_id');
    }
  }

  onCodeChange(event: Event): void {
    const rawVal = (event.target as HTMLInputElement).value;
    // Format to uppercase, trimmed of illegal characters
    const formatted = rawVal.toUpperCase();
    this.code.set(formatted);

    if (this.formErrors()['oem_code']) {
      this.clearFieldError('oem_code');
    }
  }

  private clearFieldError(field: string): void {
    this.formErrors.update((errs) => {
      const copy = { ...errs };
      delete copy[field];
      return copy;
    });
  }

  // Client-side Validation strictly adhering to Laravel FormRequests
  validateForm(): boolean {
    const errors: Record<string, string> = {};
    const mfrVal = this.manufacturerId().trim();
    const codeVal = this.code().trim();

    if (!mfrVal) {
      errors['manufacturer_id'] = 'Selecione a montadora ou fabricante.';
    }

    if (!codeVal) {
      errors['oem_code'] = 'O código OEM é obrigatório.';
    } else if (codeVal.length > 120) {
      errors['oem_code'] = 'O código OEM não pode exceder 120 caracteres.';
    }

    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  // Submit Handler
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

    const payload: ProductOemCodeRequest = {
      manufacturer_id: this.manufacturerId().trim(),
      oem_code: this.code().trim().toUpperCase(),
    };

    if (this.mode() === 'edit' && this.oemCode()?.id) {
      const id = this.oemCode()!.id;
      this.oemCodeService.update(id, payload).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          this.toastService.success(
            'Código OEM Atualizado',
            `O código "${response.data.oem_code}" foi atualizado com sucesso.`,
          );
          this.oemCodeSaved.emit(response.data);
          this.close();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const msg = err.error?.message || err.message || 'Erro ao atualizar código OEM.';
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
      this.oemCodeService.create(payload).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          this.toastService.success(
            'Código OEM Criado',
            `O código "${response.data.oem_code}" foi registrado com sucesso.`,
          );
          this.oemCodeSaved.emit(response.data);
          this.close();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const msg = err.error?.message || err.message || 'Erro ao criar código OEM.';
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
