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
import { PartOriginService } from '../../../../core/services/part-origins-service';
import { PartOriginResponse } from '../../../../core/models/part-origin/part-origin-response';
import { PartOriginRequest } from '../../../../core/models/part-origin/part-origin-request';
import { initialValuesPagination } from '../../../../design-system/pagination/utils/initial-values';
import { PaginationMeta } from '../../../../core/models/pagination/pagination.model';
import { PartOriginStore } from '../../../../core/store/part-origin/part-origin-store';
import { SelectOption } from '../../../../core/models/design-system/select-option.model';

@Component({
  selector: 'app-part-origin-form',
  standalone: true,
  imports: [CommonModule, ButtonComponent, AppIconComponent, DrawerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './part-origin-form.html',
  styleUrl: './part-origin-form.css',
})
export class PartOriginFormComponent {
  private toastService = inject(ToastService);
  private partOriginService = inject(PartOriginService);

  private readonly partOriginStore = inject(PartOriginStore);

  readonly isOpen = input<boolean>(false);
  readonly mode = input<'create' | 'edit' | 'view'>('create');
  readonly partOrigin = input<PartOriginResponse | null>(null);
  readonly pagination = input<PaginationMeta>(initialValuesPagination);

  readonly closeForm = output<void>();
  readonly partOriginSaved = output<PartOriginResponse>();

  // Reactive State Signals
  readonly isSubmitting = signal<boolean>(false);

  // Form Field Signals matching StorePartOriginRequest
  readonly name = signal<string>('');
  readonly description = signal<string>('');
  readonly displayOrder = signal<number>(1);
  readonly active = signal<boolean>(true);

  // Validation Errors
  readonly formErrors = signal<Record<string, string>>({});

  constructor() {
    effect(() => {
      const open = this.isOpen();
      const origin = this.partOrigin();
      const currentMode = this.mode();

      if (open) {
        this.formErrors.set({});

        if ((currentMode === 'edit' || currentMode === 'view') && origin) {
          this.name.set(origin.name || '');
          this.description.set(origin.description || '');
          this.displayOrder.set(origin.display_order ?? 1);
          this.active.set(origin.active !== undefined ? Boolean(origin.active) : true);
        } else {
          // Create Mode Reset
          this.name.set('');
          this.description.set('');
          this.displayOrder.set(this.pagination().total + 1);
          this.active.set(true);
        }
      }
    });
  }

  // Derived Title & Read-only Mode
  readonly formTitle = computed(() => {
    switch (this.mode()) {
      case 'edit':
        return 'Editar Origem da Peça';
      case 'view':
        return 'Detalhes da Origem';
      case 'create':
      default:
        return 'Nova Origem da Peça';
    }
  });

  readonly isReadOnly = computed(() => this.mode() === 'view');

  // Input event handlers
  onNameChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.name.set(value);

    if (this.formErrors()['name']) {
      this.clearFieldError('name');
    }
  }

  onDescriptionChange(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.description.set(value);

    if (this.formErrors()['description']) {
      this.clearFieldError('description');
    }
  }

  onDisplayOrderChange(event: Event): void {
    const rawVal = (event.target as HTMLInputElement).value;
    if (rawVal === '') {
      this.displayOrder.set(0);
    } else {
      const parsed = parseInt(rawVal, 10);
      this.displayOrder.set(isNaN(parsed) ? 0 : parsed);
    }

    if (this.formErrors()['display_order']) {
      this.clearFieldError('display_order');
    }
  }

  onActiveToggle(): void {
    if (this.isReadOnly()) return;
    this.active.update((v) => !v);
  }

  private clearFieldError(field: string): void {
    this.formErrors.update((errs) => {
      const copy = { ...errs };
      delete copy[field];
      return copy;
    });
  }

  // Client-side Validation strictly adhering to StorePartOriginRequest
  validateForm(): boolean {
    const errors: Record<string, string> = {};
    const nameVal = this.name().trim();
    const descVal = this.description().trim();
    const orderVal = this.displayOrder();

    if (!nameVal) {
      errors['name'] = 'O nome da origem é obrigatório.';
    } else if (nameVal.length > 100) {
      errors['name'] = 'O nome não pode exceder 100 caracteres.';
    }

    if (descVal && descVal.length > 500) {
      errors['description'] = 'A descrição não pode exceder 500 caracteres.';
    }

    if (orderVal !== null && orderVal < 0) {
      errors['display_order'] = 'A ordem de exibição deve ser um número maior ou igual a 0.';
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

    const payload: PartOriginRequest = {
      name: this.name().trim(),
      description: this.description().trim(),
      display_order: this.displayOrder(),
      active: this.active(),
    };

    if (this.mode() === 'edit' && this.partOrigin()?.id) {
      const id = this.partOrigin()!.id;
      this.updateOption(id, payload);
    } else {
      this.createOption(payload);
    }
  }

  updatePartOriginStore(response: PartOriginResponse): void {
    const option: SelectOption = {
      label: response.name,
      value: response.id,
      sublabel: response.description,
      module: '',
      disabled: false,
    };

    if (this.mode() === 'edit') {
      this.partOriginStore.updateOption(option);
    } else {
      this.partOriginStore.addOption(option);
    }
  }

  createOption(payload: PartOriginRequest): void {
    this.partOriginService.create(payload).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        this.toastService.success(
          'Origem Criada',
          `A origem "${response.data.name}" foi cadastrada com sucesso.`,
        );
        this.updatePartOriginStore(response.data);
        this.partOriginSaved.emit(response.data);
        this.close();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const msg = err.error?.message || err.message || 'Erro ao criar origem.';
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

  updateOption(id: string, payload: PartOriginRequest): void {
    this.partOriginService.update(id, payload).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        this.toastService.success(
          'Origem Atualizada',
          `A origem "${response.data.name}" foi salva com sucesso.`,
        );
        this.updatePartOriginStore(response.data);
        this.partOriginSaved.emit(response.data);
        this.close();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const msg = err.error?.message || err.message || 'Erro ao atualizar origem.';
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

  close(): void {
    this.closeForm.emit();
  }
}
