import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PageHeaderComponent } from '../../../design-system/page-header/page-header';
import { ToolbarComponent } from '../../../design-system/toolbar/toolbar';
import { SearchInputComponent } from '../../../design-system/input/search-input';
import { SelectComponent } from '../../../design-system/select/select';
import { ButtonComponent } from '../../../design-system/button/button';
import { DataTableComponent } from '../../../design-system/data-table/data-table';
import { PaginationComponent } from '../../../design-system/pagination/pagination';
import { ConfirmDialogComponent } from '../../../design-system/dialog/confirm-dialog';
import { AppIconComponent } from '../../../design-system/icon/app-icon';
import { CodeTypeFormComponent } from './code-type-form/code-type-form';
import { ToastService } from '../../../core/services/toast';
import { ProductCodeTypeService } from '../../../core/services/product-code-tyes';
import { ProductCodeTypeResponse } from '../../../core/models/compatibility/product-code-type/product-code-type-response.model';
import { TableAction, TableColumn } from '../../../core/models/list-table/list-table.model';
import { productCodesTableColumns } from '../../../utils/product-codes-table-collums';
import {
  productCodeTypesTableColumns,
  productCodeTypeTableActions,
} from '../../../utils/product-codes-types-table-collums';
import { ProductCodeTypeFiltersRequest } from '../../../core/models/compatibility/product-code-type/product-code-types-filters.model';
import { PaginationMeta } from '../../../core/models/pagination/pagination.model';
import { initialValuesPagination } from '../../../design-system/pagination/utils/initial-values';
import { SelectOption } from '../../../core/models/design-system/select-option.model';
import { StatusStore } from '../../../core/store/status-store/status-store';

