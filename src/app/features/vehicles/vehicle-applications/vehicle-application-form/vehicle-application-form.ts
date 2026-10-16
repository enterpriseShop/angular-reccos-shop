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
import { VehicleApplicationService } from '../../../../core/services/vehicle-application';
import { ToastService } from '../../../../core/services/toast';
import {
  VehicleApplicationRequest,
  VehicleApplicationResponse,
} from '../../../../core/models/vehicle-application/vehicle-application.model';
import { VehicleBrandStore } from '../../../../core/store/vehicles/vehicle-brand/vehicle-brand-store';
import { VehicleModelStore } from '../../../../core/store/vehicles/vehicle-model/vehicle-model-store';
import { VehicleEngineStore } from '../../../../core/store/vehicles/vehicle-engine/vehicle-engine-store';
import { VehicleVersionStore } from '../../../../core/store/vehicles/vehicle-version/vehicle-version-store';
import { VehicleGeneralFiltersRequest } from '../../../../core/models/vehicles-model/vehicle-model-filters.models';
import { VehicleModelService } from '../../../../core/services/vehicle-model';
import { VehicleModelInBrandResponse } from '../../../../core/models/vehicles-model/vehicle-model-brand.model';
import { VehicleVersionService } from '../../../../core/services/vehicle-version';
import { ModelInVehicleVersion } from '../../../../core/models/vehicles-version/vehicle-version-model.model';
import { VehicleEngineService } from '../../../../core/services/vehicle-engine';
import { VersionInVehicleEngine } from '../../../../core/models/vehicles-engine/vehicle-engine-version.model';

