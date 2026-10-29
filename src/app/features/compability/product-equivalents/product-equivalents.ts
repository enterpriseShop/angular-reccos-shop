import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../../../design-system/page-header/page-header';
import { ToolbarComponent } from '../../../../design-system/toolbar/toolbar';
import { SearchInputComponent } from '../../../../design-system/input/search-input';
import { SelectComponent } from '../../../../design-system/select/select';
import { ButtonComponent } from '../../../../design-system/button/button';
import { DataTableComponent } from '../../../../design-system/data-table/data-table';
import { PaginationComponent } from '../../../../design-system/pagination/pagination';
import { ConfirmDialogComponent } from '../../../../design-system/dialog/confirm-dialog';
import { AppIconComponent } from '../../../../design-system/icon/app-icon';
import { ProductEquivalentFormComponent } from '../../components/product-equivalent-form/product-equivalent-form';
import { ToastService } from '../../../../core/services/toast';
import { ProductEquivalentService } from '../../../../core/services/product-equivalent';
import { ProductService } from '../../../../core/services/product';
import { ProductEquivalent } from '../../../../core/models/product-equivalent';
import { TableColumn, TableAction } from '../../../../core/models/table-config';

@Component({
  selector: 'app-product-equivalents-page',
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    ToolbarComponent,
    SearchInputComponent,
    SelectComponent,
    ButtonComponent,
    DataTableComponent,
    PaginationComponent,
    ConfirmDialogComponent,
    AppIconComponent,
    ProductEquivalentFormComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-equivalents.html',
  styleUrl: './product-equivalents.css'
})
export class ProductEquivalentsPageComponent implements OnInit {
  private toastService = inject(ToastService);
  private equivalentService = inject(ProductEquivalentService);
  private productService = inject(ProductService);

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
  readonly selectedEquivalent = signal<ProductEquivalent | null>(null);

  // Delete Dialog State
  readonly deleteDialogOpen = signal<boolean>(false);
  readonly selectedForDelete = signal<ProductEquivalent | null>(null);
  readonly isDeleting = signal<boolean>(false);

  readonly allEquivalents = signal<ProductEquivalent[]>([]);
  readonly productFilterOptions = signal<{ label: string; value: string }[]>([
    { label: 'Todos os Produtos', value: '' }
  ]);

  readonly columns: TableColumn<ProductEquivalent>[] = [
    {
      key: 'product',
      header: 'Produto de Origem (Principal)',
      width: '280px',
      valueGetter: (item: ProductEquivalent) => {
        if (!item.product) return '—';
        return `${item.product.name} [${item.product.internal_code || 'S/C'}]`;
      }
    },
    {
      key: 'relation_badge',
      header: 'Equivalência',
      width: '140px',
      align: 'center',
      type: 'badge',
      badgeConfig: () => ({
        text: 'Substituível por',
        variant: 'info'
      })
    },
    {
      key: 'equivalent_product',
      header: 'Produto Equivalente (Alternativa)',
      width: '280px',
      valueGetter: (item: ProductEquivalent) => {
        if (!item.equivalent_product) return '—';
        return `${item.equivalent_product.name} [${item.equivalent_product.internal_code || 'S/C'}]`;
      }
    },
    {
      key: 'observation',
      header: 'Observação Técnica',
      width: '240px',
      valueGetter: (item: ProductEquivalent) => item.observation || 'Sem observações registradas'
    },
    {
      key: 'created_at',
      header: 'Data de Cadastro',
      width: '130px',
      align: 'center',
      type: 'date'
    }
  ];

  readonly actions: TableAction<ProductEquivalent>[] = [
    {
      id: 'view',
      label: 'Visualizar',
      icon: 'eye',
      colorClass: 'text-slate-400 hover:text-[#5A8DEE] hover:bg-slate-100 dark:hover:bg-slate-700',
      title: 'Visualizar Detalhes',
      handler: (item) => this.viewEquivalent(item)
    },
    {
      id: 'edit',
      label: 'Editar Observação',
      icon: 'edit',
      colorClass: 'text-slate-400 hover:text-[#4F8A6B] hover:bg-slate-100 dark:hover:bg-slate-700',
      title: 'Editar Observação',
      handler: (item) => this.editEquivalent(item)
    },
    {
      id: 'delete',
      label: 'Excluir Relacionamento',
      icon: 'trash-2',
      colorClass: 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30',
      title: 'Excluir Relacionamento',
      handler: (item) => this.confirmDelete(item)
    }
  ];

