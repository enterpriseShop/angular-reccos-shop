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
import { SupplierFormComponent } from './components/supplier-form/supplier-form';
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
import { brazilianStates } from '../../utils/barzilian-states';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';

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

  private searchSubscription?: Subscription;
  private searchSubject = new Subject<string>();

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
      .filter((m) => m.module === 'SUPPLIER')
      .map((m) => ({
        ...m,
        disabled: false,
        module: '',
      }));

    return result;
  });

  params: SupplierFilterRequest = {
    name: null,
    city: null,
    state: null,
    active: null,
    document: null,
    status_id: null,
    per_page: this.pageSize(),
    page: this.currentPage(),
  };

  readonly stateFilterOptions = computed<SelectOption[]>(() => {
    return brazilianStates.map((uf) => ({
      label: `${uf.code} — ${uf.name}`,
      value: uf.code,
      sublabel: '',
      disabled: false,
      module: '',
    }));
  });

  readonly columns: TableColumn<SupplierResponse>[] = supplierTableColumns;
  readonly actions: TableAction<SupplierResponse>[] = supplierTableActions;
  readonly pagination = signal<PaginationMeta>(initialValuesPagination);

  readonly activeCount = computed(
    () =>
      this.allSuppliers().filter(
        (s) => s.status?.code ?? s.status?.code?.toLowerCase() === 'active',
      ).length,
    // 0,
  );
  readonly totalContactsCount = computed(() =>
    this.allSuppliers().reduce((sum, s) => sum + (s.contacts?.length || 0), 0),
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
    this.searchSubscription = this.searchSubject
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((queryText) => {
        this.pageSize.set(10);
        this.currentPage.set(1);
        this.searchQuery.set(queryText);
        this.normalizeParams();
      });
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

  normalizeParams(): void {
    this.params = {
      active: null,
      city: null,
      document: null,
      page: this.currentPage(),
      per_page: this.pageSize(),
      name: this.searchQuery(),
      state: this.selectedState(),
      status_id: this.selectedStatus(),
    };
    this.loadSuppliers(this.params);
  }

  onSearchChange(query: string): void {
    this.searchSubject.next(query);
  }

  onStatusChange(status: string): void {
    this.selectedStatus.set(status);
    this.currentPage.set(1);
    this.normalizeParams();
  }

  onStateChange(uf: string): void {
    this.selectedState.set(uf);
    this.currentPage.set(1);
    this.normalizeParams();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.normalizeParams();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.normalizeParams();
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedStatus.set('');
    this.selectedState.set('');
    this.currentPage.set(1);
    this.normalizeParams();
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

  onActionClick(event: { actionId: string; row: SupplierResponse }): void {
    switch (event.actionId) {
      case 'contacts':
        this.openSupplierContacts(event.row);
        break;
      case 'edit':
        this.editSupplier(event.row);
        break;
      case 'delete':
        this.confirmDelete(event.row);
        break;
    }
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
