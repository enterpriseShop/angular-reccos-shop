import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehicleEngineFormComponent } from './vehicle-engine-form/vehicle-engine-form';
import { ConfirmDialogComponent } from '../../../design-system/dialog/confirm-dialog';
import { SearchInputComponent } from '../../../design-system/input/search-input';
import { PaginationComponent } from '../../../design-system/pagination/pagination';
import { PageHeaderComponent } from '../../../design-system/page-header/page-header';
import { DataTableComponent } from '../../../design-system/data-table/data-table';
import { ToolbarComponent } from '../../../design-system/toolbar/toolbar';
import { ButtonComponent } from '../../../design-system/button/button';
import { AppIconComponent } from '../../../design-system/icon/app-icon';
import { SelectComponent } from '../../../design-system/select/select';
import { ToastService } from '../../../core/services/toast';
import { VehicleBrandService } from '../../../core/services/vehicle-brand';
import { VehicleModelService } from '../../../core/services/vehicle-model';
import { VehicleEngineService } from '../../../core/services/vehicle-engine';
import { SelectOption } from '../../../core/models/design-system/select-option.model';
import { TableAction, TableColumn } from '../../../core/models/list-table/list-table.model';
import {
  vehicleEngineTableActions,
  vehicleEngineTableColumns,
} from '../../../utils/vehicle-engine-table-collums';
import { GeneralOptionQuery } from '../../../core/models/generals/general-option-query.model';
import {
  VehicleEngineFilters,
  VehicleEngineResponse,
} from '../../../core/models/vehicles-engine/vehicle-engine.model';
import { VehicleModelOption } from '../../../core/models/vehicles-model/vehicle-model.model';
import { VehicleVersionOption } from '../../../core/models/vehicles-version/vehicle-version.model';
import { VehicleModelStore } from '../../../core/store/vehicles/vehicle-model/vehicle-model-store';

@Component({
  selector: 'app-vehicle-engines-page',
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
    VehicleEngineFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vehicle-engines.html',
  styleUrl: './vehicle-engines.css',
})
export class VehicleEnginesPageComponent implements OnInit {
  private toastService = inject(ToastService);
  private vehicleModelService = inject(VehicleModelService);
  private vehicleBrandService = inject(VehicleBrandService);
  private vehicleEngineService = inject(VehicleEngineService);
  private vehicleModelStore = inject(VehicleModelStore);

  // State Signals
  readonly Math = Math;
  readonly allEngines = signal<VehicleEngineResponse[]>([]);
  readonly modelOptions = signal<VehicleModelOption[]>([]);
  readonly versionOptions = signal<VehicleVersionOption[]>([]);

  readonly searchQuery = signal<string>('');
  readonly selectedBrandId = signal<string>('');
  readonly selectedModelId = signal<string>('');
  readonly selectedFuel = signal<string>('');
  readonly selectedStatus = signal<string>('');

  // Pagination Signals
  readonly pageSize = signal<number>(10);
  readonly totalItems = signal<number>(0);
  readonly currentPage = signal<number>(1);

  // Form Drawer Signals
  readonly loading = signal<boolean>(false);
  readonly isFormOpen = signal<boolean>(false);
  readonly formMode = signal<'create' | 'edit' | 'view'>('create');
  readonly selectedEngine = signal<VehicleEngineResponse | null>(null);

  // Delete Dialog Signals
  readonly deleteDialogOpen = signal<boolean>(false);
  readonly selectedEngineForDelete = signal<VehicleEngineResponse | null>(null);
  readonly isDeleting = signal<boolean>(false);

  // Filter Dropdown Options
  readonly statusOptions: SelectOption[] = [];

  readonly fuelFilterOptions: SelectOption[] = [];

  readonly brandOptions = computed(() => {
    const options = this.vehicleModelStore.optionList();
    return options;
  });

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

  readonly modelSelectOptions = computed<SelectOption[]>(() => {
    const defaultOpt: SelectOption = {
      value: '',
      label: '',
      sublabel: '',
      disabled: true,
      module: '',
    };
    const brandId = this.selectedBrandId();
    let list = this.modelOptions();
    if (brandId) {
      list = list.filter((m) => m.vehicle_brand_id === brandId);
    }
    const mapped = list.map((m) => ({
      value: m.id,
      label: m.label,
      sublabel: m.label,
      disabled: false,
      module: '',
    }));
    return [defaultOpt, ...mapped];
  });

  // Table Columns Definition
  readonly columns: TableColumn<VehicleEngineResponse>[] = vehicleEngineTableColumns;
  readonly actions: TableAction<VehicleEngineResponse>[] = vehicleEngineTableActions;

  // Quick KPI Signals
  readonly totalCount = computed(() => this.allEngines().length);
  readonly activeCount = computed(() => this.allEngines().filter((e) => e.active).length);
  readonly coveredVersionsCount = computed(() => {
    const versionsSet = new Set(this.allEngines().map((e) => e.vehicle_version_id));
    return versionsSet.size;
  });
  readonly totalApplicationsCount = computed(() => {
    return this.allEngines().reduce((acc, curr) => acc + (curr.applications_count || 0), 0);
  });

