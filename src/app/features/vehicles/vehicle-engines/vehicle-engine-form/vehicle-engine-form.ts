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
import { VehicleEngineService } from '../../../../core/services/vehicle-engine';
import { VehicleBrandOption } from '../../../../core/models/vehicles-brands/vehicle-brand-response.model';
import { VehicleModelOption } from '../../../../core/models/vehicles-model/vehicle-model.model';
import { VehicleVersionOption } from '../../../../core/models/vehicles-version/vehicle-version.model';
import { VehicleVersionRequest } from '../../../../core/models/vehicles-version/vehicle-version-request.model';
import { GeneralOptionQuery } from '../../../../core/models/generals/general-option-query.model';
import { VehicleApplicationFilters } from '../../../../core/models/vehicle-application/vehicle-application.model';
import { VehicleEngineResponse } from '../../../../core/models/vehicles-engine/vehicle-engine.model';

@Component({
  selector: 'app-vehicle-engine-form',
  standalone: true,
  imports: [CommonModule, ButtonComponent, AppIconComponent, DrawerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vehicle-engine-form.html',
  styleUrl: './vehicle-engine-form.css',
})
export class VehicleEngineFormComponent {
  private vehicleModelService = inject(VehicleModelService);
  private vehicleBrandService = inject(VehicleBrandService);
  private vehicleEngineService = inject(VehicleEngineService);
  private vehicleVersionService = inject(VehicleVersionService);
  private toastService = inject(ToastService);

  readonly isOpen = input<boolean>(false);
  readonly mode = input<'create' | 'edit' | 'view'>('create');
  readonly engine = input<VehicleEngineResponse | null>(null);
  readonly preselectedVersionId = input<string | null>(null);
  readonly preselectedModelId = input<string | null>(null);
  readonly preselectedBrandId = input<string | null>(null);

  readonly closeForm = output<void>();
  readonly engineSaved = output<VehicleEngineResponse>();

  // State Signals
  readonly isSubmitting = signal<boolean>(false);
  readonly brandOptions = signal<VehicleBrandOption[]>([]);
  readonly modelOptions = signal<VehicleModelOption[]>([]);
  readonly versionOptions = signal<VehicleVersionOption[]>([]);
  readonly loadingBrands = signal<boolean>(false);
  readonly loadingModels = signal<boolean>(false);
  readonly loadingVersions = signal<boolean>(false);

  // Form Field Signals matching Laravel CreateVehicleEngineRequest / UpdateVehicleEngineRequest
  readonly selectedBrandId = signal<string>('');
  readonly selectedModelId = signal<string>('');
  readonly vehicleVersionId = signal<string>('');
  readonly name = signal<string>('');
  readonly displacement = signal<string>('');
  readonly fuel = signal<string>('Flex');
  readonly horsepower = signal<number | null>(null);
  readonly active = signal<boolean>(true);

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

  constructor() {
    effect(() => {
      const open = this.isOpen();
      const currentItem = this.engine();
      const currentMode = this.mode();
      const defaultVersionId = this.preselectedVersionId();
      const defaultModelId = this.preselectedModelId();
      const defaultBrandId = this.preselectedBrandId();

      if (open) {
        this.formErrors.set({});
        this.loadBrandOptions();
        this.loadModelOptions();
        this.loadVersionOptions();

        if ((currentMode === 'edit' || currentMode === 'view') && currentItem) {
          const versionObj = currentItem.version;
          const modelObj = versionObj && 'model' in versionObj ? versionObj.model : null;
          const brandId = modelObj && 'vehicle_brand_id' in modelObj ? modelObj.brand?.id : '';
          const modelId =
            versionObj && 'vehicle_model_id' in versionObj ? versionObj.vehicle_model_id : '';

          this.selectedBrandId.set(brandId || '');
          this.selectedModelId.set(modelId || '');
          this.vehicleVersionId.set(currentItem.vehicle_version_id || '');
          this.name.set(currentItem.name || '');
          this.displacement.set(currentItem.displacement || '');
          this.fuel.set(currentItem.fuel || 'Flex');
          this.horsepower.set(
            currentItem.horsepower !== null && currentItem.horsepower !== undefined
              ? Number(currentItem.horsepower)
              : null,
          );
          this.active.set(currentItem.active !== undefined ? Boolean(currentItem.active) : true);
        } else {
          // Create Mode
          this.selectedBrandId.set(defaultBrandId || '');
          this.selectedModelId.set(defaultModelId || '');
          this.vehicleVersionId.set(defaultVersionId || '');
          this.name.set('');
          this.displacement.set('');
          this.fuel.set('Flex');
          this.horsepower.set(null);
          this.active.set(true);
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

  readonly filteredModelOptions = computed(() => {
    const brandId = this.selectedBrandId();
    const all = this.modelOptions();
    if (!brandId) return all;
    return all.filter((m) => m.vehicle_brand_id === brandId);
  });

  readonly filteredVersionOptions = computed(() => {
    const modelId = this.selectedModelId();
    const all = this.versionOptions();
    if (!modelId) return all;
    return all.filter((v) => v.vehicle_model_id === modelId);
  });

  readonly selectedBrand = computed(() => {
    const id = this.selectedBrandId();
    return this.brandOptions().find((b) => b.id === id) || null;
  });

  readonly selectedModel = computed(() => {
    const id = this.selectedModelId();
    return this.modelOptions().find((m) => m.id === id) || null;
  });

  readonly selectedVersion = computed(() => {
    const id = this.vehicleVersionId();
    return this.versionOptions().find((v) => v.id === id) || null;
  });

  private params: Partial<GeneralOptionQuery> = {
    search: null,
    active: null,
    per_page: null,
    page: null,
    manufacturer_id: null,
  };

  // Load cascading options
  private loadBrandOptions(): void {
    this.loadingBrands.set(true);
    const paramsValues = this.params;
    this.vehicleBrandService.getOptions(paramsValues as any).subscribe({
      next: (res) => {
        console.log(res);
        this.brandOptions.set([]);
        this.loadingBrands.set(false);
      },
      error: () => {
        this.loadingBrands.set(false);
      },
    });
  }

  private loadModelOptions(): void {
    this.loadingModels.set(true);
    this.vehicleModelService.getOptions(this.params).subscribe({
      next: (res) => {
        this.modelOptions.set(res.data || []);
        this.loadingModels.set(false);
      },
      error: () => {
        this.loadingModels.set(false);
      },
    });
  }

  private loadVersionOptions(): void {
    this.loadingVersions.set(true);
    this.vehicleVersionService.getOptions(this.params).subscribe({
      next: (res) => {
        this.versionOptions.set(res.data || []);
        this.loadingVersions.set(false);
      },
      error: () => {
        this.loadingVersions.set(false);
      },
    });
  }

  // Filter Handlers
  onBrandChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const brandId = target.value;
    this.selectedBrandId.set(brandId);

    // If currently selected model doesn't belong to the newly selected brand, reset model and version
    if (brandId && this.selectedModelId()) {
      const model = this.modelOptions().find((m) => m.id === this.selectedModelId());
      if (model && model.vehicle_brand_id !== brandId) {
        this.selectedModelId.set('');
        this.vehicleVersionId.set('');
      }
    }
  }

  onModelChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const modelId = target.value;
    this.selectedModelId.set(modelId);

    // Auto-select brand if not selected
    if (modelId) {
      const model = this.modelOptions().find((m) => m.id === modelId);
      if (model && model.vehicle_brand_id && !this.selectedBrandId()) {
        this.selectedBrandId.set(model.vehicle_brand_id);
      }
    }

    // If currently selected version doesn't belong to newly selected model, reset version
    if (modelId && this.vehicleVersionId()) {
      const ver = this.versionOptions().find((v) => v.id === this.vehicleVersionId());
      if (ver && ver.vehicle_model_id !== modelId) {
        this.vehicleVersionId.set('');
      }
    }
  }

  onVersionChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const versionId = target.value;
    this.vehicleVersionId.set(versionId);

    // Auto-select model and brand if not set
    if (versionId) {
      const version = this.versionOptions().find((v) => v.id === versionId);
      if (version && version.vehicle_model_id) {
        this.selectedModelId.set(version.vehicle_model_id);
        const model = this.modelOptions().find((m) => m.id === version.vehicle_model_id);
        if (model && model.vehicle_brand_id) {
          this.selectedBrandId.set(model.vehicle_brand_id);
        }
      }
    }

    if (this.formErrors()['vehicle_version_id']) {
      const errors = { ...this.formErrors() };
      delete errors['vehicle_version_id'];
      this.formErrors.set(errors);
    }
  }

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

  // Client-side Validation strictly mirroring Laravel CreateVehicleEngineRequest
  private validate(): boolean {
    const errors: Record<string, string> = {};

    if (!this.vehicleVersionId()) {
      errors['vehicle_version_id'] = 'A versão do veículo é obrigatória.';
    }

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
    const payload: VehicleVersionRequest = {
      vehicle_version_id: this.vehicleVersionId(),
      name: this.name().trim(),
      displacement: this.displacement().trim() || null,
      fuel: this.fuel().trim() || null,
      horsepower: this.horsepower() ?? null,
      active: this.active(),
      // vehicle_model_id: this.modelId() || null,
      // vehicle_version_id: this.vehicleVersionId() || null,
      vehicle_model_id: '',
    };

    if (this.mode() === 'create') {
      this.createVehicleVersion(payload);
    } else if (this.mode() === 'edit' && this.engine()) {
      this.updateVehicleVersion(payload);
    }
  }

  createVehicleVersion(payload: VehicleVersionRequest) {
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

  updateVehicleVersion(payload: VehicleVersionRequest) {
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
