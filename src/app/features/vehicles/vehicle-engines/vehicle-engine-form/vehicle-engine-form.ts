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
import { MultiSelectComponent } from '../../../../design-system/multi-select/multi-select';
import { ToastService } from '../../../../core/services/toast';
import { VehicleEngineService } from '../../../../core/services/vehicle-engine';
import { VehicleEngineRequest } from '../../../../core/models/vehicles-engine/vehicle-engine-request.model';
import { VehicleEngineResponse } from '../../../../core/models/vehicles-engine/vehicle-engine.model';
import { SelectOption } from '../../../../core/models/design-system/select-option.model';
import { VehicleVersionStore } from '../../../../core/store/vehicles/vehicle-version/vehicle-version-store';

@Component({
  selector: 'app-vehicle-engine-form',
  standalone: true,
  imports: [CommonModule, ButtonComponent, AppIconComponent, DrawerComponent, MultiSelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vehicle-engine-form.html',
  styleUrl: './vehicle-engine-form.css',
})
export class VehicleEngineFormComponent {
  private toastService = inject(ToastService);
  private vehicleEngineService = inject(VehicleEngineService);
  private vehicleVersionStore = inject(VehicleVersionStore);

  readonly isOpen = input<boolean>(false);
  readonly mode = input<'create' | 'edit' | 'view'>('create');
  readonly engine = input<VehicleEngineResponse | null>(null);
  readonly preselectedVersionId = input<string | null>(null);

  readonly closeForm = output<void>();
  readonly engineSaved = output<VehicleEngineResponse>();

  // State Signals
  readonly isSubmitting = signal<boolean>(false);

  // Form Field Signals matching Laravel CreateVehicleEngineRequest / UpdateVehicleEngineRequest
  readonly name = signal<string>('');
  readonly displacement = signal<string>('');
  readonly fuel = signal<string>('Flex');
  readonly horsepower = signal<number | null>(null);
  readonly active = signal<boolean>(true);
  readonly selectedVersionIds = signal<string[]>([]);

  // Validation Errors
  readonly formErrors = signal<Record<string, string>>({});

  // Common Fuel suggestions
  readonly fuelPresets = [
    'Flex',
    'Gasolina',
    'Etanol',
    'Diesel',
    'Híbrido Flex',
    'Híbrido / Gasolina',
    'Elétrico',
    'GNV',
  ];

  readonly versionOptions = computed<SelectOption[]>(() => {
    return this.vehicleVersionStore.optionList();
  });

  constructor() {
    effect(() => {
      const open = this.isOpen();
      const currentItem = this.engine();
      const currentMode = this.mode();
      const defaultVersionId = this.preselectedVersionId();

      if (open) {
        this.formErrors.set({});

        if ((currentMode === 'edit' || currentMode === 'view') && currentItem) {
          this.name.set(currentItem.name || '');
          this.displacement.set(currentItem.displacement || '');
          this.fuel.set(currentItem.fuel || 'Flex');
          this.horsepower.set(
            currentItem.horsepower !== null && currentItem.horsepower !== undefined
              ? Number(currentItem.horsepower)
              : null,
          );
          this.active.set(currentItem.active !== undefined ? Boolean(currentItem.active) : true);

          if (currentItem.versions && currentItem.versions.length > 0) {
            this.selectedVersionIds.set(currentItem.versions.map((v) => v.id));
          } else if (currentItem.vehicle_version_id) {
            this.selectedVersionIds.set([currentItem.vehicle_version_id]);
          } else {
            this.selectedVersionIds.set([]);
          }
        } else {
          // Create Mode
          this.name.set('');
          this.displacement.set('');
          this.fuel.set('Flex');
          this.horsepower.set(null);
          this.active.set(true);
          this.selectedVersionIds.set(defaultVersionId ? [defaultVersionId] : []);
        }
      }
    });
  }

  // Computed Values
  readonly isReadOnly = computed(() => this.mode() === 'view');

  readonly formTitle = computed(() => {
    switch (this.mode()) {
      case 'create':
        return 'Novo Motor de Veículo';
      case 'edit':
        return 'Editar Motor de Veículo';
      case 'view':
        return 'Detalhes do Motor de Veículo';
    }
  });

  onNameChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.name.set(target.value);
    if (this.formErrors()['name']) {
      const errors = { ...this.formErrors() };
      delete errors['name'];
      this.formErrors.set(errors);
    }
  }

  onDisplacementChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.displacement.set(target.value);
    if (this.formErrors()['displacement']) {
      const errors = { ...this.formErrors() };
      delete errors['displacement'];
      this.formErrors.set(errors);
    }
  }

  selectFuelPreset(preset: string): void {
    if (this.isReadOnly()) return;
    this.fuel.set(preset);
    if (this.formErrors()['fuel']) {
      const errors = { ...this.formErrors() };
      delete errors['fuel'];
      this.formErrors.set(errors);
    }
  }

  onFuelChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.fuel.set(target.value);
    if (this.formErrors()['fuel']) {
      const errors = { ...this.formErrors() };
      delete errors['fuel'];
      this.formErrors.set(errors);
    }
  }

  onHorsepowerChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const val = target.value.trim();
    if (!val) {
      this.horsepower.set(null);
    } else {
      const parsed = parseInt(val, 10);
      this.horsepower.set(isNaN(parsed) ? null : parsed);
    }
    if (this.formErrors()['horsepower']) {
      const errors = { ...this.formErrors() };
      delete errors['horsepower'];
      this.formErrors.set(errors);
    }
  }

  toggleActive(): void {
    if (this.isReadOnly()) return;
    this.active.update((v) => !v);
  }

  // Client-side Validation
  private validate(): boolean {
    const errors: Record<string, string> = {};

    const nameVal = this.name().trim();
    if (!nameVal) {
      errors['name'] = 'O nome do motor é obrigatório.';
    } else if (nameVal.length > 255) {
      errors['name'] = 'O nome deve ter no máximo 255 caracteres.';
    }

    const dispVal = this.displacement().trim();
    if (dispVal && dispVal.length > 50) {
      errors['displacement'] = 'A cilindrada deve ter no máximo 50 caracteres.';
    }

    const fuelVal = this.fuel().trim();
    if (fuelVal && fuelVal.length > 100) {
      errors['fuel'] = 'O combustível deve ter no máximo 100 caracteres.';
    }

    const hpVal = this.horsepower();
    if (hpVal !== null) {
      if (!Number.isInteger(hpVal) || hpVal < 1 || hpVal > 2000) {
        errors['horsepower'] = 'A potência deve ser um número inteiro entre 1 e 2000 cv.';
      }
    }

    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  onSubmit(): void {
    if (this.isReadOnly() || this.isSubmitting()) return;

    if (!this.validate()) {
      this.toastService.warning('Verifique os campos obrigatórios e tente novamente.');
      return;
    }

    this.isSubmitting.set(true);
    const payload: VehicleEngineRequest = {
      name: this.name().trim(),
      displacement: this.displacement().trim() || null,
      fuel: this.fuel().trim() || null,
      horsepower: this.horsepower() ?? null,
      active: this.active(),
      version_ids: this.selectedVersionIds(),
    };

    if (this.mode() === 'create') {
      this.createVehicleVersion(payload);
    } else if (this.mode() === 'edit' && this.engine()) {
      this.updateVehicleVersion(payload);
    }
  }

  createVehicleVersion(payload: VehicleEngineRequest) {
    this.vehicleEngineService.create(payload).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        this.toastService.success(response.message || 'Motor de veículo cadastrado com sucesso!');
        this.engineSaved.emit(response.data);
        this.close();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const serverErrors = err?.error?.errors;
        if (serverErrors) {
          const formatted: Record<string, string> = {};
          Object.keys(serverErrors).forEach((key) => {
            formatted[key] = Array.isArray(serverErrors[key])
              ? serverErrors[key][0]
              : serverErrors[key];
          });
          this.formErrors.set(formatted);
        }
        this.toastService.error(err?.error?.message || 'Falha ao cadastrar motor.');
      },
    });
  }

  updateVehicleVersion(payload: VehicleEngineRequest) {
    this.vehicleEngineService.update(this.engine()!.id, payload).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        this.toastService.success(response.message || 'Motor de veículo atualizado com sucesso!');
        this.engineSaved.emit(response.data);
        this.close();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const serverErrors = err?.error?.errors;
        if (serverErrors) {
          const formatted: Record<string, string> = {};
          Object.keys(serverErrors).forEach((key) => {
            formatted[key] = Array.isArray(serverErrors[key])
              ? serverErrors[key][0]
              : serverErrors[key];
          });
          this.formErrors.set(formatted);
        }
        this.toastService.error(err?.error?.message || 'Falha ao atualizar motor.');
      },
    });
  }

  close(): void {
    this.closeForm.emit();
  }
}
