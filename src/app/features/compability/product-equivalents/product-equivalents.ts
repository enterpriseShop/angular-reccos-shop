import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductEquivalentFormComponent } from './product-equivalent-form/product-equivalent-form';
import { ConfirmDialogComponent } from '../../../design-system/dialog/confirm-dialog';
import { SearchInputComponent } from '../../../design-system/input/search-input';
import { PageHeaderComponent } from '../../../design-system/page-header/page-header';
import { DataTableComponent } from '../../../design-system/data-table/data-table';
import { PaginationComponent } from '../../../design-system/pagination/pagination';
import { AppIconComponent } from '../../../design-system/icon/app-icon';
import { ToolbarComponent } from '../../../design-system/toolbar/toolbar';
import { SelectComponent } from '../../../design-system/select/select';
import { ButtonComponent } from '../../../design-system/button/button';
import { ToastService } from '../../../core/services/toast';
import { ProductService } from '../../../core/services/product-service';
import { ProductEquivalentService } from '../../../core/services/product-equivalent';
import { TableAction, TableColumn } from '../../../core/models/list-table/list-table.model';
import { ProductFilterRequest } from '../../../core/models/products/product-filter-request.model';
import { SelectOption } from '../../../core/models/design-system/select-option.model';
import {
  productEquivalentTableActions,
  productEquivalentTableColumns,
} from '../../../utils/product-equivalent-table-collums';
import { PaginationMeta } from '../../../core/models/pagination/pagination.model';
import { initialValuesPagination } from '../../../design-system/pagination/utils/initial-values';
import { ProductEquivalentResponse } from '../../../core/models/compatibility/product-equivalent/product-equivalent-response';
import { ProductEquivalentFilterParams } from '../../../core/models/compatibility/product-equivalent/product-equivalent-filters.model';

