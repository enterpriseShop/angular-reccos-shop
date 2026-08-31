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
import { CategoryService } from '../../../../core/services/category-service';
import {
  CategoryResponse,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '../../../../core/models/catetories/categories.model';
import { CategoryStore } from '../../../../core/store/category-store/category-store';
import { AutocompleteOption } from '../../../../core/models/design-system/auto-complete.model';

export interface CategoryFormData {
  parent_id: string | null;
  name: string;
  slug: string;
  description: string;
  display_order: number;
  icon: string;
  image: string;
  active: boolean;
}

export interface CuratedIcon {
  name: string;
  label: string;
  category: string;
}

export const CURATED_CATEGORY_ICONS: CuratedIcon[] = [
  { name: 'folder', label: 'Pasta Padrão', category: 'Geral' },
  { name: 'box', label: 'Caixa / Peça', category: 'Geral' },
  { name: 'package', label: 'Pacote / Kit', category: 'Geral' },
  { name: 'layers', label: 'Camadas / Sistema', category: 'Geral' },
  { name: 'tag', label: 'Etiqueta', category: 'Geral' },
  { name: 'wrench', label: 'Ferramenta / Mecânica', category: 'Mecânica' },
  { name: 'settings', label: 'Engrenagem / Config', category: 'Mecânica' },
  { name: 'sliders', label: 'Ajuste / Calibração', category: 'Mecânica' },
  { name: 'activity', label: 'Atividade / Motor', category: 'Mecânica' },
  { name: 'zap', label: 'Elétrica / Ignição', category: 'Elétrica' },
  { name: 'battery', label: 'Bateria / Energia', category: 'Elétrica' },
  { name: 'cpu', label: 'Módulo Eletrônico', category: 'Elétrica' },
  { name: 'truck', label: 'Caminhão / Pesados', category: 'Veicular' },
  { name: 'car', label: 'Automóvel / Leves', category: 'Veicular' },
  { name: 'disc', label: 'Disco / Freios', category: 'Freios' },
  { name: 'shield', label: 'Proteção / Segurança', category: 'Segurança' },
  { name: 'droplet', label: 'Fluido / Óleo', category: 'Fluidos' },
  { name: 'wind', label: 'Ar / Climatização', category: 'Arrefecimento' },
  { name: 'gauge', label: 'Pressão / Medição', category: 'Sensores' },
  { name: 'grid', label: 'Grade / Estrutura', category: 'Carroceria' },
];

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, ButtonComponent, AppIconComponent, DrawerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './category-form.html',
  styleUrl: './category-form.css',
})
export class CategoryFormComponent {
  private toastService = inject(ToastService);
  private categoryStore = inject(CategoryStore);
  private categoryService = inject(CategoryService);

  readonly isOpen = input<boolean>(false);
  readonly mode = input<'create' | 'edit' | 'view'>('create');
  readonly totalItens = input<number>(0);
  readonly category = input<CategoryResponse | null>(null);
  readonly categoriesList = input<CategoryResponse[]>([]);

  readonly closeForm = output<void>();
  readonly categorySaved = output<CategoryResponse>();

  // Reactive State Signals
  readonly isSubmitting = signal<boolean>(false);
  readonly isAutoSlug = signal<boolean>(true);
  readonly iconPickerOpen = signal<boolean>(false);
  readonly iconSearchQuery = signal<string>('');

  // Form Field Signals
  readonly parentId = signal<string | null>(null);
  readonly name = signal<string>('');
  readonly slug = signal<string>('');
  readonly description = signal<string>('');
  readonly displayOrder = signal<number>(0);
  readonly icon = signal<string>('folder');
  readonly image = signal<string>('');
  readonly active = signal<boolean>(true);

  // Validation Errors
  readonly formErrors = signal<Record<string, string>>({});

  constructor() {
    effect(() => {
      const open = this.isOpen();
      const cat = this.category();
      const currentMode = this.mode();
      console.log(['effect'], open, cat, currentMode);

      if (open) {
        this.formErrors.set({});
        this.iconPickerOpen.set(false);
        this.iconSearchQuery.set('');

        if (currentMode === 'edit' || currentMode === 'view') {
          if (cat) {
            this.parentId.set(cat.parent_id || null);
            this.name.set(cat.name || '');
            this.slug.set(cat.slug || '');
            this.description.set(cat.description || '');
            this.displayOrder.set(cat?.display_order || 0);
            this.icon.set(cat.icon || 'folder');
            this.image.set(cat.image || '');
            this.active.set(cat.active !== undefined ? Boolean(cat.active) : true);
            this.isAutoSlug.set(false);
          }
        } else {
          // Create Mode Reset
          this.parentId.set(null);
          this.name.set('');
          this.slug.set('');
          this.description.set('');
          this.displayOrder.set(this.totalItens() + 1);
          this.icon.set('folder');
          this.image.set('');
          this.active.set(true);
          this.isAutoSlug.set(true);
        }
      }
    });
  }

