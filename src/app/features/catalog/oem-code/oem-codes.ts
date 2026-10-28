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
import { ConfirmDialogComponent } from '../../../design-system/dialog/confirm-dialog';
import { SearchInputComponent } from '../../../design-system/input/search-input';
import { OemCodeFormComponent } from './oem-code-form/oem-code-form';
import { PaginationComponent } from '../../../design-system/pagination/pagination';
import { DataTableComponent } from '../../../design-system/data-table/data-table';
import { AppIconComponent } from '../../../design-system/icon/app-icon';
import { ButtonComponent } from '../../../design-system/button/button';
import { SelectComponent } from '../../../design-system/select/select';
import { ToastService } from '../../../core/services/toast';
import { OemCodeService } from '../../../core/services/code-oem-service';
import { ProductOemCodeResource } from '../../../core/models/oem-codes/oem-codes.model';
import { TableAction, TableColumn } from '../../../core/models/list-table/list-table.model';
import { ManufacturerStore } from '../../../core/store/manufacturer-store/manufacturer-store';
import { SelectOption } from '../../../core/models/design-system/select-option.model';
import { oemCodesTableActions, oemCodesTableColumns } from '../../../utils/oem-code-table-collums';
import { OemCodeFilterRequest } from '../../../core/models/oem-codes/oem-codes-filter-request.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PaginationMeta } from '../../../core/models/pagination/pagination.model';
import { initialValuesPagination } from '../../../design-system/pagination/utils/initial-values';

