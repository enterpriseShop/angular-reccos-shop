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
import { ManufacturerService } from '../../../core/services/manufacture-service';
import { ProductOemCodeResource } from '../../../core/models/oem-codes/oem-codes.model';
import { TableAction, TableColumn } from '../../../core/models/list-table/list-table.model';
import { ManufacturerStore } from '../../../core/store/manufacturer-store/manufacturer-store';
import { SelectOption } from '../../../core/models/design-system/select-option.model';

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
  private manufacturerService = inject(ManufacturerService);
  private manufacturerStore = inject(ManufacturerStore);

  readonly loading = signal<boolean>(false);
  readonly searchQuery = signal<string>('');
  readonly selectedManufacturerId = signal<string>('');
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(10);
  readonly totalItems = signal<number>(0);

  // Form Drawer State
  readonly isFormOpen = signal<boolean>(false);
  readonly formMode = signal<'create' | 'edit' | 'view'>('create');
  readonly selectedOemCode = signal<ProductOemCodeResource | null>(null);

  // Delete Dialog State
  readonly deleteDialogOpen = signal<boolean>(false);
  readonly selectedOemCodeForDelete = signal<ProductOemCodeResource | null>(null);
  readonly isDeleting = signal<boolean>(false);

  readonly allOemCodes = signal<ProductOemCodeResource[]>([]);

  readonly columns: TableColumn<ProductOemCodeResource>[] = [
    {
      key: 'id',
      header: 'Tipo',
      width: '60px',
      align: 'center',
      type: 'icon',
      iconGetter: () => 'barcode',
    },
    {
      key: 'oem_code',
      header: 'Código OEM',
      width: '220px',
      valueGetter: (item: ProductOemCodeResource) => item.oem_code,
    },
    {
      key: 'manufacturer',
      header: 'Montadora / Fabricante',
      width: '240px',
      valueGetter: (item: ProductOemCodeResource) => item.manufacturer?.name || '—',
    },
    {
      key: 'products_count',
      header: 'Produtos Vinculados',
      width: '160px',
      align: 'center',
      type: 'badge',
      badgeConfig: (item: ProductOemCodeResource) => ({
        text: `${item.products_count ?? 0} produto(s)`,
        variant: Number(item.products_count ?? 0) > 0 ? 'success' : 'neutral',
      }),
    },
    {
      key: 'created_at',
      header: 'Registrado em',
      width: '140px',
      align: 'center',
      type: 'date',
    },
  ];

  readonly actions: TableAction<ProductOemCodeResource>[] = [
    {
      id: 'copy',
      label: 'Copiar',
      icon: 'copy',
      colorClass:
        'text-gray-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700',
      title: 'Copiar Código OEM',
      handler: (item) => this.copyCode(item),
    },
    {
      id: 'view',
      label: 'Visualizar',
      icon: 'eye',
      colorClass: 'text-gray-400 hover:text-[#5A8DEE] hover:bg-gray-100 dark:hover:bg-slate-700',
      title: 'Visualizar Detalhes',
      handler: (item) => this.viewOemCode(item),
    },
    {
      id: 'edit',
      label: 'Editar',
      icon: 'edit',
      colorClass: 'text-gray-400 hover:text-[#4F8A6B] hover:bg-gray-100 dark:hover:bg-slate-700',
      title: 'Editar Código OEM',
      handler: (item) => this.editOemCode(item),
    },
    {
      id: 'delete',
      label: 'Excluir',
      icon: 'trash-2',
      colorClass: 'text-gray-400 hover:text-[#D66A6A] hover:bg-gray-100 dark:hover:bg-slate-700',
      title: 'Excluir Código OEM',
      handler: (item) => this.confirmDelete(item),
    },
  ];

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

  ngOnInit(): void {
    this.loadOemCodes();
  }

  loadOemCodes(): void {
    this.loading.set(true);
    this.oemCodeService.getAll().subscribe({
      next: (response) => {
        this.allOemCodes.set(response.data || []);
        if (response.meta) {
          this.totalItems.set(response.meta.total);
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

  readonly filteredOemCodes = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const mfrId = this.selectedManufacturerId();

    return this.allOemCodes().filter((o) => {
      const code = (o.oem_code || '').toLowerCase();
      const mfrName = (o.manufacturer?.name || '').toLowerCase();
      const currentMfrId = o.manufacturer?.id || '';

      const matchesQ = !q || code.includes(q) || mfrName.includes(q);
      const matchesMfr = !mfrId || currentMfrId === mfrId;

      return matchesQ && matchesMfr;
    });
  });

  readonly paginatedOemCodes = computed(() => {
    const all = this.filteredOemCodes();
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return all.slice(start, start + size);
  });

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  onManufacturerChange(mfrId: string): void {
    this.selectedManufacturerId.set(mfrId);
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
    this.selectedManufacturerId.set('');
    this.currentPage.set(1);
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
    this.loadOemCodes();
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
        this.loadOemCodes();
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
}
