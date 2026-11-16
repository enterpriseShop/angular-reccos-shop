import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { PageHeaderComponent } from '../../design-system/page-header/page-header';
import { ToolbarComponent } from '../../design-system/toolbar/toolbar';
import { SearchInputComponent } from '../../design-system/input/search-input';
import { SelectComponent } from '../../design-system/select/select';
import { ButtonComponent } from '../../design-system/button/button';
import { DataTableComponent } from '../../design-system/data-table/data-table';
import { PaginationComponent } from '../../design-system/pagination/pagination';
import { ConfirmDialogComponent } from '../../design-system/dialog/confirm-dialog';
import { AppIconComponent } from '../../design-system/icon/app-icon';
import { SupplierFormComponent, BRAZILIAN_STATES } from './components/supplier-form/supplier-form';
import { ToastService } from '../../core/services/toast';
import { PaginationMeta } from '../../core/models/pagination/pagination.model';
import { initialValuesPagination } from '../../design-system/pagination/utils/initial-values';
import { SupplierFilterRequest } from '../../core/models/suppliers/supplier-filter-request.model';
import { SupplierService } from '../../core/services/supplier';
import { StatusService } from '../../core/services/status-service';
import { SupplierResponse } from '../../core/models/suppliers/supplier-response.model';
import { SelectOption } from '../../core/models/design-system/select-option.model';
import { TableAction, TableColumn } from '../../core/models/list-table/list-table.model';
import { supplierTableActions, supplierTableColumns } from '../../utils/supplier-table-collums';
import { StatusStore } from '../../core/store/status-store/status-store';

@Component({
  selector: 'app-suppliers-page',
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
    AppIconComponent,
    SupplierFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './suppliers.html',
  styleUrl: './suppliers.css',
})
export class SuppliersPageComponent implements OnInit {
  private router = inject(Router);
  private statusStore = inject(StatusStore);
  private toastService = inject(ToastService);
  private statusService = inject(StatusService);
  private supplierService = inject(SupplierService);

  readonly loading = signal<boolean>(false);
  readonly searchQuery = signal<string>('');
  readonly selectedStatus = signal<string>('');
  readonly selectedState = signal<string>('');
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(10);
  readonly totalItems = signal<number>(0);

  // Form Drawer State
  readonly isFormOpen = signal<boolean>(false);
  readonly formMode = signal<'create' | 'edit' | 'view'>('create');
  readonly selectedSupplier = signal<SupplierResponse | null>(null);

  // Delete Dialog State
  readonly deleteDialogOpen = signal<boolean>(false);
  readonly selectedSupplierForDelete = signal<SupplierResponse | null>(null);
  readonly isDeleting = signal<boolean>(false);

  readonly allSuppliers = signal<SupplierResponse[]>([]);
  readonly statusOptions = computed<SelectOption[]>(() => {
    const result = this.statusStore
      .optionList()
      .filter((m) => m.module === 'PRODUCT_CODE_TYPE')
      .map((m) => ({
        ...m,
        disabled: false,
        module: '',
      }));

    return result;
  });
  readonly pagination = signal<PaginationMeta>(initialValuesPagination);

  params: SupplierFilterRequest = {
    name: null,
    city: null,
    state: null,
    active: null,
    document: null,
    status_id: null,
    page: this.pageSize(),
    per_page: this.currentPage(),
  };

  readonly statusFilterOptions = computed<SelectOption[]>(() => {
    const base: SelectOption[] = [
      { label: 'Todos os Status', value: '', sublabel: '', disabled: false, module: '' },
    ];
    const apiStatuses = this.statusOptions();
    if (apiStatuses.length > 0) {
      return [
        ...base,
        ...apiStatuses.map((st) => ({
          label: st.label,
          value: st.value,
          sublabel: '',
          disabled: false,
          module: '',
        })),
      ];
    }
    return [
      ...base,
      { label: 'Ativo', value: 'active', sublabel: '', disabled: false, module: '' },
      { label: 'Inativo', value: 'inactive', sublabel: '', disabled: false, module: '' },
      { label: 'Em Revisão', value: 'st-04', sublabel: '', disabled: false, module: '' },
    ];
  });

