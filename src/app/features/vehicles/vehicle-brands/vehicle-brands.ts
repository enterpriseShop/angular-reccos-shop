import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { VehicleBrandFormComponent } from './vehicle-brand-form/vehicle-brand-form';
import { ConfirmDialogComponent } from '../../../design-system/dialog/confirm-dialog';
import { SearchInputComponent } from '../../../design-system/input/search-input';
import { PageHeaderComponent } from '../../../design-system/page-header/page-header';
import { PaginationComponent } from '../../../design-system/pagination/pagination';
import { DataTableComponent } from '../../../design-system/data-table/data-table';
import { AppIconComponent } from '../../../design-system/icon/app-icon';
import { ToolbarComponent } from '../../../design-system/toolbar/toolbar';
import { ButtonComponent } from '../../../design-system/button/button';
import { SelectComponent } from '../../../design-system/select/select';
import { ToastService } from '../../../core/services/toast';
import { VehicleBrandService } from '../../../core/services/vehicle-brand';
import { TableAction, TableColumn } from '../../../core/models/list-table/list-table.model';
import { VehicleBrandResponse } from '../../../core/models/vehicles-brands/vehicle-brand-response.model';
import { GeneralOptionQuery } from '../../../core/models/generals/general-option-query.model';
import {
  vehicleBrandsTableActions,
  vehicleBrandsTableColumns,
} from '../../../utils/vehicle-brands-table-collums';
import { PaginationMeta } from '../../../core/models/pagination/pagination.model';
import { initialValuesPagination } from '../../../design-system/pagination/utils/initial-values';

@Component({
  selector: 'app-vehicle-brands-page',
  standalone: true,
  imports: [
    SelectComponent,
    ButtonComponent,
    ToolbarComponent,
    AppIconComponent,
    DataTableComponent,
    PaginationComponent,
    PageHeaderComponent,
    SearchInputComponent,
    ConfirmDialogComponent,
    VehicleBrandFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vehicle-brands.html',
  styleUrl: './vehicle-brands.css',
})
export class VehicleBrandsPageComponent implements OnInit {
  private toastService = inject(ToastService);
  private vehicleBrandService = inject(VehicleBrandService);

  readonly loading = signal<boolean>(false);
  readonly searchQuery = signal<string>('');
  readonly selectedStatus = signal<string>('');

  readonly perPage = signal<number>(10);
  readonly pageSize = signal<number>(10);
  readonly currentPage = signal<number>(1);

  // Form Drawer State
  readonly isFormOpen = signal<boolean>(false);
  readonly formMode = signal<'create' | 'edit' | 'view'>('create');
  readonly selectedBrand = signal<VehicleBrandResponse | null>(null);

  // Delete Dialog State
  readonly deleteDialogOpen = signal<boolean>(false);
  readonly selectedBrandForDelete = signal<VehicleBrandResponse | null>(null);
  readonly isDeleting = signal<boolean>(false);

  params: Partial<GeneralOptionQuery> = {
    active: null,
    page: this.currentPage(),
    per_page: this.perPage(),
  };

  readonly allBrands = signal<VehicleBrandResponse[]>([]);
  readonly columns: TableColumn<VehicleBrandResponse>[] = vehicleBrandsTableColumns;
  readonly actions: TableAction<VehicleBrandResponse>[] = vehicleBrandsTableActions;

  // Quick KPI Signals
  readonly totalCount = computed(() => this.allBrands().length);
  readonly activeCount = computed(() => this.allBrands().filter((b) => b.active).length);
  readonly totalModelsCount = computed(() =>
    this.allBrands().reduce((sum, b) => sum + (Number(b.models_count) || 0), 0),
  );
  readonly withImageCount = computed(() => this.allBrands().filter((b) => !!b.image).length);
  readonly pagination = signal<PaginationMeta>(initialValuesPagination);

  ngOnInit(): void {
    this.loadBrands(this.params);
  }

  loadBrands(params: Partial<GeneralOptionQuery>): void {
    this.loading.set(true);
    this.vehicleBrandService.getAll(params).subscribe({
      next: (response) => {
        this.allBrands.set(response.data);
        this.pagination.set(response.meta);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  readonly filteredBrands = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const st = this.selectedStatus();

    return this.allBrands().filter((b) => {
      const matchesQ = !q || b.name.toLowerCase().includes(q) || b.slug.toLowerCase().includes(q);

      const matchesSt = !st || (st === 'active' ? b.active : !b.active);
      return matchesQ && matchesSt;
    });
  });

  readonly paginatedBrands = computed(() => {
    const all = this.filteredBrands();
    const page = this.currentPage();
    const size = this.pageSize();
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
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  onPaginationChange(meta: PaginationMeta): void {
    this.pagination.set(meta);
    this.params = {
      ...this.params,
      page: meta.current_page,
      per_page: meta.per_page,
    };
    this.loadBrands(this.params);
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedStatus.set('');
    this.currentPage.set(1);
    this.toastService.info('Filtros limpos', 'Todos os parâmetros de busca foram resetados.');
  }

  newBrand(): void {
    this.selectedBrand.set(null);
    this.formMode.set('create');
    this.isFormOpen.set(true);
  }

  editBrand(brand: VehicleBrandResponse): void {
    this.selectedBrand.set(brand);
    this.formMode.set('edit');
    this.isFormOpen.set(true);
  }

  viewBrand(brand: VehicleBrandResponse): void {
    this.selectedBrand.set(brand);
    this.formMode.set('view');
    this.isFormOpen.set(true);
  }

  closeForm(): void {
    this.isFormOpen.set(false);
    this.selectedBrand.set(null);
  }

  onBrandSaved(): void {
    this.loadBrands(this.params);
  }

  confirmDelete(brand: VehicleBrandResponse): void {
    this.selectedBrandForDelete.set(brand);
    this.deleteDialogOpen.set(true);
  }

  executeDelete(): void {
    const brand = this.selectedBrandForDelete();
    if (!brand) return;

    this.isDeleting.set(true);
    this.vehicleBrandService.delete(brand.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.deleteDialogOpen.set(false);
        this.allBrands.update((list) => list.filter((b) => b.id !== brand.id));
        this.toastService.success(
          'Montadora Excluída',
          `A marca de veículo "${brand.name}" foi removida com sucesso.`,
        );
      },
      error: (err) => {
        this.isDeleting.set(false);
        this.deleteDialogOpen.set(false);
        this.toastService.error(
          'Erro ao excluir',
          err.message || 'Falha ao remover marca de veículo.',
        );
      },
    });
  }

  onActionClick(event: { actionId: string; row: VehicleBrandResponse }): void {
    switch (event.actionId) {
      case 'view':
        this.viewBrand(event.row);
        break;
      case 'edit':
        this.editBrand(event.row);
        break;
      case 'delete':
        this.confirmDelete(event.row);
        break;
    }
  }
}
