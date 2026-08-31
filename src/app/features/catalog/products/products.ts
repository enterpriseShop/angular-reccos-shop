import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit,
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
import { AppIconComponent } from '../../../design-system/icon/app-icon';
import { ToastService } from '../../../core/services/toast';
import { ProductResponse } from '../../../core/models/products/product-response.model';
import { ProductService } from '../../../core/services/product-service';
import { TableAction, TableColumn } from '../../../core/models/list-table/list-table.model';
import { productTableActions, productTableColumns } from '../../../utils/product-table-collum';
import { PaginationMeta } from '../../../core/models/pagination/pagination.model';
import { initialValuesPagination } from '../../../design-system/pagination/utils/initial-values';

export interface ProductItem extends Record<string, unknown> {
  id: string;
  code: string;
  name: string;
  category: string;
  manufacturer: string;
  oemCode: string;
  price: string;
  stock: number;
  status: 'Ativo' | 'Inativo' | 'Baixo Estoque';
}

@Component({
  selector: 'app-products-page',
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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class ProductsPageComponent implements OnInit {
  private router = inject(Router);
  private toastService = inject(ToastService);
  private productService = inject(ProductService);

  readonly searchQuery = signal<string>('');
  readonly selectedStatus = signal<string>('');
  readonly selectedCategory = signal<string>('');
  readonly pageSize = signal<number>(10);
  readonly currentPage = signal<number>(1);
  readonly totalItems = signal<number>(0);

  readonly loading = signal<boolean>(false);
  readonly deleteDialogOpen = signal<boolean>(false);
  readonly selectedProductForDelete = signal<ProductResponse | null>(null);

  readonly allProducts = signal<ProductResponse[]>([]);

  readonly columns: TableColumn<ProductResponse>[] = productTableColumns;
  readonly actions: TableAction<ProductResponse>[] = productTableActions;
  readonly pagination = signal<PaginationMeta>(initialValuesPagination);

  readonly filteredProducts = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const cat = this.selectedCategory().toLowerCase();
    // const st = this.selectedStatus();

    return this.allProducts().filter((p) => {
      // const matchesQ = !q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) || p.oemCode.toLowerCase().includes(q);
      const matchesQ = !q || p.name.toLowerCase().includes(q);
      const matchesCat = !cat || p.category.name.toLowerCase().includes(cat);
      const matchesSt = 'active';
      return matchesQ && matchesCat && matchesSt;
    });
  });

  readonly paginatedProducts = computed(() => {
    const all = this.filteredProducts();
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return all.slice(start, start + size);
  });

  ngOnInit(): void {
    this.getPaginationAllProducts();
  }

  getPaginationAllProducts(): void {
    this.loading.set(true);
    this.productService.getAll().subscribe({
      next: (response) => {
        this.allProducts.set(response.data);
        if (response.meta) {
          this.totalItems.set(response.meta.total);
          this.currentPage.set(response.meta.current_page);
          this.pageSize.set(response.meta.per_page);
        } else {
          this.totalItems.set(response.data.length);
        }
        this.pagination.set(response.meta);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.toastService.error('Erro ao buscar produtos', error.message || 'Falha na requisição.');
      },
    });
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  onCategoryChange(category: string): void {
    this.selectedCategory.set(category);
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
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedCategory.set('');
    this.selectedStatus.set('');
    this.currentPage.set(1);
    this.toastService.info('Filtros limpos', 'Todos os parâmetros de busca foram resetados.');
  }

  exportProducts(): void {
    this.toastService.success(
      'Exportação Iniciada',
      'Gerando arquivo Excel com os produtos do catálogo...',
    );
  }

  newProduct(): void {
    this.router.navigate(['/catalog/products/new']);
  }

  editProduct(prod: ProductResponse): void {
    this.router.navigate(['/catalog/products', prod.id, 'edit']);
  }

  confirmDelete(prod: ProductResponse): void {
    this.selectedProductForDelete.set(prod);
    this.deleteDialogOpen.set(true);
  }

  executeDelete(): void {
    const prod = this.selectedProductForDelete();
    if (prod) {
      this.allProducts.update((list) => list.filter((p) => p.id !== prod.id));
      this.toastService.success('Produto Excluído', `${prod.name} foi removido com sucesso.`);
    }
    this.deleteDialogOpen.set(false);
  }

  handleProductAction(event: { actionId: string; row: ProductResponse }): void {
    console.log('[HANDLE PRODUCT ACTION]', event);
    switch (event.actionId) {
      case 'edit':
        this.editProduct(event.row);
        break;
      case 'delete':
        this.confirmDelete(event.row);
        break;
    }
  }
}
