import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { VehicleApplicationFormComponent } from './vehicle-application-form/vehicle-application-form';
import { ConfirmDialogComponent } from '../../../design-system/dialog/confirm-dialog';
import { SearchInputComponent } from '../../../design-system/input/search-input';
import { PageHeaderComponent } from '../../../design-system/page-header/page-header';
import { PaginationComponent } from '../../../design-system/pagination/pagination';
import { DataTableComponent } from '../../../design-system/data-table/data-table';
import { ToolbarComponent } from '../../../design-system/toolbar/toolbar';
import { AppIconComponent } from '../../../design-system/icon/app-icon';
import { ButtonComponent } from '../../../design-system/button/button';
import { SelectComponent } from '../../../design-system/select/select';
import { ToastService } from '../../../core/services/toast';
import { VehicleApplicationService } from '../../../core/services/vehicle-application';
import { VehicleBrandService } from '../../../core/services/vehicle-brand';
import { TableAction, TableColumn } from '../../../core/models/list-table/list-table.model';
import {
  vehicleApplicationTableActions,
  vehicleApplicationTableColumns,
} from '../../../utils/vehicle-application-table-collums';
import { SelectOption } from '../../../core/models/design-system/select-option.model';
import {
  VehicleApplicationFilters,
  VehicleApplicationResponse,
} from '../../../core/models/vehicle-application/vehicle-application.model';

@Component({
  selector: 'app-vehicle-applications-page',
  standalone: true,
  imports: [
    SelectComponent,
    ButtonComponent,
    AppIconComponent,
    ToolbarComponent,
    DataTableComponent,
    PaginationComponent,
    PageHeaderComponent,
    SearchInputComponent,
    ConfirmDialogComponent,
    VehicleApplicationFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vehicle-applications.html',
  styleUrl: './vehicle-applications.css',
})
export class VehicleApplicationsPageComponent implements OnInit {
  private toastService = inject(ToastService);
  private vehicleBrandService = inject(VehicleBrandService);
  private vehicleAppService = inject(VehicleApplicationService);

  readonly loading = signal<boolean>(false);
  readonly searchQuery = signal<string>('');
  readonly selectedBrand = signal<string>('');
  readonly selectedStatus = signal<string>('');
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(10);

  // Form Drawer State
  readonly isFormOpen = signal<boolean>(false);
  readonly formMode = signal<'create' | 'edit' | 'view'>('create');
  readonly selectedApplication = signal<VehicleApplicationResponse | null>(null);

  // Delete Dialog State
  readonly deleteDialogOpen = signal<boolean>(false);
  readonly selectedAppForDelete = signal<VehicleApplicationResponse | null>(null);
  readonly isDeleting = signal<boolean>(false);

  readonly allApplications = signal<VehicleApplicationResponse[]>([]);
  readonly brandFilterOptions = signal<SelectOption[]>([]);

  readonly columns: TableColumn<VehicleApplicationResponse>[] = vehicleApplicationTableColumns;
  readonly actions: TableAction<VehicleApplicationResponse>[] = vehicleApplicationTableActions;

  // Quick KPI Signals
  readonly totalCount = computed(() => this.allApplications().length);
  readonly activeCount = computed(() => this.allApplications().filter((a) => a.active).length);
  readonly distinctBrandsCount = computed(() => {
    const brands = new Set(
      this.allApplications()
        .map((a) => a.vehicle_brand_id)
        .filter(Boolean),
    );
    return brands.size;
  });
  readonly distinctModelsCount = computed(() => {
    const models = new Set(
      this.allApplications()
        .map((a) => a.vehicle_model_id)
        .filter(Boolean),
    );
    return models.size;
  });

  // Filtered & Paginated signals
  readonly filteredApplications = computed(() => {
    let result = this.allApplications();
    const query = this.searchQuery().trim().toLowerCase();
    const status = this.selectedStatus();
    const brand = this.selectedBrand();

    if (query) {
      result = result.filter((a) => {
        const brandName = a.brand?.name?.toLowerCase() || '';
        const modelName = a.model?.name?.toLowerCase() || '';
        const versionName = a.version?.name?.toLowerCase() || '';
        const engineName = a.engine?.name?.toLowerCase() || '';
        const notes = a.notes?.toLowerCase() || '';
        const yearFrom = String(a.year_from || '');
        const yearTo = String(a.year_to || '');

        return (
          brandName.includes(query) ||
          modelName.includes(query) ||
          versionName.includes(query) ||
          engineName.includes(query) ||
          notes.includes(query) ||
          yearFrom.includes(query) ||
          yearTo.includes(query)
        );
      });
    }

    if (status === 'active') {
      result = result.filter((a) => a.active);
    } else if (status === 'inactive') {
      result = result.filter((a) => !a.active);
    }

    if (brand) {
      result = result.filter((a) => a.vehicle_brand_id === brand);
    }

    return result;
  });

  readonly paginatedApplications = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredApplications().slice(start, start + this.pageSize());
  });

  params: Partial<VehicleApplicationFilters> = {
    page: 1,
    per_page: 10,
    search: null,
    vehicle_brand_id: null,
    vehicle_model_id: null,
    year: null,
    active: false,
  };

  ngOnInit(): void {
    this.loadApplications(this.params);
    this.loadBrandFilterOptions(this.params);
  }

  loadApplications(params: Partial<VehicleApplicationFilters>): void {
    this.loading.set(true);
    this.vehicleAppService.getAll(params).subscribe({
      next: (response) => {
        this.allApplications.set(response.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error(
          'Erro de Conexão',
          'Não foi possível carregar as aplicações veiculares.',
        );
      },
    });
  }

  loadBrandFilterOptions(params: Partial<VehicleApplicationFilters>): void {
    this.vehicleBrandService.getOptions(params as any).subscribe({
      next: (res) => {
        const options = (res.data || []).map((b) => ({
          label: b.label,
          value: b.value,
          module: '',
          sublabel: b.sublabel,
          disabled: false,
        }));
        this.brandFilterOptions.set(options);
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

  onBrandFilterChange(brandId: string): void {
    this.selectedBrand.set(brandId);
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
    this.selectedBrand.set('');
    this.currentPage.set(1);
  }

  newApplication(): void {
    this.selectedApplication.set(null);
    this.formMode.set('create');
    this.isFormOpen.set(true);
  }

  viewApplication(app: VehicleApplicationResponse): void {
    this.selectedApplication.set(app);
    this.formMode.set('view');
    this.isFormOpen.set(true);
  }

  editApplication(app: VehicleApplicationResponse): void {
    this.selectedApplication.set(app);
    this.formMode.set('edit');
    this.isFormOpen.set(true);
  }

  confirmDelete(app: VehicleApplicationResponse): void {
    this.selectedAppForDelete.set(app);
    this.deleteDialogOpen.set(true);
  }

  executeDelete(): void {
    const app = this.selectedAppForDelete();
    if (!app) return;

    this.isDeleting.set(true);
    this.vehicleAppService.delete(app.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.deleteDialogOpen.set(false);
        this.selectedAppForDelete.set(null);
        this.toastService.success(
          'Aplicação Removida',
          'A aplicação de veículo foi excluída do catálogo com sucesso.',
        );
        this.loadApplications(this.params);
      },
      error: (err) => {
        this.isDeleting.set(false);
        const msg = err.error?.message || 'Falha ao remover aplicação.';
        this.toastService.error('Erro na Exclusão', msg);
      },
    });
  }

  closeForm(): void {
    this.isFormOpen.set(false);
    this.selectedApplication.set(null);
  }

  onApplicationSaved(): void {
    this.loadApplications(this.params);
  }
}