@Component({
  selector: 'app-code-types-page',
  standalone: true,
  imports: [
    CommonModule,
    SelectComponent,
    ButtonComponent,
    ToolbarComponent,
    AppIconComponent,
    DataTableComponent,
    PaginationComponent,
    PageHeaderComponent,
    SearchInputComponent,
    CodeTypeFormComponent,
    ConfirmDialogComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './code-types.html',
  styleUrl: './code-types.css',
})
export class CodeTypesPageComponent implements OnInit {
  private router = inject(Router);
  private statusStore = inject(StatusStore);
  private toastService = inject(ToastService);
  private productCodeTypeService = inject(ProductCodeTypeService);

  readonly loading = signal<boolean>(false);
  readonly searchQuery = signal<string>('');
  readonly status = signal<string>('');
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(10);
  readonly totalItems = signal<number>(0);

  // Form Drawer State
  readonly isFormOpen = signal<boolean>(false);
  readonly formMode = signal<'create' | 'edit' | 'view'>('create');
  readonly selectedCodeType = signal<ProductCodeTypeResponse | null>(null);

  // Delete Dialog State
  readonly deleteDialogOpen = signal<boolean>(false);
  readonly selectedForDelete = signal<ProductCodeTypeResponse | null>(null);
  readonly isDeleting = signal<boolean>(false);

  readonly allCodeTypes = signal<ProductCodeTypeResponse[]>([]);
  private loadRequestId = 0;

  readonly statusFilterOptions = computed<SelectOption[]>(() => {
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

  readonly columns: TableColumn<ProductCodeTypeResponse>[] = productCodeTypesTableColumns;
  readonly actions: TableAction<ProductCodeTypeResponse>[] = productCodeTypeTableActions;

  readonly pagination = signal<PaginationMeta>(initialValuesPagination);

  // Quick KPI Signals
  readonly totalTypesCount = computed(() => this.allCodeTypes().length);
  readonly activeTypesCount = computed(
    () => this.allCodeTypes().filter((t) => t.status?.name === 'Ativo').length,
  );
  // Total associated codes is not available in the current model
  readonly totalAssociatedCodesCount = computed(() => 0);

  params: ProductCodeTypeFiltersRequest = {
    name: null,
    active: null,
    status_id: null,
    status_code: null,
    page: this.currentPage(),
    per_page: this.pageSize(),
  };

  ngOnInit(): void {
    this.statusStore.hydrate();
    this.loadCodeTypes(this.params);
  }

  loadCodeTypes(params: ProductCodeTypeFiltersRequest): void {
    const requestId = ++this.loadRequestId;
    this.loading.set(true);
    this.productCodeTypeService.getAll(params).subscribe({
      next: (response) => {
        if (requestId !== this.loadRequestId) return;

        const rows = (response.data ?? []).map((item) => ({ ...item }));
        this.allCodeTypes.set(rows);
        this.pagination.set(response.meta || initialValuesPagination);
        this.currentPage.set(response.meta?.current_page ?? params.page ?? 1);
        this.pageSize.set(response.meta?.per_page ?? params.per_page ?? this.pageSize());
        this.loading.set(false);
      },
      error: (error) => {
        if (requestId !== this.loadRequestId) return;
        this.loading.set(false);
        this.toastService.error(
          'Erro ao buscar tipos',
          error.message || 'Falha ao carregar lista de tipos de códigos.',
        );
      },
    });
  }

  readonly filteredCodeTypes = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const st = this.status();

    return this.allCodeTypes().filter((item) => {
      const nameStr = (item.name || '').toLowerCase();
      const descStr = (item.description || '').toLowerCase();

      const matchesQ = !q || nameStr.includes(q) || descStr.includes(q);
      const matchesStatus = !st || item.status?.id === st;

      return matchesQ && matchesStatus;
    });
  });

  normalizeParams(): void {
    this.params = {
      active: null,
      status_code: null,
      name: this.searchQuery().trim() || null,
      status_id: this.status() || null,
      page: this.currentPage(),
      per_page: this.pageSize(),
    };
    this.loadCodeTypes(this.params);
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
    this.normalizeParams();
  }

  onStatusFilterChange(status: string): void {
    this.status.set(status);
    this.currentPage.set(1);
    this.params.status_id = status;
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
    this.status.set('');
    this.currentPage.set(1);
    this.normalizeParams();
  }

  newCodeType(): void {
    this.selectedCodeType.set(null);
    this.formMode.set('create');
    this.isFormOpen.set(true);
  }

  viewCodeType(item: ProductCodeTypeResponse): void {
    this.selectedCodeType.set(item);
    this.formMode.set('view');
    this.isFormOpen.set(true);
  }

  editCodeType(item: ProductCodeTypeResponse): void {
    this.selectedCodeType.set(item);
    this.formMode.set('edit');
    this.isFormOpen.set(true);
  }

  closeForm(): void {
    this.isFormOpen.set(false);
    this.selectedCodeType.set(null);
  }

  onCodeTypeSaved(): void {
    this.loadCodeTypes(this.params);
  }

  backToProductCodes(): void {
    this.router.navigate(['/compatibility/product-codes']);
  }

  confirmDelete(item: ProductCodeTypeResponse): void {
    this.selectedForDelete.set(item);
    this.deleteDialogOpen.set(true);
  }

  executeDelete(): void {
    const item = this.selectedForDelete();
    if (!item) return;

    this.isDeleting.set(true);
    this.productCodeTypeService.delete(item.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.deleteDialogOpen.set(false);
        this.selectedForDelete.set(null);
        this.toastService.success(
          'Tipo Excluído',
          `O tipo "${item.name}" foi removido com sucesso.`,
        );
        this.loadCodeTypes(this.params);
      },
      error: (error) => {
        this.isDeleting.set(false);
        this.toastService.error(
          'Erro ao excluir tipo',
          error.message || 'Falha ao remover tipo de código.',
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
    this.loadCodeTypes(this.params);
  }

  onActionClick(event: { actionId: string; row: ProductCodeTypeResponse }): void {
    switch (event.actionId) {
      case 'view':
        this.viewCodeType(event.row);
        break;
      case 'edit':
        this.editCodeType(event.row);
        break;
      case 'delete':
        this.confirmDelete(event.row);
        break;
    }
  }
}
