import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
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
import { ProductCodeFormComponent } from './product-code-form/product-code-form';
import { ToastService } from '../../../core/services/toast';
import { ProductService } from '../../../core/services/product-service';
import { ProductCodeService } from '../../../core/services/product-code';
import { TableAction, TableColumn } from '../../../core/models/list-table/list-table.model';
import { SelectOption } from '../../../core/models/design-system/select-option.model';
import { ProductCodeResponse } from '../../../core/models/compatibility/product-codes/product-codes-response.model';
import {
  productCodesTableActions,
  productCodesTableColumns,
} from '../../../utils/product-codes-table-collums';
import { ProductCodeFiltersRequest } from '../../../core/models/compatibility/product-codes/product-code-filters.model';
import { ProductCodeTypeService } from '../../../core/services/product-code-tyes';
import { ProductFilterRequest } from '../../../core/models/products/product-filter-request.model';
import { PaginationMeta } from '../../../core/models/pagination/pagination.model';
import { initialValuesPagination } from '../../../design-system/pagination/utils/initial-values';

@Component({
  selector: 'app-product-codes-page',
  standalone: true,
  imports: [
    CommonModule,
    SelectComponent,
    ButtonComponent,
    ToolbarComponent,
    DataTableComponent,
    PaginationComponent,
    PageHeaderComponent,
    SearchInputComponent,
    ConfirmDialogComponent,
    ProductCodeFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-codes.html',
  styleUrl: './product-codes.css',
})
export class ProductCodesPageComponent implements OnInit {
  private router = inject(Router);
  private toastService = inject(ToastService);
  private productService = inject(ProductService);
  private productCodeService = inject(ProductCodeService);
  private productCodeTypeService = inject(ProductCodeTypeService);

  readonly loading = signal<boolean>(false);
  readonly searchQuery = signal<string>('');
  readonly selectedProductId = signal<string>('');
  readonly selectedTypeId = signal<string>('');
  readonly selectedStatusFilter = signal<string>('');
  readonly page = signal<number>(1);
  readonly perPage = signal<number>(10);
  readonly totalItems = signal<number>(0);

  // Form Drawer State
  readonly isFormOpen = signal<boolean>(false);
  readonly formMode = signal<'create' | 'edit' | 'view'>('create');
  readonly selectedProductCode = signal<ProductCodeResponse | null>(null);

  // Delete Dialog State
  readonly deleteDialogOpen = signal<boolean>(false);
  readonly selectedForDelete = signal<ProductCodeResponse | null>(null);
  readonly isDeleting = signal<boolean>(false);

  readonly statusFilterOptions: SelectOption[] = [];

  readonly columns: TableColumn<ProductCodeResponse>[] = productCodesTableColumns;
  readonly actions: TableAction<ProductCodeResponse>[] = productCodesTableActions;

  products = signal<SelectOption[]>([]);
  typeFilterOptions = signal<SelectOption[]>([]);
  allProductCodes = signal<ProductCodeResponse[]>([]);

  readonly pagination = signal<PaginationMeta>(initialValuesPagination);

  params: ProductCodeFiltersRequest = {
    code: null,
    active: null,
    module: null,
    product_id: null,
    status_code: null,
    code_type_id: null,
    page: this.page(),
    per_page: this.perPage(),
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
    this.loadProductCodes(this.params);
  }

  getProducts(params: ProductFilterRequest): void {
    this.productService.getAll(params).subscribe({
      next: (res) => {
        if (res && res.data) {
          const opts = [
            { label: 'Todos os Produtos', value: '', sublabel: '', module: '', disabled: false },
            ...res.data.map((p) => ({
              label: `${p.name}`,
              value: p.id,
              sublabel: p.internal_code || 'S/C',
              module: '',
              disabled: false,
            })),
          ];
          this.products.set(opts);
        }
      },
    });
  }

  loadProductCodes(params: ProductCodeFiltersRequest): void {
    this.loading.set(true);
    this.productCodeService.getAll(params).subscribe({
      next: (response) => {
        this.allProductCodes.set(response.data || []);
        this.totalItems.set(response.meta.total);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.toastService.error(
          'Erro ao buscar códigos',
          error.message || 'Falha ao carregar lista de códigos de produtos.',
        );
      },
    });
  }

  normalizeParams() {
    this.params = {
      ...this.params,
      product_id: this.selectedProductId(),
      code_type_id: this.selectedTypeId(),
      status_code: this.selectedStatusFilter(),
      page: this.page(),
      per_page: this.perPage(),
    };
    this.loadProductCodes(this.params);
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.page.set(1);
    setTimeout(() => {
      this.normalizeParams();
    }, 200);
  }

  onProductFilterChange(productId: string): void {
    this.selectedProductId.set(productId);
    this.page.set(1);
    setTimeout(() => {
      this.normalizeParams();
    }, 200);
  }

  onTypeFilterChange(typeId: string): void {
    this.selectedTypeId.set(typeId);
    this.page.set(1);
    setTimeout(() => {
      this.normalizeParams();
    }, 200);
  }

  onStatusFilterChange(status: string): void {
    this.selectedStatusFilter.set(status);
    this.page.set(1);
    setTimeout(() => {
      this.normalizeParams();
    }, 200);
  }

  onPageChange(page: number): void {
    this.page.set(page);
  }

  onPageSizeChange(size: number): void {
    this.perPage.set(size);
    this.page.set(1);
    setTimeout(() => {
      this.normalizeParams();
    }, 200);
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedTypeId.set('');
    this.selectedProductId.set('');
    this.selectedStatusFilter.set('');
    this.page.set(1);
    this.perPage.set(10);
    setTimeout(() => {
      this.normalizeParams();
    }, 200);
  }

  copyCode(item: ProductCodeResponse): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard
        .writeText(item.code)
        .then(() => {
          this.toastService.info(
            'Código Copiado',
            `Código "${item.code}" copiado para a área de transferência.`,
          );
        })
        .catch(() => {
          this.toastService.info('Código', item.code);
        });
    } else {
      this.toastService.info('Código', item.code);
    }
  }

  newProductCode(): void {
    this.selectedProductCode.set(null);
    this.formMode.set('create');
    this.isFormOpen.set(true);
  }

  viewProductCode(item: ProductCodeResponse): void {
    this.selectedProductCode.set(item);
    this.formMode.set('view');
    this.isFormOpen.set(true);
  }

  editProductCode(item: ProductCodeResponse): void {
    this.selectedProductCode.set(item);
    this.formMode.set('edit');
    this.isFormOpen.set(true);
  }

  closeForm(): void {
    this.isFormOpen.set(false);
    this.selectedProductCode.set(null);
  }

  onProductCodeSaved(): void {
    this.loadProductCodes(this.params);
  }

  goToCodeTypes(): void {
    this.router.navigate(['/compatibility/code-types']);
  }

  confirmDelete(item: ProductCodeResponse): void {
    this.selectedForDelete.set(item);
    this.deleteDialogOpen.set(true);
  }

  executeDelete(): void {
    const item = this.selectedForDelete();
    if (!item) return;

    this.isDeleting.set(true);
    this.productCodeService.delete(item.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.deleteDialogOpen.set(false);
        this.selectedForDelete.set(null);
        this.toastService.success(
          'Código Excluído',
          `O código "${item.code}" foi removido com sucesso.`,
        );
        this.loadProductCodes(this.params);
      },
      error: (error) => {
        this.isDeleting.set(false);
        this.toastService.error(
          'Erro ao excluir código',
          error.message || 'Falha ao remover código do produto.',
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
    this.loadProductCodes(this.params);
  }
}
