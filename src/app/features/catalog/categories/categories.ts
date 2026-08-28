import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { PageHeaderComponent } from '../../../design-system/page-header/page-header';
import { ToolbarComponent } from '../../../design-system/toolbar/toolbar';
import { SearchInputComponent } from '../../../design-system/input/search-input';
import { SelectComponent } from '../../../design-system/select/select';
import { ButtonComponent } from '../../../design-system/button/button';
import { DataTableComponent } from '../../../design-system/data-table/data-table';
import { PaginationComponent } from '../../../design-system/pagination/pagination';
import { ConfirmDialogComponent } from '../../../design-system/dialog/confirm-dialog';
import { CategoryFormComponent } from './category-form/category-form';
import { ToastService } from '../../../core/services/toast';
import { CategoryService } from '../../../core/services/category-service';
import { CategoryResponse } from '../../../core/models/catetories/categories.model';
import { TableAction, TableColumn } from '../../../core/models/list-table/list-table.model';

@Component({
  selector: 'app-categories-page',
  standalone: true,
  imports: [
    PageHeaderComponent,
    ToolbarComponent,
    SearchInputComponent,
    SelectComponent,
    ButtonComponent,
    DataTableComponent,
    PaginationComponent,
    ConfirmDialogComponent,
    CategoryFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class CategoriesPageComponent implements OnInit {
  private router = inject(Router);
  private toastService = inject(ToastService);
  private readonly categoryService = inject(CategoryService);

  readonly loading = signal<boolean>(false);
  readonly searchQuery = signal<string>('');
  readonly selectedStatus = signal<string>('');
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(10);
  readonly totalItems = signal<number>(0);

  // Category Form Drawer State
  readonly isFormOpen = signal<boolean>(false);
  readonly formMode = signal<'create' | 'edit' | 'view'>('create');
  readonly selectedCategory = signal<CategoryResponse | null>(null);

  // Delete Dialog State
  readonly deleteDialogOpen = signal<boolean>(false);
  readonly selectedCategoryForDelete = signal<CategoryResponse | null>(null);
  readonly isDeleting = signal<boolean>(false);

  readonly allCategories = signal<CategoryResponse[]>([]);

  // Helper map to lookup category names by id for parent resolution
  readonly categoryMap = computed(() => {
    const map = new Map<string, string>();
    for (const cat of this.allCategories()) {
      map.set(cat.id, cat.name);
    }
    return map;
  });

  readonly columns: TableColumn<CategoryResponse>[] = [
    {
      key: 'icon',
      header: 'Ícone',
      width: '70px',
      align: 'center',
      type: 'icon',
      iconGetter: (c) => c.icon || 'folder',
    },
    { key: 'name', header: 'Nome da Categoria' },
    {
      key: 'parent_id',
      header: 'Categoria Pai',
      width: '180px',
      valueGetter: (c) => {
        if (!c.parent_id) return 'Categoria Raiz';
        return this.categoryMap().get(c.parent_id) || 'Categoria Pai';
      },
    },
    { key: 'slug', header: 'Slug / URL', width: '160px' },
    { key: 'display_order', header: 'Ordem', width: '80px', align: 'center' },
    {
      key: 'active',
      header: 'Status',
      width: '120px',
      align: 'center',
      type: 'badge',
      badgeConfig: (c) => ({
        text: c.active ? 'Ativo' : 'Inativo',
        variant: c.active ? 'success' : 'neutral',
      }),
    },
    {
      key: 'created_at',
      header: 'Criado em',
      width: '120px',
      align: 'center',
      type: 'date',
    },
  ];

  readonly actions: TableAction<CategoryResponse>[] = [
    {
      id: 'view',
      label: 'Visualizar',
      icon: 'eye',
      colorClass: 'text-gray-400 hover:text-[#5A8DEE] hover:bg-gray-100 dark:hover:bg-slate-700',
      title: 'Visualizar Detalhes',
      handler: (c) => this.viewCategory(c),
    },
    {
      id: 'edit',
      label: 'Editar',
      icon: 'edit',
      colorClass: 'text-gray-400 hover:text-[#4F8A6B] hover:bg-gray-100 dark:hover:bg-slate-700',
      title: 'Editar Categoria',
      handler: (c) => this.editCategory(c),
    },
    {
      id: 'delete',
      label: 'Excluir',
      icon: 'trash-2',
      colorClass: 'text-gray-400 hover:text-[#D66A6A] hover:bg-gray-100 dark:hover:bg-slate-700',
      title: 'Excluir Categoria',
      handler: (c) => this.confirmDelete(c),
    },
  ];

  ngOnInit(): void {
    this.getPaginationAllCategories();
  }

  getPaginationAllCategories(): void {
    this.loading.set(true);
    this.categoryService.getAll().subscribe({
      next: (response) => {
        this.allCategories.set(response.data);
        if (response.meta) {
          this.totalItems.set(response.meta.total);
          this.currentPage.set(response.meta.current_page);
          this.pageSize.set(response.meta.per_page);
        } else {
          this.totalItems.set(response.data.length);
        }
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.toastService.error(
          'Erro ao buscar categorias',
          error.message || 'Falha ao carregar lista de categorias.',
        );
      },
    });
  }

  readonly filteredCategories = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const st = this.selectedStatus();

    return this.allCategories().filter((c) => {
      const matchesQ =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q);
      const matchesSt = !st || (st === 'active' ? c.active : !c.active);
      return matchesQ && matchesSt;
    });
  });

  readonly paginatedCategories = computed(() => {
    const all = this.filteredCategories();
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return all.slice(start, start + size);
  });

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  onStatusChange(status: string): void {
    this.selectedStatus.set(status);
    this.currentPage.set(1);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedStatus.set('');
    this.currentPage.set(1);
    this.toastService.info('Filtros limpos', 'Todos os parâmetros de busca foram resetados.');
  }

  newCategory(): void {
    this.selectedCategory.set(null);
    this.formMode.set('create');
    this.isFormOpen.set(true);
  }

  editCategory(cat: CategoryResponse): void {
    this.selectedCategory.set(cat);
    this.formMode.set('edit');
    this.isFormOpen.set(true);
  }

  viewCategory(cat: CategoryResponse): void {
    this.selectedCategory.set(cat);
    this.formMode.set('view');
    this.isFormOpen.set(true);
  }

  closeForm(): void {
    this.isFormOpen.set(false);
    this.selectedCategory.set(null);
  }

  onCategorySaved(): void {
    this.getPaginationAllCategories();
  }

  confirmDelete(cat: CategoryResponse): void {
    this.selectedCategoryForDelete.set(cat);
    this.deleteDialogOpen.set(true);
  }

  executeDelete(): void {
    const cat = this.selectedCategoryForDelete();
    if (!cat) return;

    this.isDeleting.set(true);
    this.categoryService.delete(cat.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.deleteDialogOpen.set(false);
        this.allCategories.update((list) => list.filter((c) => c.id !== cat.id));
        this.toastService.success(
          'Categoria Excluída',
          `A categoria "${cat.name}" foi removida com sucesso.`,
        );
      },
      error: (err) => {
        this.isDeleting.set(false);
        this.deleteDialogOpen.set(false);
        this.toastService.error('Erro ao excluir', err.message || 'Falha ao remover categoria.');
      },
    });
  }
}
