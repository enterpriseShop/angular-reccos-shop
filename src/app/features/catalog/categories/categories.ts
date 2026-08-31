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
import { categoryTableActions, categoryTableColumns } from '../../../utils/category-table-collums';
import { CategoryDefaultQuery } from '../../../core/models/catetories/categories-default-query';
import { PaginationMeta } from '../../../core/models/pagination/pagination.model';
import { initialValuesPagination } from '../../../design-system/pagination/utils/initial-values';

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

  private readonly perPage = signal<number>(25);
  private readonly currentPage = signal<number>(1);

  readonly loading = signal<boolean>(false);
  readonly searchQuery = signal<string>('');
  readonly selectedStatus = signal<string>('');

  // Category Form Drawer State
  readonly isFormOpen = signal<boolean>(false);
  readonly formMode = signal<'create' | 'edit' | 'view'>('create');
  readonly selectedCategory = signal<CategoryResponse | null>(null);

  // Delete Dialog State
  readonly isDeleting = signal<boolean>(false);
  readonly deleteDialogOpen = signal<boolean>(false);
  readonly selectedCategoryForDelete = signal<CategoryResponse | null>(null);

  readonly allCategories = signal<CategoryResponse[]>([]);
  readonly pagination = signal<PaginationMeta>(initialValuesPagination);

  // Helper map to lookup category names by id for parent resolution
  readonly categoryMap = computed(() => {
    const map = new Map<string, string>();
    for (const cat of this.allCategories()) {
      map.set(cat.id, cat.name);
    }
    return map;
  });

  readonly columns: TableColumn<CategoryResponse>[] = categoryTableColumns;
  readonly actions: TableAction<CategoryResponse>[] = categoryTableActions;

  readonly totalItens = signal<number>(0);
  query: CategoryDefaultQuery = {
    name: null,
    active: null,
    parent_id: null,
    page: this.currentPage(),
    per_page: this.perPage(),
  };

  ngOnInit(): void {
    this.getPaginationAllCategories(this.query);
  }

  getPaginationAllCategories(filters: CategoryDefaultQuery): void {
    this.loading.set(true);
    this.categoryService.getAll(filters).subscribe({
      next: (response) => {
        this.allCategories.set(response.data);
        this.loading.set(false);
        this.pagination.set(response.meta);
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

  onSearchChange(query: string): void {
    this.query = { ...this.query, name: query };
    this.searchQuery.set(query);
    this.getPaginationAllCategories(this.query);
  }

  onStatusChange(status: string): void {
    this.query = { ...this.query, active: status === 'active' };
    this.selectedStatus.set(status);
    this.getPaginationAllCategories(this.query);
  }

  onPaginationChange(meta: PaginationMeta): void {
    this.pagination.set(meta);
    this.query = {
      ...this.query,
      page: meta.current_page,
      per_page: meta.per_page,
    };
    this.getPaginationAllCategories(this.query);
  }

  onActionClick(event: { actionId: string; row: CategoryResponse }): void {
    switch (event.actionId) {
      case 'view':
        this.viewCategory(event.row);
        break;
      case 'edit':
        this.editCategory(event.row);
        break;
      case 'delete':
        this.confirmDelete(event.row);
        break;
    }
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedStatus.set('');
    this.query = {
      name: null,
      active: null,
      parent_id: null,
      page: this.currentPage(),
      per_page: this.perPage(),
    };
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
    this.getPaginationAllCategories(this.query);
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
      next: (response) => {
        this.isDeleting.set(false);
        this.deleteDialogOpen.set(false);
        this.getPaginationAllCategories(this.query);
        this.toastService.success(
          response.message,
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
