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
import { VehicleVersionService } from '../../../../core/services/vehicle-version';
import { VehicleModelService } from '../../../../core/services/vehicle-model';
import { VehicleBrandService } from '../../../../core/services/vehicle-brand';
import { ToastService } from '../../../../core/services/toast';
import { VehicleVersionResponse } from '../../../../core/models/vehicles-version/vehicle-version.model';
import { VehicleModelOption } from '../../../../core/models/vehicles-model/vehicle-model.model';
import { VehicleVersionRequest } from '../../../../core/models/vehicles-version/vehicle-version-request.model';
import { GeneralOptionQuery } from '../../../../core/models/generals/general-option-query.model';
import { VehicleModelStore } from '../../../../core/store/vehicles/vehicle-model/vehicle-model-store';

@Component({
  selector: 'app-vehicle-version-form',
  standalone: true,
  imports: [CommonModule, ButtonComponent, AppIconComponent, DrawerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vehicle-version-form.html',
  styleUrl: './vehicle-version-form.css',
})
export class VehicleVersionFormComponent {
  private vehicleVersionService = inject(VehicleVersionService);
  private vehicleModelService = inject(VehicleModelService);
  private vehicleBrandService = inject(VehicleBrandService);
  private toastService = inject(ToastService);
  private vehicleModelStore = inject(VehicleModelStore);

  readonly isOpen = input<boolean>(false);
  readonly mode = input<'create' | 'edit' | 'view'>('create');
  readonly version = input<VehicleVersionResponse | null>(null);
  readonly preselectedModelId = input<string | null>(null);
  readonly preselectedBrandId = input<string | null>(null);

  readonly closeForm = output<void>();
  readonly versionSaved = output<VehicleVersionResponse>();

  // State Signals
  readonly isSubmitting = signal<boolean>(false);
  readonly modelOptions = signal<VehicleModelOption[]>([]);
  readonly loadingBrands = signal<boolean>(false);
  readonly loadingModels = signal<boolean>(false);

  // Form Field Signals matching Laravel CreateVehicleVersionRequest / UpdateVehicleVersionRequest
  readonly selectedBrandId = signal<string>('');
  readonly vehicleModelId = signal<string>('');
  readonly name = signal<string>('');
  readonly active = signal<boolean>(true);

  // Validation Errors
  readonly formErrors = signal<Record<string, string>>({});

  private params: Partial<GeneralOptionQuery> = {
    search: null,
    active: null,
    per_page: null,
    page: null,
    manufacturer_id: null,
  };

  readonly brandOptions = computed(() => {
    const options = this.vehicleModelStore.optionList();
    return options;
  });

  constructor() {
    effect(() => {
      const open = this.isOpen();
      const currentItem = this.version();
      const currentMode = this.mode();
      const defaultModelId = this.preselectedModelId();
      const defaultBrandId = this.preselectedBrandId();

      if (open) {
        this.formErrors.set({});
        this.loadModelOptions(this.params);

        if ((currentMode === 'edit' || currentMode === 'view') && currentItem) {
          const brandId = currentItem.model?.vehicle_brand_id || '';
          this.selectedBrandId.set(brandId);
          this.vehicleModelId.set(currentItem.vehicle_model_id || '');
          this.name.set(currentItem.name || '');
          this.active.set(currentItem.active !== undefined ? Boolean(currentItem.active) : true);
        } else {
          // Create Mode
          this.selectedBrandId.set(defaultBrandId || '');
          this.vehicleModelId.set(defaultModelId || '');
          this.name.set('');
          this.active.set(true);
        }
      }
    });
  }

  loadModelOptions(params: Partial<GeneralOptionQuery>): void {
    this.loadingModels.set(true);
    this.vehicleModelService.getOptions(params).subscribe({
      next: (res) => {
        this.modelOptions.set(res.data || []);
        this.loadingModels.set(false);
      },
      error: () => {
        this.loadingModels.set(false);
      },
    });
  }

  readonly filteredModelOptions = computed(() => {
    const brandId = this.selectedBrandId();
    const all = this.modelOptions();
    if (!brandId) return all;
    return all.filter((m) => m.vehicle_brand_id === brandId);
  });

  readonly selectedModel = computed(() => {
    const modelId = this.vehicleModelId();
    return this.modelOptions().find((m) => m.id === modelId) || null;
  });

  readonly selectedBrand = computed(() => {
    const model = this.selectedModel();
    if (model?.vehicle_brand_id) {
      return this.brandOptions().find((b) => b.value === model.vehicle_brand_id) || null;
    }
    const brandId = this.selectedBrandId();
    return this.brandOptions().find((b) => b.value === brandId) || null;
  });

  readonly formTitle = computed(() => {
    switch (this.mode()) {
      case 'edit':
        return 'Editar Versão de Veículo';
      case 'view':
        return 'Detalhes da Versão';
      default:
        return 'Nova Versão de Veículo';
    }
  });

  readonly isReadOnly = computed(() => this.mode() === 'view');

  onBrandChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newBrandId = target.value;
    this.selectedBrandId.set(newBrandId);

    // If current selected model does not belong to new brand, reset model
    const currentModel = this.selectedModel();
    if (currentModel && newBrandId && currentModel.vehicle_brand_id !== newBrandId) {
      this.vehicleModelId.set('');
    }

    this.clearFieldError('vehicle_model_id');
  }

  onModelChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const modelId = target.value;
    this.vehicleModelId.set(modelId);

    // Sync brand if unset
    const chosenModel = this.modelOptions().find((m) => m.id === modelId);
    if (chosenModel && chosenModel.vehicle_brand_id) {
      this.selectedBrandId.set(chosenModel.vehicle_brand_id);
    }

    this.clearFieldError('vehicle_model_id');
  }

  onNameChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.name.set(target.value);
    this.clearFieldError('name');
  }

  toggleActive(): void {
    if (this.isReadOnly()) return;
    this.active.update((v) => !v);
  }

  private clearFieldError(field: string): void {
    const current = { ...this.formErrors() };
    delete current[field];
    this.formErrors.set(current);
  }

  validate(): boolean {
    const errors: Record<string, string> = {};
    const modelId = this.vehicleModelId();
    const nameVal = this.name().trim();

    if (!modelId) {
      errors['vehicle_model_id'] = 'O modelo do veículo é obrigatório.';
    }

    if (!nameVal) {
      errors['name'] = 'O nome da versão é obrigatório.';
    } else if (nameVal.length > 255) {
      errors['name'] = 'O nome da versão deve ter no máximo 255 caracteres.';
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
        'Atenção aos campos',
        'Por favor, corrija os erros de validação antes de prosseguir.',
      );
      return;
    }

    this.isSubmitting.set(true);
    const payload: VehicleVersionRequest = {
      vehicle_model_id: this.vehicleModelId(),
      name: this.name().trim(),
      active: this.active(),
      displacement: null,
      fuel: null,
      horsepower: null,
      vehicle_version_id: null,
    };

    if (this.mode() === 'create') {
      this.vehicleVersionService.create(payload).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          this.toastService.success(
            'Versão Cadastrada',
            response.message || 'Versão de veículo criado(a) com sucesso.',
          );
          this.versionSaved.emit(response.data);
          this.close();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          if (err.status === 422 && err.error?.errors) {
            const serverErrors: Record<string, string> = {};
            for (const [key, msgs] of Object.entries(err.error.errors)) {
              if (Array.isArray(msgs) && msgs.length > 0) {
                serverErrors[key] = msgs[0];
              }
            }
            this.formErrors.set(serverErrors);
          }
          this.toastService.error(
            'Falha no Cadastro',
            err.error?.message || 'Não foi possível cadastrar a versão de veículo.',
          );
        },
      });
    } else {
      // Edit Mode
      const currentItem = this.version();
      if (!currentItem) return;
      this.vehicleVersionService.update(currentItem.id, payload).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          this.toastService.success(
            'Versão Atualizada',
            response.message || 'Versão de veículo atualizado(a) com sucesso.',
          );
          this.versionSaved.emit(response.data);
          this.close();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          if (err.status === 422 && err.error?.errors) {
            const serverErrors: Record<string, string> = {};
            for (const [key, msgs] of Object.entries(err.error.errors)) {
              if (Array.isArray(msgs) && msgs.length > 0) {
                serverErrors[key] = msgs[0];
              }
            }
            this.formErrors.set(serverErrors);
          }
          this.toastService.error(
            'Falha na Atualização',
            err.error?.message || 'Não foi possível atualizar a versão de veículo.',
          );
        },
      });
    }
  }

  close(): void {
    this.closeForm.emit();
  }
}
