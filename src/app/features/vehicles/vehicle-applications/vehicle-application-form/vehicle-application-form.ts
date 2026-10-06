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
import { VehicleBrandService } from '../../../../core/services/vehicle-brand';
import { ToastService } from '../../../../core/services/toast';
import { VehicleModelOption } from '../../../../core/models/vehicles-model/vehicle-model.model';
import { VehicleVersionOption } from '../../../../core/models/vehicles-version/vehicle-version.model';
import {
  VehicleApplicationFilters,
  VehicleApplicationRequest,
  VehicleApplicationResponse,
} from '../../../../core/models/vehicle-application/vehicle-application.model';
import { VehicleEngineOption } from '../../../../core/models/vehicles-engine/vehicle-engine.model';

@Component({
  selector: 'app-vehicle-application-form',
  standalone: true,
  imports: [CommonModule, ButtonComponent, AppIconComponent, DrawerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vehicle-application-form.html',
  styleUrl: './vehicle-application-form.css',
})
export class VehicleApplicationFormComponent {
  private vehicleAppService = inject(VehicleApplicationService);
  private vehicleBrandService = inject(VehicleBrandService);
  private toastService = inject(ToastService);

  readonly isOpen = input<boolean>(false);
  readonly mode = input<'create' | 'edit' | 'view'>('create');
  readonly application = input<VehicleApplicationResponse | null>(null);

  readonly closeForm = output<void>();
  readonly applicationSaved = output<VehicleApplicationResponse>();

  // State Signals
  readonly isSubmitting = signal<boolean>(false);
  readonly loadingModels = signal<boolean>(false);
  readonly loadingVersions = signal<boolean>(false);
  readonly loadingEngines = signal<boolean>(false);

  // Form Field Signals matching CreateVehicleApplicationRequest
  readonly brandId = signal<string>('');
  readonly modelId = signal<string>('');
  readonly versionId = signal<string>('');
  readonly engineId = signal<string>('');
  readonly yearFrom = signal<number | null>(null);
  readonly yearTo = signal<number | null>(null);
  readonly notes = signal<string>('');
  readonly active = signal<boolean>(true);

  // Validation Errors (matching Laravel request rules)
  readonly formErrors = signal<Record<string, string>>({});

  // Options Signals
  readonly brandOptions = signal<{ id: string; label: string; image?: string | null }[]>([]);
  readonly modelOptions = signal<VehicleModelOption[]>([]);
  readonly engineOptions = signal<VehicleEngineOption[]>([]);
  readonly versionOptions = signal<VehicleVersionOption[]>([]);

  constructor() {
    this.loadBrands();

    effect(() => {
      const open = this.isOpen();
      const item = this.application();
      const currentMode = this.mode();

      if (open) {
        this.formErrors.set({});

        if ((currentMode === 'edit' || currentMode === 'view') && item) {
          this.brandId.set(item.vehicle_brand_id || '');
          this.yearFrom.set(item.year_from);
          this.yearTo.set(item.year_to);
          this.notes.set(item.notes || '');
          this.active.set(item.active !== undefined ? Boolean(item.active) : true);

          // Populate cascade for edit mode
          if (item.vehicle_brand_id) {
            this.loadModelsForBrand(item.vehicle_brand_id, () => {
              this.modelId.set(item.vehicle_model_id || '');

              if (item.vehicle_model_id) {
                this.loadVersionsForModel(item.vehicle_model_id, () => {
                  this.versionId.set(item.vehicle_version_id || '');

                  if (item.vehicle_version_id) {
                    this.loadEnginesForVersion(item.vehicle_version_id, () => {
                      this.engineId.set(item.vehicle_engine_id || '');
                    });
                  }
                });
              }
            });
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

  private loadBrands(): void {
    const params: Partial<VehicleApplicationFilters> = {
      page: 1,
      per_page: 10,
      search: null,
      vehicle_brand_id: null,
      vehicle_model_id: null,
      year: null,
      active: false,
    };
    this.vehicleBrandService.getOptions(params).subscribe({
      next: (res) => {
        console.log(res);
        this.brandOptions.set([]);
      },
      error: () => {
        // Fallback
        this.brandOptions.set([
          { id: 'vb-00000001-0000-0000-0000-000000000001', label: 'Volkswagen' },
          { id: 'vb-00000002-0000-0000-0000-000000000002', label: 'Fiat' },
          { id: 'vb-00000003-0000-0000-0000-000000000003', label: 'Chevrolet' },
          { id: 'vb-00000004-0000-0000-0000-000000000004', label: 'Ford' },
          { id: 'vb-00000005-0000-0000-0000-000000000005', label: 'Toyota' },
          { id: 'vb-00000006-0000-0000-0000-000000000006', label: 'Honda' },
        ]);
      },
    });
  }

  private loadModelsForBrand(brandId: string, callback?: () => void): void {
    if (!brandId) {
      this.modelOptions.set([]);
      return;
    }
    this.loadingModels.set(true);
    this.vehicleAppService.getModels(brandId).subscribe({
      next: (res) => {
        this.loadingModels.set(false);
        this.modelOptions.set(res.data || []);
        if (callback) callback();
      },
      error: () => {
        this.loadingModels.set(false);
        this.modelOptions.set([]);
      },
    });
  }

  private loadVersionsForModel(modelId: string, callback?: () => void): void {
    if (!modelId) {
      this.versionOptions.set([]);
      return;
    }
    this.loadingVersions.set(true);
    this.vehicleAppService.getVersions(modelId).subscribe({
      next: (res) => {
        this.loadingVersions.set(false);
        this.versionOptions.set(res.data || []);
        if (callback) callback();
      },
      error: () => {
        this.loadingVersions.set(false);
        this.versionOptions.set([]);
      },
    });
  }

  private loadEnginesForVersion(versionId: string, callback?: () => void): void {
    if (!versionId) {
      this.engineOptions.set([]);
      return;
    }
    this.loadingEngines.set(true);
    if (callback) callback();
    // this.vehicleAppService.getEngines().subscribe({
    //   next: (res) => {
    //     this.loadingEngines.set(false);
    //     this.engineOptions.set(res.data);
    //     if (callback) callback();
    //   },
    //   error: () => {
    //     this.loadingEngines.set(false);
    //     this.engineOptions.set([]);
    //   },
    // });
  }

  // Cascading Handlers
  onBrandChange(event: Event): void {
    if (this.isReadOnly()) return;
    const value = (event.target as HTMLSelectElement).value;
    this.brandId.set(value);

    // Reset children cascade
    this.modelId.set('');
    this.versionId.set('');
    this.engineId.set('');
    this.versionOptions.set([]);
    this.engineOptions.set([]);

    this.clearFieldError('vehicle_brand_id');
    this.clearFieldError('vehicle_model_id');
    this.clearFieldError('vehicle_version_id');
    this.clearFieldError('vehicle_engine_id');

    if (value) {
      this.loadModelsForBrand(value);
    } else {
      this.modelOptions.set([]);
    }
  }

  onModelChange(event: Event): void {
    if (this.isReadOnly()) return;
    const value = (event.target as HTMLSelectElement).value;
    this.modelId.set(value);

    // Reset version & engine cascade
    this.versionId.set('');
    this.engineId.set('');
    this.engineOptions.set([]);

    this.clearFieldError('vehicle_model_id');
    this.clearFieldError('vehicle_version_id');
    this.clearFieldError('vehicle_engine_id');

    if (value) {
      this.loadVersionsForModel(value);
    } else {
      this.versionOptions.set([]);
    }
  }

  onVersionChange(event: Event): void {
    if (this.isReadOnly()) return;
    const value = (event.target as HTMLSelectElement).value;
    this.versionId.set(value);

    // Reset engine cascade
    this.engineId.set('');
    this.clearFieldError('vehicle_version_id');
    this.clearFieldError('vehicle_engine_id');

    if (value) {
      this.loadEnginesForVersion(value);
    } else {
      this.engineOptions.set([]);
    }
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

  // Client-side Validation strictly adhering to Laravel CreateVehicleApplicationRequest
  validateForm(): boolean {
    const errors: Record<string, string> = {};
    const bId = this.brandId();
    const mId = this.modelId();
    const vId = this.versionId();
    const yFrom = this.yearFrom();
    const yTo = this.yearTo();

    if (!bId) {
      errors['vehicle_brand_id'] = 'A marca do veículo é obrigatória.';
    }

    if (!mId) {
      errors['vehicle_model_id'] = 'O modelo do veículo é obrigatório.';
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
      vehicle_brand_id: this.brandId(),
      vehicle_model_id: this.modelId(),
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
