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
import { VehicleModelService } from '../../../../core/services/vehicle-model';
import { VehicleBrandService } from '../../../../core/services/vehicle-brand';
import { ToastService } from '../../../../core/services/toast';
import {
  VehicleModelRequest,
  VehicleModelResponse,
} from '../../../../core/models/vehicles-model/vehicle-model.model';
import { VehicleBrandOption } from '../../../../core/models/vehicles-brands/vehicle-brand-response.model';
import { VehicleBrandStore } from '../../../../core/store/vehicles/vehicles-brand/vehicle-brand-store';

@Component({
  selector: 'app-vehicle-model-form',
  standalone: true,
  imports: [CommonModule, ButtonComponent, AppIconComponent, DrawerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vehicle-model-form.html',
  styleUrl: './vehicle-model-form.css',
})
export class VehicleModelFormComponent {
  private vehicleBrandStore = inject(VehicleBrandStore);
  private vehicleModelService = inject(VehicleModelService);
  private vehicleBrandService = inject(VehicleBrandService);
  private toastService = inject(ToastService);

  readonly isOpen = input<boolean>(false);
  readonly mode = input<'create' | 'edit' | 'view'>('create');
  readonly model = input<VehicleModelResponse | null>(null);
  readonly preselectedBrandId = input<string | null>(null);

  readonly closeForm = output<void>();
  readonly modelSaved = output<VehicleModelResponse>();

  // State Signals
  readonly isSubmitting = signal<boolean>(false);
  readonly isAutoSlug = signal<boolean>(true);
  readonly brandOptions = signal<VehicleBrandOption[]>([]);
  readonly loadingBrands = signal<boolean>(false);

  // Form Field Signals matching Laravel CreateVehicleModelRequest / UpdateVehicleModelRequest
  readonly vehicleBrandId = signal<string>('');
  readonly name = signal<string>('');
  readonly slug = signal<string>('');
  readonly active = signal<boolean>(true);

  // Validation Errors
  readonly formErrors = signal<Record<string, string>>({});

  constructor() {
    effect(() => {
      const open = this.isOpen();
      const currentItem = this.model();
      const currentMode = this.mode();
      const defaultBrandId = this.preselectedBrandId();

      if (open) {
        this.formErrors.set({});
        this.loadBrandOptions();

        if ((currentMode === 'edit' || currentMode === 'view') && currentItem) {
          this.vehicleBrandId.set(currentItem.vehicle_brand_id || '');
          this.name.set(currentItem.name || '');
          this.slug.set(currentItem.slug || '');
          this.active.set(currentItem.active !== undefined ? Boolean(currentItem.active) : true);
          this.isAutoSlug.set(false);
        } else {
          // Create Mode Reset
          this.vehicleBrandId.set(defaultBrandId || '');
          this.name.set('');
          this.slug.set('');
          this.active.set(true);
          this.isAutoSlug.set(true);
        }
      }
    });
  }

  loadBrandOptions(): void {
    if (this.brandOptions().length > 0) return;

    this.loadingBrands.set(true);
    this.vehicleBrandStore.optionList();
  }

  readonly selectedBrand = computed(() => {
    const brandId = this.vehicleBrandId();
    return this.brandOptions().find((b) => b.id === brandId) || null;
  });

  readonly formTitle = computed(() => {
    switch (this.mode()) {
      case 'edit':
        return 'Editar Modelo de Veículo';
      case 'view':
        return 'Detalhes do Modelo';
      case 'create':
      default:
        return 'Novo Modelo de Veículo';
    }
  });

  readonly isReadOnly = computed(() => this.mode() === 'view');

  onNameChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    this.name.set(value);

    // Clear error
    if (this.formErrors()['name']) {
      const errors = { ...this.formErrors() };
      delete errors['name'];
      this.formErrors.set(errors);
    }

    // Auto-generate slug if auto mode is on
    if (this.isAutoSlug()) {
      this.slug.set(this.slugify(value));
    }
  }

  onSlugChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.slug.set(input.value.toLowerCase().trim());
    this.isAutoSlug.set(false);

    if (this.formErrors()['slug']) {
      const errors = { ...this.formErrors() };
      delete errors['slug'];
      this.formErrors.set(errors);
    }
  }

  toggleAutoSlug(): void {
    const nextAuto = !this.isAutoSlug();
    this.isAutoSlug.set(nextAuto);
    if (nextAuto) {
      this.slug.set(this.slugify(this.name()));
    }
  }

  onBrandChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.vehicleBrandId.set(select.value);

    if (this.formErrors()['vehicle_brand_id']) {
      const errors = { ...this.formErrors() };
      delete errors['vehicle_brand_id'];
      this.formErrors.set(errors);
    }
  }

  toggleActive(): void {
    if (this.isReadOnly()) return;
    this.active.update((prev) => !prev);
  }

  validate(): boolean {
    const errors: Record<string, string> = {};

    if (!this.vehicleBrandId() || !this.vehicleBrandId().trim()) {
      errors['vehicle_brand_id'] = 'Selecione a marca/montadora correspondente.';
    }

    if (!this.name() || !this.name().trim()) {
      errors['name'] = 'O nome do modelo é obrigatório.';
    } else if (this.name().trim().length > 255) {
      errors['name'] = 'O nome não pode exceder 255 caracteres.';
    }

    if (this.slug() && this.slug().length > 255) {
      errors['slug'] = 'O slug não pode exceder 255 caracteres.';
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
      this.toastService.show({
        type: 'error',
        title: 'Campos Obrigatórios',
        message: 'Por favor, revise os dados antes de salvar o modelo.',
      });
      return;
    }

    this.isSubmitting.set(true);

    const generatedSlug = this.slug().trim() || this.slugify(this.name().trim());

    const payload: VehicleModelRequest = {
      vehicle_brand_id: this.vehicleBrandId().trim(),
      name: this.name().trim(),
      slug: generatedSlug,
      active: this.active(),
    };

    if (this.mode() === 'create') {
      this.createVehicleModel(payload);
    } else if (this.mode() === 'edit' && this.model()) {
      this.updateVehicleModel(this.model()!.id, payload);
    }
  }

  createVehicleModel(payload: VehicleModelRequest) {
    this.vehicleModelService.create(payload).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.toastService.show({
          type: 'success',
          title: 'Modelo Criado',
          message: `O modelo "${res.data.name}" foi registrado com sucesso.`,
        });
        this.modelSaved.emit(res.data);
        this.close();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.handleBackendErrors(err);
      },
    });
  }

  updateVehicleModel(id: string, payload: VehicleModelRequest) {
    this.vehicleModelService.update(this.model()!.id, payload).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.toastService.show({
          type: 'success',
          title: 'Modelo Atualizado',
          message: `As alterações no modelo "${res.data.name}" foram salvas.`,
        });
        this.modelSaved.emit(res.data);
        this.close();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.handleBackendErrors(err);
      },
    });
  }

  private handleBackendErrors(err: unknown): void {
    const errorObj = (err as { error?: { errors?: Record<string, string[]>; message?: string } })
      ?.error;
    if (errorObj?.errors) {
      const newErrors: Record<string, string> = {};
      Object.keys(errorObj.errors).forEach((key) => {
        newErrors[key] = errorObj.errors![key][0];
      });
      this.formErrors.set(newErrors);
    }
    this.toastService.show({
      type: 'error',
      title: 'Erro ao Salvar',
      message: errorObj?.message || 'Ocorreu um erro ao processar o formulário.',
    });
  }

  close(): void {
    this.closeForm.emit();
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
}
