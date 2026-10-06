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
import { WarehouseService } from '../../../../core/services/warehouse';
import { ToastService } from '../../../../core/services/toast';
import { StatusStore } from '../../../../core/store/status-store/status-store';
import { WarehouseResponse } from '../../../../core/models/warehouses/warehouses.interface';
import { WarehouseRequest } from '../../../../core/models/warehouses/warehouse-request.model';

@Component({
  selector: 'app-warehouse-form',
  standalone: true,
  imports: [CommonModule, ButtonComponent, AppIconComponent, DrawerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './warehouse-form.html',
  styleUrl: './warehouse-form.css',
})
export class WarehouseFormComponent {
  private statusStore = inject(StatusStore);
  private toastService = inject(ToastService);
  private warehouseService = inject(WarehouseService);

  readonly isOpen = input<boolean>(false);
  readonly mode = input<'create' | 'edit' | 'view'>('create');
  readonly warehouse = input<WarehouseResponse | null>(null);

  readonly closeForm = output<void>();
  readonly warehouseSaved = output<WarehouseResponse>();

  // Reactive State Signals
  readonly isSubmitting = signal<boolean>(false);
  readonly statusOptions = computed(() => {
    const options = this.statusStore.statusOptions().filter((m) => m.module === 'WAREHOUSE');
    return options;
  });

  // Form Field Signals matching Laravel Model & Requests
  readonly name = signal<string>('');
  readonly code = signal<string>('');
  readonly description = signal<string>('');
  readonly statusId = signal<string>('st-02');

  // Validation Errors Signal
  readonly formErrors = signal<Record<string, string>>({});

  constructor() {
    effect(() => {
      const open = this.isOpen();
      const currentWarehouse = this.warehouse();
      const currentMode = this.mode();

      if (open) {
        this.formErrors.set({});

        if ((currentMode === 'edit' || currentMode === 'view') && currentWarehouse) {
          this.name.set(currentWarehouse.name || '');
          this.code.set(currentWarehouse.code || '');
          this.description.set(currentWarehouse.description || '');
          this.statusId.set(currentWarehouse.status.value || 'st-02');
        } else {
          // Reset for create
          this.name.set('');
          this.code.set('');
          this.description.set('');
          this.statusId.set('st-02');
        }
      }
    });
  }

  // Derived Title & State
  readonly formTitle = computed(() => {
    switch (this.mode()) {
      case 'edit':
        return 'Editar Depósito';
      case 'view':
        return 'Detalhes do Depósito';
      case 'create':
      default:
        return 'Novo Depósito';
    }
  });

  readonly isReadOnly = computed(() => this.mode() === 'view');

  readonly currentStatus = computed(() => {
    const sId = this.statusId();
    return this.statusOptions().find((s) => s.value === sId);
  });

  readonly isActive = computed(() => {
    const st = this.currentStatus();
    if (!st) return true;
    // return (st.code || '').toLowerCase() === 'active';
    return (st.value || '').toLowerCase() === 'active';
  });

  // Handlers
  onNameChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.name.set(target.value);
    this.clearError('name');
  }

  onCodeChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.code.set(target.value.toUpperCase().replace(/\s+/g, '-'));
    this.clearError('code');
  }

  onDescriptionChange(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.description.set(target.value);
    this.clearError('description');
  }

  onStatusChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.statusId.set(target.value);
    this.clearError('status_id');
  }

  selectStatus(id: string): void {
    if (this.isReadOnly()) return;
    this.statusId.set(id);
    this.clearError('status_id');
  }

  generateCodeFromName(): void {
    if (this.isReadOnly()) return;
    const currentName = this.name().trim();
    if (!currentName) return;

    // Generate clean uppercase acronym/slug like DC-SP01
    const parts = currentName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .split(/[\s-]+/)
      .filter((p) => p.length > 0 && !['DE', 'DO', 'DA', 'DOS', 'DAS', 'E', 'PARA'].includes(p));

    let candidate = '';
    if (parts.length >= 2) {
      candidate = parts
        .slice(0, 3)
        .map((p) => p.substring(0, 3))
        .join('-');
    } else if (parts.length === 1) {
      candidate = 'DEP-' + parts[0].substring(0, 4);
    } else {
      candidate = 'DEP-01';
    }

    this.code.set(candidate);
    this.clearError('code');
  }

  private clearError(field: string): void {
    this.formErrors.update((errors) => {
      const copy = { ...errors };
      delete copy[field];
      return copy;
    });
  }

  validate(): boolean {
    const errors: Record<string, string> = {};
    const n = this.name().trim();
    const c = this.code().trim();
    const d = this.description().trim();

    if (!n) {
      errors['name'] = 'O nome é obrigatório.';
    } else if (n.length > 100 && this.mode() === 'create') {
      errors['name'] = 'O nome deve ter no máximo 100 caracteres.';
    } else if (n.length > 255) {
      errors['name'] = 'O nome deve ter no máximo 255 caracteres.';
    }

    if (!c) {
      errors['code'] = 'O código é obrigatório.';
    } else if (c.length > 50) {
      errors['code'] = 'O código deve ter no máximo 50 caracteres.';
    }

    if (d && d.length > 255) {
      errors['description'] = 'A descrição deve ter no máximo 255 caracteres.';
    }

    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  onSubmit(): void {
    if (this.isReadOnly()) {
      this.close();
      return;
    }

    if (!this.validate()) {
      this.toastService.warning(
        'Campos inválidos',
        'Por favor, corrija os erros sinalizados no formulário.',
      );
      return;
    }

    this.isSubmitting.set(true);

    const payload: WarehouseRequest = {
      name: this.name().trim(),
      code: this.code().trim().toUpperCase(),
      description: this.description().trim() ? this.description().trim() : null,
      status_id: this.statusId() || null,
    };

    if (this.mode() === 'edit' && this.warehouse()) {
      this.warehouseService.update(this.warehouse()!.id, payload).subscribe({
        next: (res) => {
          this.isSubmitting.set(false);
          this.toastService.success(
            'Depósito Atualizado',
            `O depósito "${res.data.name}" foi atualizado com sucesso.`,
          );
          this.warehouseSaved.emit(res.data);
          this.close();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          if (err.error?.errors) {
            const apiErrors: Record<string, string> = {};
            for (const [key, msgs] of Object.entries(err.error.errors)) {
              apiErrors[key] = Array.isArray(msgs) ? msgs[0] : String(msgs);
            }
            this.formErrors.set(apiErrors);
          }
          this.toastService.error(
            'Erro ao atualizar depósito',
            err.error?.message || err.message || 'Falha na comunicação com o servidor.',
          );
        },
      });
    } else {
      this.warehouseService.create(payload).subscribe({
        next: (res) => {
          this.isSubmitting.set(false);
          this.toastService.success(
            'Depósito Cadastrado',
            `O depósito "${res.data.name}" foi cadastrado com sucesso.`,
          );
          this.warehouseSaved.emit(res.data);
          this.close();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          if (err.error?.errors) {
            const apiErrors: Record<string, string> = {};
            for (const [key, msgs] of Object.entries(err.error.errors)) {
              apiErrors[key] = Array.isArray(msgs) ? msgs[0] : String(msgs);
            }
            this.formErrors.set(apiErrors);
          }
          this.toastService.error(
            'Erro ao cadastrar depósito',
            err.error?.message || err.message || 'Falha na comunicação com o servidor.',
          );
        },
      });
    }
  }

  close(): void {
    this.closeForm.emit();
  }
}
