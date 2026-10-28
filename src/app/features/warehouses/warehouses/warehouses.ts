import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { ConfirmDialogComponent } from '../../../design-system/dialog/confirm-dialog';
import { WarehouseFormComponent } from './warehouse-form/warehouse-form';
import { SearchInputComponent } from '../../../design-system/input/search-input';
import { PageHeaderComponent } from '../../../design-system/page-header/page-header';
import { PaginationComponent } from '../../../design-system/pagination/pagination';
import { DataTableComponent } from '../../../design-system/data-table/data-table';
import { AppIconComponent } from '../../../design-system/icon/app-icon';
import { ToolbarComponent } from '../../../design-system/toolbar/toolbar';
import { ButtonComponent } from '../../../design-system/button/button';
import { SelectComponent } from '../../../design-system/select/select';
import { ToastService } from '../../../core/services/toast';
import { WarehouseService } from '../../../core/services/warehouse-service';
import { TableAction, TableColumn } from '../../../core/models/list-table/list-table.model';
import { WarehouseResponse } from '../../../core/models/warehouses/warehouses.interface';
import { StatusStore } from '../../../core/store/status-store/status-store';
import { GeneralOptionQuery } from '../../../core/models/generals/general-option-query.model';

@Component({
  selector: 'app-warehouses-page',
  standalone: true,
  imports: [
    ButtonComponent,
    SelectComponent,
    ToolbarComponent,
    AppIconComponent,
    DataTableComponent,
    PaginationComponent,
    PageHeaderComponent,
    SearchInputComponent,
    WarehouseFormComponent,
    ConfirmDialogComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './warehouses.html',
  styleUrl: './warehouses.css',
})
export class WarehousesPageComponent implements OnInit {
  private toastService = inject(ToastService);
  private warehouseService = inject(WarehouseService);

  private statusStore = inject(StatusStore);

  readonly loading = signal<boolean>(false);
  readonly searchQuery = signal<string>('');
  readonly selectedStatus = signal<string>('');

  readonly perPage = signal<number>(10);
  readonly totalItems = signal<number>(0);
  readonly currentPage = signal<number>(1);

  // Form Drawer State
  readonly isFormOpen = signal<boolean>(false);
  readonly formMode = signal<'create' | 'edit' | 'view'>('create');
  readonly selectedWarehouse = signal<WarehouseResponse | null>(null);

  // Delete Dialog State
  readonly deleteDialogOpen = signal<boolean>(false);
  readonly selectedWarehouseForDelete = signal<WarehouseResponse | null>(null);
  readonly isDeleting = signal<boolean>(false);

  readonly allWarehouses = signal<WarehouseResponse[]>([]);
  readonly statusOptions = computed(() => {
    const options = this.statusStore.statusOptions().filter((m) => m.module === 'MANUFACTURER');
    return options;
  });

  readonly columns: TableColumn<WarehouseResponse>[] = [
    {
      key: 'id',
      header: 'Tipo',
      width: '60px',
      align: 'center',
      type: 'icon',
      iconGetter: () => 'warehouse',
    },
    {
      key: 'code',
      header: 'Código',
      width: '130px',
      valueGetter: (w: WarehouseResponse) => w.code,
    },
    {
      key: 'name',
      header: 'Nome do Depósito',
      width: '260px',
    },
    {
      key: 'description',
      header: 'Descrição / Localização',
      valueGetter: (w: WarehouseResponse) => w.description || '—',
    },
    {
      key: 'inventories_count',
      header: 'Estoque Vinculado',
      width: '150px',
      align: 'center',
      valueGetter: (w: WarehouseResponse) => `${w.inventories_count ?? 0} itens`,
    },
    {
      key: 'status',
      header: 'Status',
      width: '130px',
      align: 'center',
      type: 'badge',
      badgeConfig: (w: WarehouseResponse) => {
        const isAct = w.active ?? w.status?.label?.toLowerCase() === 'active';
        const stCode = (w.status?.label || '').toLowerCase();
        let variant: 'success' | 'danger' | 'warning' | 'neutral' = 'neutral';
        if (isAct || stCode === 'active') {
          variant = 'success';
        } else if (stCode === 'inactive') {
          variant = 'neutral';
        } else {
          variant = 'warning';
        }

        return {
          text: w.status?.label || (isAct ? 'Ativo' : 'Inativo'),
          variant,
        };
      },
    },
    {
      key: 'created_at',
      header: 'Cadastrado em',
      width: '120px',
      align: 'center',
      type: 'date',
    },
  ];

  readonly actions: TableAction<WarehouseResponse>[] = [
    {
      id: 'view',
      label: 'Visualizar',
      icon: 'eye',
      colorClass: 'text-gray-400 hover:text-[#5A8DEE] hover:bg-gray-100 dark:hover:bg-slate-700',
      title: 'Visualizar Detalhes',
      handler: (w) => this.viewWarehouse(w),
    },
    {
      id: 'edit',
      label: 'Editar',
      icon: 'edit',
      colorClass: 'text-gray-400 hover:text-[#4F8A6B] hover:bg-gray-100 dark:hover:bg-slate-700',
      title: 'Editar Depósito',
      handler: (w) => this.editWarehouse(w),
    },
    {
      id: 'delete',
      label: 'Excluir',
      icon: 'trash-2',
      colorClass: 'text-gray-400 hover:text-[#D66A6A] hover:bg-gray-100 dark:hover:bg-slate-700',
      title: 'Excluir Depósito',
      handler: (w) => this.confirmDelete(w),
    },
  ];

  // Quick KPI Computed Signals
  readonly totalCount = computed(() => this.allWarehouses().length);
  readonly activeCount = computed(
    () =>
      this.allWarehouses().filter((w) => w.active ?? w.status?.label?.toLowerCase() === 'active')
        .length,
  );
  readonly totalLinkedProductsCount = computed(() => {
    return this.allWarehouses().reduce((sum, w) => sum + (w.inventories_count ?? 0), 0);
  });

  params: Partial<GeneralOptionQuery> = {
    active: null,
    page: this.currentPage(),
    per_page: this.perPage(),
  };

  ngOnInit(): void {
    this.loadWarehouses(this.params);
  }

  loadWarehouses(params: Partial<GeneralOptionQuery>): void {
    this.loading.set(true);
    this.warehouseService.getAll(params).subscribe({
      next: (response) => {
        this.allWarehouses.set(response.data);
        if (response.meta) {
          this.totalItems.set(response.meta.total);
          this.currentPage.set(response.meta.current_page);
          this.perPage.set(response.meta.per_page);
        } else {
          this.totalItems.set((response.data || []).length);
        }
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.toastService.error(
          'Erro ao buscar depósitos',
          error.message || 'Falha ao carregar lista de depósitos.',
        );
      },
    });
  }

  readonly filteredWarehouses = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const st = this.selectedStatus();

    return this.allWarehouses().filter((w) => {
      const matchesQ =
        !q ||
        w.name.toLowerCase().includes(q) ||
        w.code.toLowerCase().includes(q) ||
        (w.description || '').toLowerCase().includes(q);

      let matchesSt = true;
      if (st === 'active') {
        matchesSt = (w.active ?? w.status?.label?.toLowerCase() === 'active') === true;
      } else if (st === 'inactive') {
        matchesSt = (w.active ?? w.status?.label?.toLowerCase() === 'active') === false;
      } else if (st) {
        matchesSt = w.status.label === st || w.status?.label?.toLowerCase() === st.toLowerCase();
      }

      return matchesQ && matchesSt;
    });
  });

  readonly paginatedWarehouses = computed(() => {
    const all = this.filteredWarehouses();
    const page = this.currentPage();
    const size = this.perPage();
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
    this.perPage.set(size);
    this.currentPage.set(1);
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedStatus.set('');
    this.currentPage.set(1);
    this.toastService.info('Filtros limpos', 'Todos os parâmetros de busca foram resetados.');
  }

  newWarehouse(): void {
    this.selectedWarehouse.set(null);
    this.formMode.set('create');
    this.isFormOpen.set(true);
  }

  editWarehouse(warehouse: WarehouseResponse): void {
    this.selectedWarehouse.set(warehouse);
    this.formMode.set('edit');
    this.isFormOpen.set(true);
  }

  viewWarehouse(warehouse: WarehouseResponse): void {
    this.selectedWarehouse.set(warehouse);
    this.formMode.set('view');
    this.isFormOpen.set(true);
  }

  closeForm(): void {
    this.isFormOpen.set(false);
    this.selectedWarehouse.set(null);
  }

  onWarehouseSaved(): void {
    // this.loadWarehouses();
  }

  confirmDelete(warehouse: WarehouseResponse): void {
    this.selectedWarehouseForDelete.set(warehouse);
    this.deleteDialogOpen.set(true);
  }

  executeDelete(): void {
    const warehouse = this.selectedWarehouseForDelete();
    if (!warehouse) return;

    this.isDeleting.set(true);
    this.warehouseService.deleteWarehouse(warehouse.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.deleteDialogOpen.set(false);
        this.allWarehouses.update((list) => list.filter((w) => w.id !== warehouse.id));
        this.toastService.success(
          'Depósito Excluído',
          `O depósito "${warehouse.name}" (${warehouse.code}) foi removido com sucesso.`,
        );
      },
      error: (err) => {
        this.isDeleting.set(false);
        this.deleteDialogOpen.set(false);
        this.toastService.error('Erro ao excluir', err.message || 'Falha ao remover depósito.');
      },
    });
  }
}
