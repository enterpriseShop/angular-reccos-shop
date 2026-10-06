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
import { VehicleBrandService } from '../../../../core/services/vehicle-brand';
import { ToastService } from '../../../../core/services/toast';
import {
  VehicleBrandPayloadRequest,
  VehicleBrandResponse,
} from '../../../../core/models/vehicles-brands/vehicle-brand-response.model';
import { PaginationMeta } from '../../../../core/models/pagination/pagination.model';
import { initialValuesPagination } from '../../../../design-system/pagination/utils/initial-values';

@Component({
  selector: 'app-vehicle-brand-form',
  standalone: true,
  imports: [CommonModule, ButtonComponent, AppIconComponent, DrawerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vehicle-brand-form.html',
  styleUrl: './vehicle-brand-form.css',
})
export class VehicleBrandFormComponent {
  private vehicleBrandService = inject(VehicleBrandService);
  private toastService = inject(ToastService);

  readonly isOpen = input<boolean>(false);
  readonly mode = input<'create' | 'edit' | 'view'>('create');
  readonly brand = input<VehicleBrandResponse | null>(null);
  readonly pagination = input<PaginationMeta>(initialValuesPagination);

  readonly closeForm = output<void>();
  readonly brandSaved = output<VehicleBrandResponse>();

  // Reactive State Signals
  readonly isSubmitting = signal<boolean>(false);
  readonly isAutoSlug = signal<boolean>(true);
  readonly imageLoadError = signal<boolean>(false);

  // Form Field Signals matching CreateVehicleBransRequest / VehicleBrand model
  readonly name = signal<string>('');
  readonly slug = signal<string>('');
  readonly image = signal<string>('');
  readonly displayOrder = signal<number>(1);
  readonly active = signal<boolean>(true);

  // Validation Errors
  readonly formErrors = signal<Record<string, string>>({});

  constructor() {
    effect(() => {
      const open = this.isOpen();
      const item = this.brand();
      const currentMode = this.mode();

      if (open) {
        this.formErrors.set({});
        this.imageLoadError.set(false);

        if ((currentMode === 'edit' || currentMode === 'view') && item) {
          this.name.set(item.name || '');
          this.slug.set(item.slug || '');
          this.image.set(item.image || '');
          this.displayOrder.set(item.display_order);
          this.active.set(item.active !== undefined ? Boolean(item.active) : true);
          this.isAutoSlug.set(false);
        } else {
          // Create Mode Reset
          this.name.set('');
          this.slug.set('');
          this.image.set('');
          this.displayOrder.set(this.pagination().total + 1);
          this.active.set(true);
          this.isAutoSlug.set(true);
        }
      }
    });
  }

  // Derived Title & State
  readonly formTitle = computed(() => {
    switch (this.mode()) {
      case 'edit':
        return 'Editar Marca de Veículo';
      case 'view':
        return 'Detalhes da Montadora';
      case 'create':
      default:
        return 'Nova Marca de Veículo';
    }
  });

  readonly isReadOnly = computed(() => this.mode() === 'view');

  // Slug Helper
  generateSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 255);
  }

  // Event Handlers
  onNameChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.name.set(value);

    if (this.isAutoSlug()) {
      const generated = this.generateSlug(value);
      this.slug.set(generated);
    }

    if (this.formErrors()['name']) {
      this.clearFieldError('name');
    }
  }

  onSlugChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.slug.set(value.trim());

    if (this.formErrors()['slug']) {
      this.clearFieldError('slug');
    }
  }

  toggleAutoSlug(): void {
    if (this.isReadOnly()) return;
    const newState = !this.isAutoSlug();
    this.isAutoSlug.set(newState);
    if (newState && this.name()) {
      this.slug.set(this.generateSlug(this.name()));
    }
  }

  onImageChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.image.set(val.trim());
    this.imageLoadError.set(false);
    if (this.formErrors()['image']) {
      this.clearFieldError('image');
    }
  }

  clearImage(): void {
    if (this.isReadOnly()) return;
    this.image.set('');
    this.imageLoadError.set(false);
  }

  onDisplayOrderChange(event: Event): void {
    const rawVal = (event.target as HTMLInputElement).value;
    const parsed = parseInt(rawVal, 10);
    this.displayOrder.set(isNaN(parsed) ? 1 : Math.max(0, parsed));
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

  // Client-side Validation strictly adhering to Laravel Request rules
  validateForm(): boolean {
    const errors: Record<string, string> = {};
    const nameVal = this.name().trim();
    const slugVal = this.slug().trim();
    const imageVal = this.image().trim();
    const orderVal = this.displayOrder();

    if (!nameVal) {
      errors['name'] = 'O nome é obrigatório!';
    } else if (nameVal.length > 255) {
      errors['name'] = 'O nome deve ter no máximo 255 caracteres!';
    }

    if (!slugVal) {
      errors['slug'] = 'O slug é obrigatório!';
    } else if (slugVal.length > 255) {
      errors['slug'] = 'O slug deve ter no máximo 255 caracteres!';
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slugVal)) {
      errors['slug'] = 'Formato de slug inválido! Use apenas letras minúsculas, números e hífens.';
    }

    if (imageVal && imageVal.length > 500) {
      errors['image'] = 'A URL da imagem não pode exceder 500 caracteres!';
    }

    if (isNaN(orderVal) || !Number.isInteger(orderVal)) {
      errors['display_order'] = 'A ordem de exibição deve ser um número inteiro!';
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
        'Verifique os campos obrigatórios antes de continuar.',
      );
      return;
    }

    this.isSubmitting.set(true);

    const payload: VehicleBrandPayloadRequest = {
      name: this.name().trim(),
      slug: this.slug().trim(),
      image: this.image().trim() || null,
      display_order: this.displayOrder(),
      active: this.active(),
    };

    if (this.mode() === 'edit' && this.brand()?.id) {
      const id = this.brand()!.id;
      this.vehicleBrandService.update(id, payload).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          this.toastService.success(
            'Montadora Atualizada',
            `A marca "${response.data.name}" foi atualizada com sucesso.`,
          );
          this.brandSaved.emit(response.data);
          this.close();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const msg = err.error?.message || err.message || 'Erro ao atualizar marca de veículo.';
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
      this.vehicleBrandService.create(payload).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          this.toastService.success(
            'Montadora Cadastrada',
            `A marca "${response.data.name}" foi cadastrada com sucesso.`,
          );
          this.brandSaved.emit(response.data);
          this.close();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const msg = err.error?.message || err.message || 'Erro ao cadastrar marca de veículo.';
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
