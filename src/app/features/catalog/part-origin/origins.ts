import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { PageHeaderComponent } from '../../../design-system/page-header/page-header';
import { ToolbarComponent } from '../../../design-system/toolbar/toolbar';
import { AppIconComponent } from '../../../design-system/icon/app-icon';
import { SelectComponent } from '../../../design-system/select/select';
import { ButtonComponent } from '../../../design-system/button/button';
import { DataTableComponent } from '../../../design-system/data-table/data-table';
import { PaginationComponent } from '../../../design-system/pagination/pagination';
import { PartOriginFormComponent } from './part-origin-form/part-origin-form';
import { ConfirmDialogComponent } from '../../../design-system/dialog/confirm-dialog';
import { SearchInputComponent } from '../../../design-system/input/search-input';
import { ToastService } from '../../../core/services/toast';
import { PartOriginService } from '../../../core/services/part-origins-service';
import { PartOriginResponse } from '../../../core/models/part-origin/part-origin-response';
import { TableAction, TableColumn } from '../../../core/models/list-table/list-table.model';
import { GeneralOptionQuery } from '../../../core/models/generals/general-option-query.model';
import {
  partOriginTableActions,
  partOriginTableColumns,
} from '../../../utils/part-origin-table-collums';
import { PaginationMeta } from '../../../core/models/pagination/pagination.model';
import { initialValuesPagination } from '../../../design-system/pagination/utils/initial-values';

@Component({
  selector: 'app-origins-page',
  standalone: true,
  imports: [
    ToolbarComponent,
    SelectComponent,
    ButtonComponent,
    AppIconComponent,
    DataTableComponent,
    PaginationComponent,
    PageHeaderComponent,
    SearchInputComponent,
    ConfirmDialogComponent,
    PartOriginFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './origins.html',
  styleUrl: './origins.css',
})
export class OriginsPageComponent implements OnInit {
  private toastService = inject(ToastService);
  private partOriginService = inject(PartOriginService);

  readonly loading = signal<boolean>(false);
  readonly searchQuery = signal<string>('');
  readonly selectedStatus = signal<string>('');

  readonly perPage = signal<number>(10);
  readonly totalItems = signal<number>(0);
  readonly currentPage = signal<number>(1);

  // Form Drawer State
  readonly isFormOpen = signal<boolean>(false);
  readonly formMode = signal<'create' | 'edit' | 'view'>('create');
  readonly selectedOrigin = signal<PartOriginResponse | null>(null);

  // Delete Dialog State
  readonly isDeleting = signal<boolean>(false);
  readonly deleteDialogOpen = signal<boolean>(false);
  readonly selectedOriginForDelete = signal<PartOriginResponse | null>(null);

  readonly allOrigins = signal<PartOriginResponse[]>([]);

  params: Partial<GeneralOptionQuery> = {
    search: null,
    active: null,
    page: this.currentPage(),
    per_page: this.perPage(),
  };

  readonly pagination = signal<PaginationMeta>(initialValuesPagination);
  readonly columns: TableColumn<PartOriginResponse>[] = partOriginTableColumns;
  readonly actions: TableAction<PartOriginResponse>[] = partOriginTableActions;

  // Quick KPI Signals
  readonly totalCount = computed(() => this.allOrigins().length);
  readonly activeCount = computed(() => this.allOrigins().filter((po) => po.active).length);
  readonly withDescriptionCount = computed(
    () => this.allOrigins().filter((po) => !!po.description).length,
  );

  ngOnInit(): void {
    this.loadOrigins(this.params);
  }

  loadOrigins(query: Partial<GeneralOptionQuery>): void {
    this.loading.set(true);
    this.partOriginService.getAll(query).subscribe({
      next: (response) => {
        this.allOrigins.set(response.data);
        this.pagination.set(response.meta);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.toastService.error(
          'Erro ao buscar origens',
          error.message || 'Falha ao carregar lista de origens de peças.',
        );
      },
    });
  }

  onPaginationChange(meta: PaginationMeta): void {
    this.pagination.set(meta);
    this.params = {
      ...this.params,
      page: meta.current_page,
      per_page: meta.per_page,
    };
    this.loadOrigins(this.params);
  }

  onActionClick(event: { actionId: string; row: PartOriginResponse }): void {
    switch (event.actionId) {
      case 'view':
        this.viewOrigin(event.row);
        break;
      case 'edit':
        this.editOrigin(event.row);
        break;
      case 'delete':
        this.confirmDelete(event.row);
        break;
    }
  }

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
    this.params = { ...this.params, page };
    this.loadOrigins(this.params);
  }

  onPageSizeChange(size: number): void {
    this.perPage.set(size);
    this.currentPage.set(1);
    this.params = { ...this.params, per_page: size, page: 1 };
    this.loadOrigins(this.params);
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedStatus.set('');
    this.currentPage.set(1);
    this.toastService.info('Filtros limpos', 'Todos os parâmetros de busca foram resetados.');
  }

  newOrigin(): void {
    this.selectedOrigin.set(null);
    this.formMode.set('create');
    this.isFormOpen.set(true);
  }

  editOrigin(origin: PartOriginResponse): void {
    this.selectedOrigin.set(origin);
    this.formMode.set('edit');
    this.isFormOpen.set(true);
  }

  viewOrigin(origin: PartOriginResponse): void {
    this.selectedOrigin.set(origin);
    this.formMode.set('view');
    this.isFormOpen.set(true);
  }

  closeForm(): void {
    this.isFormOpen.set(false);
    this.selectedOrigin.set(null);
  }

  onOriginSaved(): void {
    this.loadOrigins(this.params);
  }

  confirmDelete(origin: PartOriginResponse): void {
    this.selectedOriginForDelete.set(origin);
    this.deleteDialogOpen.set(true);
  }

  executeDelete(): void {
    const origin = this.selectedOriginForDelete();
    if (!origin) return;

    this.isDeleting.set(true);
    this.partOriginService.delete(origin.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.deleteDialogOpen.set(false);
        this.allOrigins.update((list) => list.filter((po) => po.id !== origin.id));
        this.toastService.success(
          'Origem Excluída',
          `A origem "${origin.name}" foi removida com sucesso.`,
        );
      },
      error: (err) => {
        this.isDeleting.set(false);
        this.deleteDialogOpen.set(false);
        this.toastService.error('Erro ao excluir', err.message || 'Falha ao remover origem.');
      },
    });
  }
}