@Component({
  selector: 'app-vehicle-application-form',
  standalone: true,
  imports: [CommonModule, ButtonComponent, AppIconComponent, DrawerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vehicle-application-form.html',
  styleUrl: './vehicle-application-form.css',
})
export class VehicleApplicationFormComponent {
  private toastService = inject(ToastService);
  private vehicleModelService = inject(VehicleModelService);
  private vehicleEngineService = inject(VehicleEngineService);
  private vehicleAppService = inject(VehicleApplicationService);
  private vehicleVersionService = inject(VehicleVersionService);

  // data store
  private vehicleBrandStore = inject(VehicleBrandStore);
  private vehicleModelStore = inject(VehicleModelStore);
  private vehicleEngineStore = inject(VehicleEngineStore);
  private vehicleVersionStore = inject(VehicleVersionStore);

  readonly isOpen = input<boolean>(false);
  readonly mode = input<'create' | 'edit' | 'view'>('create');
  readonly application = input<VehicleApplicationResponse | null>(null);

  readonly closeForm = output<void>();
  readonly applicationSaved = output<VehicleApplicationResponse>();

  readonly active = signal<boolean>(true);
  readonly isSubmitting = signal<boolean>(false);
  readonly loadingModels = signal<boolean>(false);
  readonly loadingEngines = signal<boolean>(false);
  readonly loadingVersions = signal<boolean>(false);

  // Form Field Signals matching CreateVehicleApplicationRequest
  readonly notes = signal<string>('');
  readonly brandId = signal<string>('');
  readonly modelId = signal<string>('');
  readonly engineId = signal<string>('');
  readonly versionId = signal<string>('');
  readonly yearTo = signal<number | null>(null);
  readonly yearFrom = signal<number | null>(null);

  readonly versionOptions = signal<ModelInVehicleVersion[]>([]);
  readonly engineOptions = signal<VersionInVehicleEngine[]>([]);
  readonly modelOptions = signal<VehicleModelInBrandResponse[]>([]);

  // Validation Errors (matching Laravel request rules)
  readonly formErrors = signal<Record<string, string>>({});

  // Options Signals
  readonly brandOptions = computed(() => this.vehicleBrandStore.optionList());
  // readonly modelOptions = computed(() => this.vehicleModelStore.optionList());
  // readonly engineOptions = computed(() => this.vehicleEngineStore.optionList());
  // readonly versionOptions = computed(() => this.vehicleVersionStore.optionList());

  formatEngineLabel(engine: VersionInVehicleEngine): string {
    const parts: string[] = [engine.name];
    if (engine.displacement) parts.push(engine.displacement);
    if (engine.fuel) parts.push(`(${engine.fuel})`);
    if (engine.horsepower) parts.push(`${engine.horsepower}cv`);
    return parts.join(' - ');
  }

  readonly previewDisplayName = computed(() => {
    const b = this.brandOptions().find((o) => o.value === this.brandId())?.label;
    const m = this.modelOptions().find((o) => o.id === this.modelId())?.name;
    const v = this.versionOptions().find((o) => o.id === this.versionId())?.name;
    const engineObj = this.engineOptions().find((o) => o.id === this.engineId());
    const e = engineObj
      ? this.formatEngineLabel(engineObj)
      : this.engineId()
        ? 'Motor específico'
        : 'Todas as motorizações';
    const yFrom = this.yearFrom();
    const yTo = this.yearTo();
    const years = yFrom || yTo ? `${yFrom || ''}–${yTo || 'Atual'}` : 'Anos não especificados';

    if (!b && !m && !v) {
      return this.mode() === 'edit' ? 'Editar Aplicação' : 'Nova Aplicação Veicular';
    }
    return `${b || 'Marca'} / ${m || 'Modelo'} / ${v || 'Versão'} / ${e} / ${years}`;
  });

  constructor() {
    effect(() => {
      const open = this.isOpen();
      const item = this.application();
      const currentMode = this.mode();

      if (open) {
        this.formErrors.set({});

        if ((currentMode === 'edit' || currentMode === 'view') && item) {
          const brandId = item.vehicle_brand_id || item.brand?.id || '';
          const modelId = item.vehicle_model_id || item.model?.id || '';
          const versionId = item.vehicle_version_id || item.version?.id || '';
          const engineId = item.vehicle_engine_id || item.engine?.id || '';

          this.brandId.set(brandId);
          this.modelId.set(modelId);
          this.versionId.set(versionId);
          this.engineId.set(engineId);
          this.yearFrom.set(item.year_from !== undefined ? item.year_from : null);
          this.yearTo.set(item.year_to !== undefined ? item.year_to : null);
          this.notes.set(item.notes || '');
          this.active.set(item.active !== undefined ? Boolean(item.active) : true);

          // Populate cascade for edit mode
          if (brandId) {
            this.loadModelsForBrand({ vehicle_brand_id: brandId });
          }
          if (modelId) {
            this.loadVersionsForModel({ vehicle_model_id: modelId });
          }
          if (versionId) {
            this.loadEnginesForVersion({ vehicle_version_id: versionId });
          }
        } else {
          // Reset for create
          this.brandId.set('');
          this.modelId.set('');
          this.versionId.set('');
          this.engineId.set('');
          this.yearFrom.set(null);
          this.yearTo.set(null);
          this.notes.set('');
          this.active.set(true);
          this.modelOptions.set([]);
          this.versionOptions.set([]);
          this.engineOptions.set([]);
        }
      }
    });
  }

  readonly formTitle = computed(() => {
    switch (this.mode()) {
      case 'edit':
        return 'Editar Aplicação de Veículo';
      case 'view':
        return 'Detalhes da Aplicação';
      case 'create':
      default:
        return 'Nova Aplicação de Veículo';
    }
  });

  readonly isReadOnly = computed(() => this.mode() === 'view');

  // Cascading Handlers
  onBrandChange(event: Event): void {
    if (this.isReadOnly()) return;
    const value = (event.target as HTMLSelectElement).value;
    this.brandId.set(value);

    const params: Partial<VehicleGeneralFiltersRequest> = {
      vehicle_brand_id: this.brandId() || '',
      model: null,
    };

    // Reset children cascade
    this.modelId.set('');
    this.versionId.set('');
    this.engineId.set('');
    this.versionOptions.set([]);
    this.engineOptions.set([]);

    this.clearFieldError('vehicle_brand_id');
    this.clearFieldError('vehicle_model_id');
    this.clearFieldError('vehicle_engine_id');
    this.clearFieldError('vehicle_version_id');

    if (value) {
      this.loadModelsForBrand(params);
    } else {
      this.modelOptions.set([]);
    }
  }

  onModelChange(event: Event): void {
    if (this.isReadOnly()) return;
    const value = (event.target as HTMLSelectElement).value;
    this.modelId.set(value);

    const params: Partial<VehicleGeneralFiltersRequest> = {
      vehicle_model_id: this.modelId() || '',
    };
    // Reset version & engine cascade
    this.versionId.set('');
    this.engineId.set('');
    this.engineOptions.set([]);
    this.clearFieldError('vehicle_model_id');
    this.clearFieldError('vehicle_engine_id');
    this.clearFieldError('vehicle_version_id');
    if (value) {
      this.loadVersionsForModel(params);
    } else {
      this.versionOptions.set([]);
    }
  }

  onVersionChange(event: Event): void {
    if (this.isReadOnly()) return;
    const value = (event.target as HTMLSelectElement).value;
    this.versionId.set(value);

    const params: Partial<VehicleGeneralFiltersRequest> = {
      vehicle_version_id: this.versionId() || '',
    };

    // Reset engine cascade
    this.engineId.set('');
    this.clearFieldError('vehicle_version_id');
    this.clearFieldError('vehicle_engine_id');
    if (value) {
      this.loadEnginesForVersion(params);
    } else {
      this.engineOptions.set([]);
    }
  }

  loadModelsForBrand(params: Partial<VehicleGeneralFiltersRequest>) {
    this.loadingModels.set(true);
    this.vehicleModelService.getModelByBrand(params).subscribe({
      next: (response) => {
        this.modelOptions.set(response.data);
      },
      error: () => {
        this.modelOptions.set([]);
      },
      complete: () => {
        this.loadingModels.set(false);
      },
    });
  }

  loadVersionsForModel(params: Partial<VehicleGeneralFiltersRequest>) {
    this.loadingVersions.set(true);
    this.vehicleVersionService.getVersionByModel(params).subscribe({
      next: (response) => {
        console.log('[load Versions]', response.data);
        this.versionOptions.set(response.data);
      },
      error: () => {
        this.versionOptions.set([]);
      },
      complete: () => {
        this.loadingVersions.set(false);
      },
    });
  }

  loadEnginesForVersion(params: Partial<VehicleGeneralFiltersRequest>) {
    this.loadingEngines.set(true);
    this.vehicleEngineService.getEngineByVersion(params).subscribe({
      next: (response) => {
        console.log('[load Engines]', response.data);
        this.engineOptions.set(response.data);
      },
      error: () => {
        this.engineOptions.set([]);
      },
      complete: () => {
        this.loadingEngines.set(false);
      },
    });
  }

  onEngineChange(event: Event): void {
    if (this.isReadOnly()) return;
    const value = (event.target as HTMLSelectElement).value;
    this.engineId.set(value);
    this.clearFieldError('vehicle_engine_id');
  }

  onYearFromChange(event: Event): void {
    const rawVal = (event.target as HTMLInputElement).value;
    if (!rawVal) {
      this.yearFrom.set(null);
    } else {
      const num = parseInt(rawVal, 10);
      this.yearFrom.set(isNaN(num) ? null : num);
    }
    this.clearFieldError('year_from');
    this.clearFieldError('year_to');
  }

  onYearToChange(event: Event): void {
    const rawVal = (event.target as HTMLInputElement).value;
    if (!rawVal) {
      this.yearTo.set(null);
    } else {
      const num = parseInt(rawVal, 10);
      this.yearTo.set(isNaN(num) ? null : num);
    }
    this.clearFieldError('year_to');
  }

  onNotesChange(event: Event): void {
    const val = (event.target as HTMLTextAreaElement).value;
    this.notes.set(val);
    this.clearFieldError('notes');
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

  // Client-side Validation strictly adhering to Laravel VehicleApplicationRequest
  validateForm(): boolean {
    const errors: Record<string, string> = {};
    const bId = this.brandId();
    const mId = this.modelId();
    const vId = this.versionId();
    const yFrom = this.yearFrom();
    const yTo = this.yearTo();

    if (!bId) {
      errors['vehicle_brand_id'] = 'Selecione a montadora para filtrar os modelos.';
    }

    if (!mId) {
      errors['vehicle_model_id'] = 'Selecione o modelo para filtrar as versões.';
    }

    if (!vId) {
      errors['vehicle_version_id'] = 'A versão do veículo é obrigatória.';
    }

    if (yFrom !== null) {
      if (!Number.isInteger(yFrom) || yFrom < 1900 || yFrom > 2100) {
        errors['year_from'] = 'O ano inicial deve ser entre 1900 e 2100.';
      }
    }

    if (yTo !== null) {
      if (!Number.isInteger(yTo) || yTo < 1900 || yTo > 2100) {
        errors['year_to'] = 'O ano final deve ser entre 1900 e 2100.';
      } else if (yFrom !== null && yTo < yFrom) {
        errors['year_to'] = 'O ano final deve ser maior ou igual ao ano inicial.';
      }
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
        'Verifique os campos obrigatórios antes de continuar.',
      );
      return;
    }

    this.isSubmitting.set(true);

    const payload: VehicleApplicationRequest = {
      vehicle_version_id: this.versionId(),
      vehicle_engine_id: this.engineId() || null,
      year_from: this.yearFrom(),
      year_to: this.yearTo(),
      notes: this.notes().trim() || null,
      active: this.active(),
    };

    if (this.mode() === 'edit' && this.application()?.id) {
      const id = this.application()!.id;
      this.vehicleAppService.update(id, payload).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          this.toastService.success(
            'Aplicação Atualizada',
            'A aplicação de veículo foi atualizada com sucesso.',
          );
          this.applicationSaved.emit(response.data);
          this.close();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const msg =
            err.error?.message || err.message || 'Erro ao atualizar aplicação de veículo.';
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
      this.vehicleAppService.create(payload).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          this.toastService.success(
            'Aplicação Cadastrada',
            'A nova aplicação veicular foi cadastrada com sucesso.',
          );
          this.applicationSaved.emit(response.data);
          this.close();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const msg =
            err.error?.message || err.message || 'Erro ao cadastrar aplicação de veículo.';
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