  // Quick KPI Signals
  readonly totalEquivalentsCount = computed(() => this.allEquivalents().length);
  readonly uniqueOriginProductsCount = computed(() => {
    const ids = new Set(this.allEquivalents().map(e => e.product_id).filter(Boolean));
    return ids.size;
  });
  readonly uniqueTargetProductsCount = computed(() => {
    const ids = new Set(this.allEquivalents().map(e => e.equivalent_product_id).filter(Boolean));
    return ids.size;
  });

  ngOnInit(): void {
    this.loadFilterOptions();
    this.loadEquivalents();
  }

  loadFilterOptions(): void {
    this.productService.getOptions('', 60).subscribe({
      next: (res) => {
        if (res && res.data) {
          const opts = [
            { label: 'Todos os Produtos', value: '' },
            ...res.data.map((p) => ({
              label: `${p.name} (${p.internal_code || 'S/C'})`,
              value: p.id
            }))
          ];
          this.productFilterOptions.set(opts);
        }
      }
    });
  }

  loadEquivalents(): void {
    this.loading.set(true);
    this.equivalentService.getAll({
      search: this.searchQuery(),
      product_id: this.selectedOriginId(),
      equivalent_product_id: this.selectedTargetId()
    }).subscribe({
      next: (response) => {
        this.allEquivalents.set(response.data || []);
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
          'Erro ao buscar equivalências',
          error.message || 'Falha ao carregar lista de produtos equivalentes.'
        );
      }
    });
  }

  readonly filteredEquivalents = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const originId = this.selectedOriginId();
    const targetId = this.selectedTargetId();

    return this.allEquivalents().filter(item => {
      const origName = (item.product?.name || '').toLowerCase();
      const origCode = (item.product?.internal_code || '').toLowerCase();
      const equivName = (item.equivalent_product?.name || '').toLowerCase();
      const equivCode = (item.equivalent_product?.internal_code || '').toLowerCase();
      const obs = (item.observation || '').toLowerCase();

      const matchesQ = !q ||
        origName.includes(q) ||
        origCode.includes(q) ||
        equivName.includes(q) ||
        equivCode.includes(q) ||
        obs.includes(q);

      const matchesOrigin = !originId || item.product_id === originId;
      const matchesTarget = !targetId || item.equivalent_product_id === targetId;

      return matchesQ && matchesOrigin && matchesTarget;
    });
  });

  readonly paginatedEquivalents = computed(() => {
    const all = this.filteredEquivalents();
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return all.slice(start, start + size);
  });

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
    this.loadEquivalents();
  }

  onOriginFilterChange(productId: string): void {
    this.selectedOriginId.set(productId);
    this.currentPage.set(1);
    this.loadEquivalents();
  }

  onTargetFilterChange(productId: string): void {
    this.selectedTargetId.set(productId);
    this.currentPage.set(1);
    this.loadEquivalents();
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
    this.selectedOriginId.set('');
    this.selectedTargetId.set('');
    this.currentPage.set(1);
    this.loadEquivalents();
  }

  newEquivalent(): void {
    this.selectedEquivalent.set(null);
    this.formMode.set('create');
    this.isFormOpen.set(true);
  }

  viewEquivalent(item: ProductEquivalent): void {
    this.selectedEquivalent.set(item);
    this.formMode.set('view');
    this.isFormOpen.set(true);
  }

  editEquivalent(item: ProductEquivalent): void {
    this.selectedEquivalent.set(item);
    this.formMode.set('edit');
    this.isFormOpen.set(true);
  }

  closeForm(): void {
    this.isFormOpen.set(false);
    this.selectedEquivalent.set(null);
  }

  onEquivalentSaved(): void {
    this.loadEquivalents();
  }

  confirmDelete(item: ProductEquivalent): void {
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
          'O relacionamento entre os produtos foi removido com sucesso. Os produtos continuam disponíveis no catálogo.'
        );
        this.loadEquivalents();
      },
      error: (error) => {
        this.isDeleting.set(false);
        this.toastService.error(
          'Erro ao remover equivalência',
          error.message || 'Falha ao desvincular os produtos.'
        );
      }
    });
  }
}
