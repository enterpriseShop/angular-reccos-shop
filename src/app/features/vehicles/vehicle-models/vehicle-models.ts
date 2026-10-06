import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
} from '@angular/core';
import { VehicleModelFormComponent } from './vehicle-model-form/vehicle-model-form';
import { ConfirmDialogComponent } from '../../../design-system/dialog/confirm-dialog';
import { SearchInputComponent } from '../../../design-system/input/search-input';
import { PageHeaderComponent } from '../../../design-system/page-header/page-header';
import { PaginationComponent } from '../../../design-system/pagination/pagination';
import { DataTableComponent } from '../../../design-system/data-table/data-table';
import { ToolbarComponent } from '../../../design-system/toolbar/toolbar';
import { AppIconComponent } from '../../../design-system/icon/app-icon';
import { ButtonComponent } from '../../../design-system/button/button';
import { SelectComponent } from '../../../design-system/select/select';
import { CommonModule } from '@angular/common';
import { VehicleModelService } from '../../../core/services/vehicle-model';
import { ToastService } from '../../../core/services/toast';
import { VehicleModelResponse } from '../../../core/models/vehicles-model/vehicle-model.model';
import { SelectOption } from '../../../core/models/design-system/select-option.model';
import { TableAction, TableColumn } from '../../../core/models/list-table/list-table.model';
import {
  vehicleModelTableActions,
  vehicleModelTableColumns,
} from '../../../utils/vehicle-models-table-collums';
import { GeneralOptionQuery } from '../../../core/models/generals/general-option-query.model';
import { PaginationMeta } from '../../../core/models/pagination/pagination.model';
import { initialValuesPagination } from '../../../design-system/pagination/utils/initial-values';
import { VehicleModelStore } from '../../../core/store/vehicles/vehicle-model/vehicle-model-store';

