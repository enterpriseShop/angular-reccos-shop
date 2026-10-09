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
import { ToastService } from '../../../../core/services/toast';
import { VehicleVersionResponse } from '../../../../core/models/vehicles-version/vehicle-version.model';
import { VehicleVersionRequest } from '../../../../core/models/vehicles-version/vehicle-version-request.model';
import { GeneralOptionQuery } from '../../../../core/models/generals/general-option-query.model';
import { VehicleModelStore } from '../../../../core/store/vehicles/vehicle-model/vehicle-model-store';
import { VehicleBrandStore } from '../../../../core/store/vehicles/vehicles-brand/vehicle-brand-store';

@Component({
  selector: 'app-vehicle-version-form',
  standalone: true,
  imports: [CommonModule, ButtonComponent, AppIconComponent, DrawerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vehicle-version-form.html',
  styleUrl: './vehicle-version-form.css',
})
export class VehicleVersionFormComponent {
  private toastService = inject(ToastService);
  private vehicleModelStore = inject(VehicleModelStore);
  private vehicleBrandStore = inject(VehicleBrandStore);
  private vehicleModelService = inject(VehicleModelService);
  private vehicleVersionService = inject(VehicleVersionService);

  readonly isOpen = input<boolean>(false);
  readonly mode = input<'create' | 'edit' | 'view'>('create');
  readonly version = input<VehicleVersionResponse | null>(null);
  readonly preselectedModelId = input<string | null>(null);
  readonly preselectedBrandId = input<string | null>(null);

  readonly closeForm = output<void>();
  readonly versionSaved = output<VehicleVersionResponse>();

  // State Signals
  readonly isSubmitting = signal<boolean>(false);
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
    const options = this.vehicleBrandStore.optionList();
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
        // this.loadModelOptions(this.params);

        if ((currentMode === 'edit' || currentMode === 'view') && currentItem) {
          const brandId = currentItem.model?.brand?.id || '';
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

  readonly filteredModelOptions = computed(() => {
    const options = this.vehicleModelStore.optionList();
    const brandId = this.selectedBrandId();
    if (!brandId) return options;
    return options;
  });

  readonly selectedModel = computed(() => {
    const modelId = this.vehicleModelId();
    return this.filteredModelOptions().find((m) => m.value === modelId) || null;
  });

  readonly selectedBrand = computed(() => {
    // const model = this.selectedModel();
    // if (model?.vehicle_brand_id) {
    //   return this.brandOptions().find((b) => b.value === model.vehicle_brand_id) || null;
    // }
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

  onModelChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const modelId = target.value;
    this.vehicleModelId.set(modelId);

    const brandLabel = this.filteredModelOptions().filter(
      (m) => m.value.toLowerCase() === modelId.toLowerCase(),
    )[0]?.sublabel;
    const selectedbrand = this.brandOptions().filter(
      (b) => b.sublabel.toLowerCase() === brandLabel.toLowerCase(),
    )[0]?.value;

    this.selectedBrandId.set(selectedbrand || '');

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
    };

    if (this.mode() === 'create') {
      this.createVehicleVersion(payload);
    } else {
      const currentItem = this.version();
      if (!currentItem) return;
      this.updateVehicleVersion(currentItem.id, payload);
    }
  }

  updateVehicleVersion(versionId: string, payload: VehicleVersionRequest) {
    this.vehicleVersionService.update(versionId, payload).subscribe({
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

  createVehicleVersion(payload: VehicleVersionRequest) {
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
  }

  close(): void {
    this.closeForm.emit();
  }
}