  // Filtered & Paginated Display Data
  readonly filteredEngines = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const brandId = this.selectedBrandId();

    return this.allEngines().filter((engine) => {
      // Search text filter
      if (query) {
        const textMatches =
          engine.name.toLowerCase().includes(query) ||
          (engine.displacement && engine.displacement.toLowerCase().includes(query)) ||
          (engine.fuel && engine.fuel.toLowerCase().includes(query));

        if (!textMatches) return false;
      }

      // Brand filter
      if (brandId) {
        const brand = engine.name;
        if (!brand || brand !== brandId) return false;
      }

      // Model filter
      // if (modelId) {
      //   const version = engine.name;
      //   if (!version || ('vehicle_model_id' in version && version.vehicle_model_id !== modelId)) {
      //     return false;
      //   }
      // }

      // // Fuel filter
      // if (fuelVal) {
      //   if (!engine.fuel || !engine.fuel.toLowerCase().includes(fuelVal)) return false;
      // }

      // // Status filter
      // if (status === 'active' && !engine.active) return false;
      // if (status === 'inactive' && engine.active) return false;

      return true;
    });
  });

  readonly paginatedEngines = computed(() => {
    const list = this.filteredEngines();
    this.totalItems.set(list.length);
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return list.slice(start, start + size);
  });

  private params: Partial<GeneralOptionQuery> = {
    search: null,
    active: null,
    per_page: null,
    page: null,
    manufacturer_id: null,
  };

  ngOnInit(): void {
    this.loadEngines();
    this.loadModelOptions();
    this.loadVersionOptions();
  }

  loadEngines(): void {
    this.loading.set(true);
    const filters: Partial<VehicleEngineFilters> = {
      page: 1,
      per_page: 200,
    };

    this.vehicleEngineService.getAll(filters).subscribe({
      next: (response) => {
        this.allEngines.set(response.data);
        this.totalItems.set(response.meta.total);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.toastService.error(err?.error?.message || 'Falha ao carregar lista de motores.');
      },
    });
  }

  private loadModelOptions(): void {
    this.vehicleModelService.getOptions(this.params).subscribe({
      next: (res) => this.modelOptions.set(res.data || []),
    });
  }

  private loadVersionOptions(): void {
    // this.vehicleVersionService.getOptions(this.params).subscribe({
    //   next: (res) => this.versionOptions.set(res.data || []),
    // });
  }

  // Filter actions
  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  onBrandFilterChange(brandId: string): void {
    this.selectedBrandId.set(brandId);
    if (brandId && this.selectedModelId()) {
      const model = this.modelOptions().find((m) => m.id === this.selectedModelId());
      if (model && model.vehicle_brand_id !== brandId) {
        this.selectedModelId.set('');
      }
    }
    this.currentPage.set(1);
  }

  onModelFilterChange(modelId: string): void {
    this.selectedModelId.set(modelId);
    this.currentPage.set(1);
  }

  onFuelFilterChange(fuel: string): void {
    this.selectedFuel.set(fuel);
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

  // CRUD actions
  newEngine(): void {
    this.selectedEngine.set(null);
    this.formMode.set('create');
    this.isFormOpen.set(true);
  }

  editEngine(engine: VehicleEngineResponse): void {
    this.selectedEngine.set(engine);
    this.formMode.set('edit');
    this.isFormOpen.set(true);
  }

  viewEngine(engine: VehicleEngineResponse): void {
    this.selectedEngine.set(engine);
    this.formMode.set('view');
    this.isFormOpen.set(true);
  }

  closeForm(): void {
    this.isFormOpen.set(false);
    this.selectedEngine.set(null);
  }

  onEngineSaved(savedEngine: VehicleEngineResponse): void {
    const list = [...this.allEngines()];
    const index = list.findIndex((e) => e.id === savedEngine.id);
    if (index >= 0) {
      list[index] = savedEngine;
    } else {
      list.unshift(savedEngine);
    }
    this.allEngines.set(list);
    this.loadEngines();
  }

  confirmDelete(engine: VehicleEngineResponse): void {
    this.selectedEngineForDelete.set(engine);
    this.deleteDialogOpen.set(true);
  }

  closeDeleteDialog(): void {
    this.deleteDialogOpen.set(false);
    this.selectedEngineForDelete.set(null);
  }

  executeDelete(): void {
    const engine = this.selectedEngineForDelete();
    if (!engine) return;

    this.isDeleting.set(true);
    this.vehicleEngineService.delete(engine.id).subscribe({
      next: (res) => {
        this.isDeleting.set(false);
        this.deleteDialogOpen.set(false);
        this.toastService.success(res.message || 'Motor de veículo excluído com sucesso.');
        this.allEngines.update((list) => list.filter((e) => e.id !== engine.id));
        this.selectedEngineForDelete.set(null);
      },
      error: (err) => {
        this.isDeleting.set(false);
        this.toastService.error(err?.error?.message || 'Erro ao excluir motor de veículo.');
      },
    });
  }
}