@Component({
  selector: 'app-product-equivalents-page',
  standalone: true,
  imports: [
    CommonModule,
    SelectComponent,
    ButtonComponent,
    AppIconComponent,
    ToolbarComponent,
    DataTableComponent,
    PageHeaderComponent,
    PaginationComponent,
    SearchInputComponent,
    ConfirmDialogComponent,
    ProductEquivalentFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-equivalents.html',
  styleUrl: './product-equivalents.css',
})
export class ProductEquivalentsPageComponent implements OnInit {
  private toastService = inject(ToastService);
  private productService = inject(ProductService);
  private equivalentService = inject(ProductEquivalentService);

  readonly loading = signal<boolean>(false);
  readonly searchQuery = signal<string>('');
  readonly selectedOriginId = signal<string>('');
  readonly selectedTargetId = signal<string>('');
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(10);
  readonly totalItems = signal<number>(0);

  // Form Drawer State
  readonly isFormOpen = signal<boolean>(false);
  readonly formMode = signal<'create' | 'edit' | 'view'>('create');
  readonly selectedEquivalent = signal<ProductEquivalentResponse | null>(null);

  // Delete Dialog State
  readonly deleteDialogOpen = signal<boolean>(false);
  readonly selectedForDelete = signal<ProductEquivalentResponse | null>(null);
  readonly isDeleting = signal<boolean>(false);

  readonly productOptions = signal<SelectOption[]>([]);
  readonly allEquivalents = signal<ProductEquivalentResponse[]>([]);

  readonly pagination = signal<PaginationMeta>(initialValuesPagination);

  readonly columns: TableColumn<ProductEquivalentResponse>[] = productEquivalentTableColumns;
  readonly actions: TableAction<ProductEquivalentResponse>[] = productEquivalentTableActions;

  // Quick KPI Signals
  readonly totalEquivalentsCount = computed(() => this.allEquivalents().length);
  readonly uniqueOriginProductsCount = computed(() => {
    const ids = new Set(
      this.allEquivalents()
        .map((e) => e.product.id)
        .filter(Boolean),
    );
    return ids.size;
  });
  readonly uniqueTargetProductsCount = computed(() => {
    const ids = new Set(
      this.allEquivalents()
        .map((e) => e.id)
        .filter(Boolean),
    );
    return ids.size;
  });

  params: ProductEquivalentFilterParams = {
    page: null,
    per_page: null,
    product_id: null,
    equivalent_product_id: null,
  };

  productParams: ProductFilterRequest = {
    search: null,
    active: null,
    parent_id: null,
    page: 1,
    per_page: 20,
  };

  ngOnInit(): void {
    this.getProducts(this.productParams);
    this.loadEquivalents(this.params);
  }

  getProducts(params: ProductFilterRequest): void {
    this.productService.getAll(params).subscribe({
      next: (res) => {
        const opts: SelectOption[] = [
          {
            label: 'Todos os Produtos',
            value: '',
            sublabel: '',
            disabled: false,
            module: '',
          },
          ...res.data.map((p) => ({
            value: p.id,
            label: p.name,
            sublabel: p.description ?? '',
            disabled: false,
            module: 'PRODUCT',
          })),
        ];
        this.productOptions.set(opts);
      },
    });
  }

  loadEquivalents(params: ProductEquivalentFilterParams): void {
    this.loading.set(true);
    this.equivalentService.getAll(params).subscribe({
      next: (response) => {
        this.allEquivalents.set(response.data || []);
        this.totalItems.set(response.meta.total);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.toastService.error(
          'Erro ao buscar equivalências',
          error.message || 'Falha ao carregar lista de produtos equivalentes.',
        );
      },
    });
  }

  readonly filteredEquivalents = computed(() => {
    // const q = this.searchQuery().toLowerCase().trim();
    // const originId = this.selectedOriginId();
    // const targetId = this.selectedTargetId();

    // return this.allEquivalents().filter((item) => {
    //   const origName = (item.product?.name || '').toLowerCase();
    //   const origCode = (item.product?.internal_code || '').toLowerCase();
    //   const equivName = (item.equivalent_product?.name || '').toLowerCase();
    //   const equivCode = (item.equivalent_product?.internal_code || '').toLowerCase();
    //   const obs = (item.observation || '').toLowerCase();

    //   const matchesQ =
    //     !q ||
    //     origName.includes(q) ||
    //     origCode.includes(q) ||
    //     equivName.includes(q) ||
    //     equivCode.includes(q) ||
    //     obs.includes(q);

    //   const matchesOrigin = !originId || item.product_id === originId;
    //   const matchesTarget = !targetId || item.equivalent_product_id === targetId;

    //   return matchesQ && matchesOrigin && matchesTarget;
    return [];
    // });
  });

  normalizeParams(): void {
    this.params = {
      ...this.params,
      page: this.currentPage(),
      per_page: this.pageSize(),
      product_id: this.selectedOriginId(),
      equivalent_product_id: this.selectedTargetId(),
    };
    this.loadEquivalents(this.params);
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  onOriginFilterChange(productId: string): void {
    this.selectedOriginId.set(productId);
    this.currentPage.set(1);
    this.normalizeParams();
  }

  onTargetFilterChange(productId: string): void {
    this.selectedTargetId.set(productId);
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
    this.selectedOriginId.set('');
    this.selectedTargetId.set('');
    this.currentPage.set(1);
    this.normalizeParams();
  }

  newEquivalent(): void {
    this.selectedEquivalent.set(null);
    this.formMode.set('create');
    this.isFormOpen.set(true);
  }

  viewEquivalent(item: ProductEquivalentResponse): void {
    this.selectedEquivalent.set(item);
    this.formMode.set('view');
    this.isFormOpen.set(true);
  }

  editEquivalent(item: ProductEquivalentResponse): void {
    this.selectedEquivalent.set(item);
    this.formMode.set('edit');
    this.isFormOpen.set(true);
  }

  closeForm(): void {
    this.isFormOpen.set(false);
    this.selectedEquivalent.set(null);
  }

  onEquivalentSaved(): void {
    this.normalizeParams();
  }

  confirmDelete(item: ProductEquivalentResponse): void {
    this.selectedForDelete.set(item);
    this.deleteDialogOpen.set(true);
  }

  executeDelete(): void {
    const item = this.selectedForDelete();
    if (!item) return;

    this.isDeleting.set(true);
    this.equivalentService.delete(item.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.deleteDialogOpen.set(false);
        this.selectedForDelete.set(null);
        this.toastService.success(
          'Equivalência Removida',
          'O relacionamento entre os produtos foi removido com sucesso. Os produtos continuam disponíveis no catálogo.',
        );
        this.normalizeParams();
      },
      error: (error) => {
        this.isDeleting.set(false);
        this.toastService.error(
          'Erro ao remover equivalência',
          error.message || 'Falha ao desvincular os produtos.',
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
    this.normalizeParams();
  }
}
