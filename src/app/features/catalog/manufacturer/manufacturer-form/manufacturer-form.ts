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
import { ManufacturerRequest } from '../../../../core/models/manufactureres/manufacturer-request.model';
import { ManufacturerService } from '../../../../core/services/manufacture-service';
import { ManufacturerResponse } from '../../../../core/models/manufactureres/manufacturer-response.model';

@Component({
  selector: 'app-manufacturer-form',
  standalone: true,
  imports: [CommonModule, ButtonComponent, AppIconComponent, DrawerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './manufacturer-form.html',
  styleUrl: './manufacturer-form.css',
})
export class ManufacturerFormComponent {
  private manufacturerService = inject(ManufacturerService);
  private toastService = inject(ToastService);

  readonly isOpen = input<boolean>(false);
  readonly mode = input<'create' | 'edit' | 'view'>('create');
  readonly manufacturer = input<ManufacturerResponse | null>(null);

  readonly closeForm = output<void>();
  readonly manufacturerSaved = output<ManufacturerResponse>();

  // Reactive State Signals
  readonly isSubmitting = signal<boolean>(false);
  readonly isAutoSlug = signal<boolean>(true);
  readonly imageLoadError = signal<boolean>(false);

  // Form Field Signals matching ManufacturerRequest
  readonly name = signal<string>('');
  readonly slug = signal<string>('');
  readonly image = signal<string>('');
  readonly website = signal<string>('');
  readonly active = signal<boolean>(true);

  // Validation Errors
  readonly formErrors = signal<Record<string, string>>({});

  constructor() {
    effect(() => {
      const open = this.isOpen();
      const mfr = this.manufacturer();
      const currentMode = this.mode();

      if (open) {
        this.formErrors.set({});
        this.imageLoadError.set(false);

        if ((currentMode === 'edit' || currentMode === 'view') && mfr) {
          this.name.set(mfr.name || '');
          this.slug.set(mfr.slug || '');
          this.image.set(mfr.image || '');
          this.website.set(mfr.website || '');
          this.active.set(mfr.active !== undefined ? Boolean(mfr.active) : true);
          this.isAutoSlug.set(false);
        } else {
          // Create Mode Reset
          this.name.set('');
          this.slug.set('');
          this.image.set('');
          this.website.set('');
          this.active.set(true);
          this.isAutoSlug.set(true);
        }
      }
    });
  }

  // Derived Title & Subtitle
  readonly formTitle = computed(() => {
    switch (this.mode()) {
      case 'edit':
        return 'Editar Fabricante';
      case 'view':
        return 'Detalhes do Fabricante';
      case 'create':
      default:
        return 'Novo Fabricante';
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
      .substring(0, 180);
  }

  // Event Handlers for Inputs
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

  onWebsiteChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.website.set(val.trim());
    if (this.formErrors()['website']) {
      this.clearFieldError('website');
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

  // Client-side Validation strictly adhering to ManufacturerRequest rules
  validateForm(): boolean {
    const errors: Record<string, string> = {};
    const nameVal = this.name().trim();
    const slugVal = this.slug().trim();
    const imageVal = this.image().trim();
    const websiteVal = this.website().trim();

    if (!nameVal) {
      errors['name'] = 'O nome do fabricante é obrigatório.';
    } else if (nameVal.length > 150) {
      errors['name'] = 'O nome não pode exceder 150 caracteres.';
    }

    if (!slugVal) {
      errors['slug'] = 'O slug do fabricante é obrigatório.';
    } else if (slugVal.length > 180) {
      errors['slug'] = 'O slug não pode exceder 180 caracteres.';
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slugVal)) {
      errors['slug'] = 'Formato inválido. Use apenas letras minúsculas, números e hífens.';
    }

    if (imageVal && imageVal.length > 500) {
      errors['image'] = 'A URL da imagem não pode exceder 500 caracteres.';
    }

    if (websiteVal) {
      if (websiteVal.length > 255) {
        errors['website'] = 'A URL do website não pode exceder 255 caracteres.';
      } else if (!/^https?:\/\/.+/i.test(websiteVal)) {
        errors['website'] = 'O website deve ser uma URL válida iniciando com http:// ou https://.';
      }
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

    const payload: ManufacturerRequest = {
      name: this.name().trim(),
      slug: this.slug().trim(),
      image: this.image().trim(),
      website: this.website().trim(),
      active: this.active(),
    };

    if (this.mode() === 'edit' && this.manufacturer()?.id) {
      const id = this.manufacturer()!.id;
      this.manufacturerService.updateManufacturer(id, payload).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          this.toastService.success(
            'Fabricante Atualizado',
            `O fabricante "${response.data.name}" foi salvo com sucesso.`,
          );
          this.manufacturerSaved.emit(response.data);
          this.close();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const msg = err.error?.message || err.message || 'Erro ao atualizar fabricante.';
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
      this.manufacturerService.createManufacturer(payload).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          this.toastService.success(
            'Fabricante Criado',
            `O fabricante "${response.data.name}" foi cadastrado com sucesso.`,
          );
          this.manufacturerSaved.emit(response.data);
          this.close();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const msg = err.error?.message || err.message || 'Erro ao criar fabricante.';
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