@Component({
  selector: 'app-vehicle-models-page',
  standalone: true,
  imports: [
    CommonModule,
    SelectComponent,
    ButtonComponent,
    AppIconComponent,
    ToolbarComponent,
    DataTableComponent,
    PaginationComponent,
    PageHeaderComponent,
    SearchInputComponent,
    ConfirmDialogComponent,
    VehicleModelFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vehicle-models.html',
  styleUrl: './vehicle-models.css',
})
export class VehicleModelsPageComponent implements OnInit {
  private toastService = inject(ToastService);
  private vehicleModelService = inject(VehicleModelService);
  private vehicleModelStore = inject(VehicleModelStore);

  // Data & State Signals
  readonly allModels = signal<VehicleModelResponse[]>([]);
  // readonly brandOptions = signal<VehicleBrandOption[]>([]);
  readonly loading = signal<boolean>(false);
  readonly searchQuery = signal<string>('');
  readonly selectedBrandId = signal<string>('');
  readonly selectedStatus = signal<string>('');

  brandOptions = computed(() => {
    const options = this.vehicleModelStore.optionList();
    return options;
  });

  // Pagination Signals
  readonly perPage = signal<number>(10);
  readonly currentPage = signal<number>(1);
  readonly totalItems = signal<number>(0);

  // Form Drawer Signals
  readonly isFormOpen = signal<boolean>(false);
  readonly formMode = signal<'create' | 'edit' | 'view'>('create');
  readonly selectedModel = signal<VehicleModelResponse | null>(null);

  // Delete Dialog Signals
  readonly deleteDialogOpen = signal<boolean>(false);
  readonly selectedModelForDelete = signal<VehicleModelResponse | null>(null);
  readonly isDeleting = signal<boolean>(false);

  // Filter Dropdown Options
  readonly statusOptions: SelectOption[] = [];

  readonly brandSelectOptions = computed<SelectOption[]>(() => {
    const defaultOpt: SelectOption = {
      value: '',
      label: '',
      sublabel: '',
      disabled: true,
      module: '',
    };
    const mapped = this.brandOptions().map((b) => ({
      value: b.value,
      label: b.label,
      sublabel: b.sublabel,
      disabled: b.disabled,
      module: '',
    }));
    return [defaultOpt, ...mapped];
  });

  // Table Columns Definition
  readonly columns: TableColumn<VehicleModelResponse>[] = vehicleModelTableColumns;
  readonly actions: TableAction<VehicleModelResponse>[] = vehicleModelTableActions;

  // Quick KPI Signals
  readonly totalCount = computed(() => this.allModels().length);
  readonly activeCount = computed(() => this.allModels().filter((m) => m.active).length);
  readonly coveredBrandsCount = computed(() => {
    const brandsSet = new Set(this.allModels().map((m) => m.brand?.id));
    return brandsSet.size;
  });
  readonly totalVersionsCount = computed(() =>
    this.allModels().reduce((sum, m) => sum + (m.versions?.length || 0), 0),
  );

  readonly pagination = signal<PaginationMeta>(initialValuesPagination);

  params: Partial<GeneralOptionQuery> = {
    active: null,
    search: null,
    page: this.currentPage(),
    per_page: this.perPage(),
    vehicle_brand_id: null,
  };

  ngOnInit(): void {
    this.loadModels(this.params);
  }

  loadModels(params: Partial<GeneralOptionQuery>): void {
    this.loading.set(true);
    this.vehicleModelService.getAll(params).subscribe({
      next: (response) => {
        this.allModels.set(response.data);
        this.pagination.set(response.meta);
      },
      complete: () => {
        this.loading.set(false);
      },
    });
  }

  readonly filteredModels = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const st = this.selectedStatus();
    const brId = this.selectedBrandId();

    return this.allModels().filter((m) => {
      const brandName = (m.brand?.name || '').toLowerCase();
      const matchesQ =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.slug.toLowerCase().includes(q) ||
        brandName.includes(q);

      const matchesBrand = !brId || m.brand?.id === brId;
      const matchesStatus = !st || (st === 'active' ? m.active : !m.active);

      return matchesQ && matchesBrand && matchesStatus;
    });
  });

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  onBrandFilterChange(brandId: string): void {
    this.selectedBrandId.set(brandId);
    this.currentPage.set(1);
  }

  onStatusChange(status: string): void {
    this.selectedStatus.set(status);
    this.currentPage.set(1);
  }

  onPaginationChange(meta: PaginationMeta): void {
    this.pagination.set(meta);
    this.params = {
      ...this.params,
      page: meta.current_page,
      per_page: meta.per_page,
    };
    this.loadModels(this.params);
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedBrandId.set('');
    this.selectedStatus.set('');
    this.currentPage.set(1);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onPageSizeChange(size: number): void {
    this.perPage.set(size);
    this.currentPage.set(1);
  }

  newModel(): void {
    this.selectedModel.set(null);
    this.formMode.set('create');
    this.isFormOpen.set(true);
  }

  viewModel(model: VehicleModelResponse): void {
    this.selectedModel.set(model);
    this.formMode.set('view');
    this.isFormOpen.set(true);
  }

  editModel(model: VehicleModelResponse): void {
    this.selectedModel.set(model);
    this.formMode.set('edit');
    this.isFormOpen.set(true);
  }

  confirmDelete(model: VehicleModelResponse): void {
    this.selectedModelForDelete.set(model);
    this.deleteDialogOpen.set(true);
  }

  executeDelete(): void {
    const item = this.selectedModelForDelete();
    if (!item) return;

    this.isDeleting.set(true);
    this.vehicleModelService.delete(item.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.deleteDialogOpen.set(false);
        this.selectedModelForDelete.set(null);
        this.toastService.success(
          'Modelo Excluído',
          `O modelo "${item.name}" foi removido do catálogo.`,
        );
        this.loadModels(this.params);
      },
      error: (err) => {
        this.isDeleting.set(false);
        this.toastService.error(
          'Erro ao Excluir',
          err.error?.message || 'Não foi possível excluir o modelo de veículo.',
        );
      },
    });
  }

  onModelSaved(): void {
    this.loadModels(this.params);
  }

  closeForm(): void {
    this.isFormOpen.set(false);
    this.selectedModel.set(null);
  }
}