  readonly stateFilterOptions = computed<SelectOption[]>(() => {
    const activeStates = new Set(
      this.allSuppliers()
        .map((s) => (s.state || '').trim().toUpperCase())
        .filter(Boolean),
    );
    const list = BRAZILIAN_STATES.filter(
      (uf) => activeStates.size === 0 || activeStates.has(uf.code),
    ).map((uf) => ({
      label: `${uf.code} — ${uf.name}`,
      value: uf.code,
      sublabel: '',
      disabled: false,
      module: '',
    }));
    return [
      { label: 'Todos os Estados (UF)', value: '', sublabel: '', disabled: false, module: '' },
      ...list,
    ];
  });

  readonly columns: TableColumn<SupplierResponse>[] = supplierTableColumns;
  readonly actions: TableAction<SupplierResponse>[] = supplierTableActions;

  // KPI Computed Signals
  readonly totalCount = computed(() => this.allSuppliers().length);
  readonly activeCount = computed(
    () =>
      // this.allSuppliers().filter((s) => s.active ?? s.status?.code?.toLowerCase() === 'active')
      //   .length,
      0,
  );
  readonly totalContactsCount = computed(
    () =>
      // this.allSuppliers().reduce(
      //   (sum, s) => sum + (s.contacts_count ?? (s.contacts ? s.contacts.length : 0)),
      //   0,
      // ),
      0,
  );
  readonly distinctStatesCount = computed(() => {
    const ufs = new Set(
      this.allSuppliers()
        .map((s) => (s.state || '').trim().toUpperCase())
        .filter(Boolean),
    );
    return ufs.size;
  });

  ngOnInit(): void {
    this.loadSuppliers(this.params);
  }

  loadSuppliers(params: SupplierFilterRequest): void {
    this.loading.set(true);
    this.supplierService.getAll(params).subscribe({
      next: (response) => {
        const list = response.data || [];
        this.allSuppliers.set(list);
        this.pagination.set(response.meta);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.toastService.error(
          'Erro ao buscar fornecedores',
          error.error?.message || error.message || 'Falha ao carregar lista de fornecedores.',
        );
      },
    });
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  onStatusChange(status: string): void {
    this.selectedStatus.set(status);
    this.currentPage.set(1);
  }

  onStateChange(uf: string): void {
    this.selectedState.set(uf);
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
    this.selectedState.set('');
    this.currentPage.set(1);
    this.toastService.info('Filtros limpos', 'Todos os parâmetros de busca foram resetados.');
  }

  newSupplier(): void {
    this.selectedSupplier.set(null);
    this.formMode.set('create');
    this.isFormOpen.set(true);
  }

  editSupplier(supplier: SupplierResponse): void {
    this.selectedSupplier.set(supplier);
    this.formMode.set('edit');
    this.isFormOpen.set(true);
  }

  viewSupplier(supplier: SupplierResponse): void {
    this.router.navigate(['/commercial/suppliers', supplier.id]);
  }

  openSupplierContacts(supplier: SupplierResponse): void {
    this.router.navigate(['/commercial/suppliers', supplier.id], {
      queryParams: { tab: 'contacts' },
    });
  }

  onOpenContactsRequested(supplierId: string): void {
    this.closeForm();
    this.router.navigate(['/commercial/suppliers', supplierId], {
      queryParams: { tab: 'contacts' },
    });
  }

  closeForm(): void {
    this.isFormOpen.set(false);
    this.selectedSupplier.set(null);
  }

  onSupplierSaved(): void {
    this.loadSuppliers(this.params);
  }

  confirmDelete(supplier: SupplierResponse): void {
    this.selectedSupplierForDelete.set(supplier);
    this.deleteDialogOpen.set(true);
  }

  executeDelete(): void {
    const supplier = this.selectedSupplierForDelete();
    if (!supplier) return;

    this.isDeleting.set(true);
    this.supplierService.delete(supplier.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.deleteDialogOpen.set(false);
        this.allSuppliers.update((list) => list.filter((s) => s.id !== supplier.id));
        this.toastService.success(
          'Fornecedor Excluído',
          `"${supplier.trade_name || supplier.corporate_name}" foi removido com sucesso.`,
        );
      },
      error: (err) => {
        this.isDeleting.set(false);
        this.deleteDialogOpen.set(false);
        this.toastService.error(
          'Erro ao excluir',
          err.error?.message || err.message || 'Falha ao remover fornecedor.',
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
    this.loadSuppliers(this.params);
  }
}