  // Parent Category Options filtered to avoid cyclical hierarchy
  readonly parentCategoryOptions = computed(() => {
    const list = this.categoryStore
      .optionList()
      .filter((c: AutocompleteOption) => c.is_parent === true);
    return list;
  });

  // Filtered Curated Icons list
  readonly filteredIcons = computed(() => {
    const q = this.iconSearchQuery().toLowerCase().trim();
    if (!q) return CURATED_CATEGORY_ICONS;
    return CURATED_CATEGORY_ICONS.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.label.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q),
    );
  });

  // Derived Title & Subtitle
  readonly formTitle = computed(() => {
    switch (this.mode()) {
      case 'edit':
        return 'Editar Categoria';
      case 'view':
        return 'Detalhes da Categoria';
      case 'create':
      default:
        return 'Nova Categoria';
    }
  });

  readonly isReadOnly = computed(() => this.mode() === 'view');

  // Slug Helper: generates slug from text
  generateSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private suggestNextDisplayOrder(): number {
    return this.totalItens() + 1;
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

  onParentChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.parentId.set(val === 'abc' ? null : val);
  }

  onDescriptionChange(event: Event): void {
    const val = (event.target as HTMLTextAreaElement).value;
    this.description.set(val);
  }

  onDisplayOrderChange(event: Event): void {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    console.log('display order:', val);
    this.displayOrder.set(isNaN(val) || val < 0 ? 0 : val);
    console.log('display order:', this.displayOrder());
  }

  incrementDisplayOrder(): void {
    if (this.isReadOnly()) return;
    this.displayOrder.update((n) => n + 1);
  }

  decrementDisplayOrder(): void {
    if (this.isReadOnly()) return;
    this.displayOrder.update((n) => (n > 0 ? n - 1 : 0));
  }

  onImageChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.image.set(val.trim());
  }

  clearImage(): void {
    if (this.isReadOnly()) return;
    this.image.set('');
  }

  onIconChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.icon.set(val.trim() || 'folder');
  }

  selectIcon(iconName: string): void {
    if (this.isReadOnly()) return;
    this.icon.set(iconName);
    this.iconPickerOpen.set(false);
  }

  toggleIconPicker(): void {
    if (this.isReadOnly()) return;
    this.iconPickerOpen.update((v) => !v);
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

  // Client-side Validation
  validateForm(): boolean {
    const errors: Record<string, string> = {};
    const nameVal = this.name().trim();
    const slugVal = this.slug().trim();
    const orderVal = this.displayOrder();

    if (!nameVal) {
      errors['name'] = 'O nome da categoria é obrigatório.';
    } else if (nameVal.length > 255) {
      errors['name'] = 'O nome não pode exceder 255 caracteres.';
    }

    if (!slugVal) {
      errors['slug'] = 'O slug da categoria é obrigatório.';
    } else if (slugVal.length > 255) {
      errors['slug'] = 'O slug não pode exceder 255 caracteres.';
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slugVal)) {
      errors['slug'] = 'Formato inválido. Use apenas letras minúsculas, números e hífens.';
    }

    if (orderVal < 0) {
      errors['display_order'] = 'A ordem de exibição deve ser um número maior ou igual a 0.';
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

    const payload: CreateCategoryPayload | UpdateCategoryPayload = {
      parent_id: this.parentId(),
      name: this.name().trim(),
      slug: this.slug().trim(),
      description: this.description().trim() || null,
      display_order: this.displayOrder(),
      icon: this.icon().trim() || 'folder',
      image: this.image().trim() || null,
      active: this.active(),
    };

    // console.log('ITEMS PARA UPDATE/SAVE', payload);
    // return;

    if (this.mode() === 'edit' && this.category()?.id) {
      const id = this.category()!.id;
      this.categoryService.update(id, payload).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          this.toastService.success(
            'Categoria Atualizada',
            `A categoria "${response.data.name}" foi salva com sucesso.`,
          );
          this.categorySaved.emit(response.data);
          this.close();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const msg = err.error?.message || err.message || 'Erro ao atualizar categoria.';
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
      this.categoryService.create(payload as CreateCategoryPayload).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          this.toastService.success(
            'Categoria Criada',
            `A categoria "${response.data.name}" foi cadastrada com sucesso.`,
          );
          this.categorySaved.emit(response.data);
          this.close();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const msg = err.error?.message || err.message || 'Erro ao criar categoria.';
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