@Component({
  selector: 'app-oem-codes-page',
  standalone: true,
  imports: [
    ToolbarComponent,
    PageHeaderComponent,
    SelectComponent,
    ButtonComponent,
    AppIconComponent,
    DataTableComponent,
    PaginationComponent,
    OemCodeFormComponent,
    SearchInputComponent,
    ConfirmDialogComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './oem-codes.html',
  styleUrl: './oem-codes.css',
})
export class OemCodesPageComponent implements OnInit {
  private toastService = inject(ToastService);
  private oemCodeService = inject(OemCodeService);
  private manufacturerStore = inject(ManufacturerStore);

  private searchSubject = new Subject<string>();

  readonly loading = signal<boolean>(false);
  readonly searchQuery = signal<string>('');
  readonly selectedManufacturerId = signal<string>('');
  readonly pageSize = signal<number>(10);
  readonly totalItems = signal<number>(0);
  readonly currentPage = signal<number>(1);
  readonly pagination = signal<PaginationMeta>(initialValuesPagination);

  // Form Drawer State
  readonly isFormOpen = signal<boolean>(false);
  readonly formMode = signal<'create' | 'edit' | 'view'>('create');
  readonly selectedOemCode = signal<ProductOemCodeResource | null>(null);

  // Delete Dialog State
  readonly deleteDialogOpen = signal<boolean>(false);
  readonly selectedOemCodeForDelete = signal<ProductOemCodeResource | null>(null);
  readonly isDeleting = signal<boolean>(false);

  readonly allOemCodes = signal<ProductOemCodeResource[]>([]);
  readonly columns: TableColumn<ProductOemCodeResource>[] = oemCodesTableColumns;
  readonly actions: TableAction<ProductOemCodeResource>[] = oemCodesTableActions;

  // Quick KPI Signals
  readonly totalCount = computed(() => this.allOemCodes().length);
  readonly uniqueManufacturersCount = computed(() => {
    const ids = new Set(
      this.allOemCodes()
        .map((o) => o.manufacturer?.id)
        .filter(Boolean),
    );
    return ids.size;
  });
  readonly linkedProductsCount = signal<number>(0);
  // readonly linkedProductsCount = computed(() => {
  //   return this.allOemCodes().reduce((acc, curr) => acc + (curr.products_count ?? 0), 0);
  // });

  readonly manufacturerFilterOptions = computed<SelectOption[]>(() =>
    this.manufacturerStore.optionList().map((m) => ({
      ...m,
      disabled: false,
      module: '',
    })),
  );

  params = signal<OemCodeFilterRequest>({
    search: null,
    page: this.currentPage(),
    per_page: this.pageSize(),
    manufacturer_id: null,
  });

  constructor() {
    this.searchSubject
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((query) => {
        this.executeSearch(query);
      });
  }

  ngOnInit(): void {
    this.loadOemCodes(this.params());
  }

  loadOemCodes(params: OemCodeFilterRequest): void {
    this.loading.set(true);
    this.oemCodeService.getAll(params).subscribe({
      next: (response) => {
        this.allOemCodes.set(response.data || []);
        if (response.meta) {
          this.totalItems.set(response.meta.total);
          this.currentPage.set(response.meta.current_page);
          this.pageSize.set(response.meta.per_page);
          this.pagination.set(response.meta);
        } else {
          this.totalItems.set((response.data || []).length);
        }
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.toastService.error(
          'Erro ao buscar códigos OEM',
          error.message || 'Falha ao carregar lista de códigos OEM.',
        );
      },
    });
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.searchSubject.next(query);
  }

  onSearchSubmit(): void {
    this.executeSearch(this.searchQuery());
  }

  private executeSearch(query: string): void {
    const trimmed = query.trim();
    const searchVal = trimmed.length > 0 ? trimmed : null;
    this.currentPage.set(1);
    this.params.update((params) => ({
      ...params,
      search: searchVal,
      page: 1,
    }));
    this.loadOemCodes(this.params());
  }

  onManufacturerChange(mfrId: string): void {
    this.selectedManufacturerId.set(mfrId);
    this.currentPage.set(1);
    this.params.update((params) => ({
      ...params,
      manufacturer_id: mfrId ? mfrId : null,
      page: 1,
    }));
    this.loadOemCodes(this.params());
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.params.update((params) => ({
      ...params,
      page,
    }));
    this.loadOemCodes(this.params());
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.params.update((params) => ({
      ...params,
      per_page: size,
      page: 1,
    }));
    this.loadOemCodes(this.params());
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedManufacturerId.set('');
    this.currentPage.set(1);
    this.params.set({
      search: null,
      manufacturer_id: null,
      page: 1,
      per_page: this.pageSize(),
    });
    this.loadOemCodes(this.params());
    this.toastService.info('Filtros limpos', 'Todos os parâmetros de busca foram resetados.');
  }

  copyCode(item: ProductOemCodeResource): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard
        .writeText(item.oem_code)
        .then(() => {
          this.toastService.info(
            'Código Copiado',
            `Código OEM "${item.oem_code}" copiado para a área de transferência.`,
          );
        })
        .catch(() => {
          this.toastService.info('Código OEM', item.oem_code);
        });
    } else {
      this.toastService.info('Código OEM', item.oem_code);
    }
  }

  newOemCode(): void {
    this.selectedOemCode.set(null);
    this.formMode.set('create');
    this.isFormOpen.set(true);
  }

  viewOemCode(item: ProductOemCodeResource): void {
    this.selectedOemCode.set(item);
    this.formMode.set('view');
    this.isFormOpen.set(true);
  }

  editOemCode(item: ProductOemCodeResource): void {
    this.selectedOemCode.set(item);
    this.formMode.set('edit');
    this.isFormOpen.set(true);
  }

  closeForm(): void {
    this.isFormOpen.set(false);
    this.selectedOemCode.set(null);
  }

  onOemCodeSaved(): void {
    this.pageSize.set(10);
    this.currentPage.set(1);
    this.params.update((params) => ({
      ...params,
      page: this.currentPage(),
      per_page: this.pageSize(),
    }));
    this.loadOemCodes(this.params());
  }

  confirmDelete(item: ProductOemCodeResource): void {
    this.selectedOemCodeForDelete.set(item);
    this.deleteDialogOpen.set(true);
  }

  executeDelete(): void {
    const item = this.selectedOemCodeForDelete();
    if (!item) return;

    this.isDeleting.set(true);
    this.oemCodeService.delete(item.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.deleteDialogOpen.set(false);
        this.selectedOemCodeForDelete.set(null);
        this.toastService.success(
          'Código OEM Excluído',
          `O código OEM "${item.oem_code}" foi removido com sucesso.`,
        );
        this.loadOemCodes(this.params());
      },
      error: (error) => {
        this.isDeleting.set(false);
        this.toastService.error(
          'Erro ao excluir código OEM',
          error.message || 'Falha ao remover código OEM.',
        );
      },
    });
  }

  onActionClick(event: { actionId: string; row: ProductOemCodeResource }): void {
    switch (event.actionId) {
      case 'copy':
        this.copyCode(event.row);
        break;
      case 'view':
        this.viewOemCode(event.row);
        break;
      case 'edit':
        this.editOemCode(event.row);
        break;
      case 'delete':
        this.confirmDelete(event.row);
        break;
    }
  }
}
