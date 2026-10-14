import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  input,
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
import { VehicleVersionStore } from '../../../core/store/vehicles/vehicle-version/vehicle-version-store';
import { GeneralStatusParams } from '../../../utils/general-simplify-status';
import { VehicleEngineStore } from '../../../core/store/vehicles/vehicle-engine/vehicle-engine-store';

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
  private vehicleEngineStore = inject(VehicleEngineStore);
  private vehicleVersionStore = inject(VehicleVersionStore);
  private vehicleEngineService = inject(VehicleEngineService);

  readonly mode = input<'create' | 'edit' | 'view'>('create');
  // State Signals
  readonly Math = Math;
  readonly allEngines = signal<VehicleEngineResponse[]>([]);

  readonly searchQuery = signal<string>('');
  readonly selectedVersionId = signal<string>('');
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
  readonly statusOptions = signal<SelectOption[]>(GeneralStatusParams);

  readonly fuelFilterOptions: SelectOption[] = [
    { value: '', label: 'Todos os Combustíveis', sublabel: '', disabled: false, module: '' },
    { value: 'Flex', label: 'Flex', sublabel: '', disabled: false, module: '' },
    { value: 'Gasolina', label: 'Gasolina', sublabel: '', disabled: false, module: '' },
    { value: 'Diesel', label: 'Diesel', sublabel: '', disabled: false, module: '' },
    { value: 'Etanol', label: 'Etanol', sublabel: '', disabled: false, module: '' },
    { value: 'Híbrido', label: 'Híbrido', sublabel: '', disabled: false, module: '' },
    { value: 'Elétrico', label: 'Elétrico', sublabel: '', disabled: false, module: '' },
  ];

  readonly versionSelectOptions = computed<SelectOption[]>(() => {
    return this.vehicleVersionStore.optionList();
  });

  // Table Columns Definition
  readonly columns: TableColumn<VehicleEngineResponse>[] = vehicleEngineTableColumns;
  readonly actions: TableAction<VehicleEngineResponse>[] = vehicleEngineTableActions;

  // Quick KPI Signals
  readonly totalCount = computed(() => this.allEngines().length);
  readonly activeCount = computed(() => this.allEngines().filter((e) => e.active).length);
  readonly coveredVersionsCount = computed(() => {
    const versionIds = new Set<string>();
    for (const e of this.allEngines()) {
      if (e.versions) {
        for (const v of e.versions) {
          versionIds.add(v.id);
        }
      } else if (e.vehicle_version_id) {
        versionIds.add(e.vehicle_version_id);
      }
    }
    return versionIds.size;
  });
  readonly totalApplicationsCount = computed(() => {
    return this.allEngines().reduce((acc, curr) => acc + (curr.applications_count || 0), 0);
  });

  // Filtered & Paginated Display Data
  readonly filteredEngines = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const versionId = this.selectedVersionId();
    const fuelVal = this.selectedFuel().toLowerCase().trim();
    const status = this.selectedStatus();

    return this.allEngines().filter((engine) => {
      // Search text filter
      if (query) {
        const textMatches =
          engine.name?.toLowerCase().includes(query) ||
          (engine.displacement && engine.displacement.toLowerCase().includes(query)) ||
          (engine.fuel && engine.fuel.toLowerCase().includes(query));

        if (!textMatches) return false;
      }

      // Version filter
      if (versionId) {
        const hasVersion =
          (engine.versions && engine.versions.some((v) => v.id === versionId)) ||
          engine.vehicle_version_id === versionId;
        if (!hasVersion) return false;
      }

      // Fuel filter
      if (fuelVal) {
        if (!engine.fuel || !engine.fuel.toLowerCase().includes(fuelVal)) return false;
      }

      // Status filter
      if (status === '1' && !engine.active) return false;
      if (status === '0' && engine.active) return false;

      return true;
    });
  });

  readonly paginatedEngines = computed(() => {
    const list = this.filteredEngines();
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
  }

  loadEngines(): void {
    this.loading.set(true);
    const filters: Partial<VehicleEngineFilters> = {
      page: this.currentPage(),
      per_page: this.pageSize(),
      search: this.searchQuery() || undefined,
      vehicle_version_id: this.selectedVersionId() || undefined,
      active: this.selectedStatus() !== '' ? this.selectedStatus() : undefined,
    };

    this.vehicleEngineService.getAll(filters).subscribe({
      next: (response) => {
        this.allEngines.set(response.data);
        this.totalItems.set(response.meta?.total || response.data?.length || 0);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  // Filter actions
  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  onVersionFilterChange(versionId: string): void {
    this.selectedVersionId.set(versionId);
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
    this.updateVehicleStore(savedEngine);
    this.loadEngines();
  }

  private updateVehicleStore(response: VehicleEngineResponse): void {
    console.log('[updateVehicleStore] ->', response);
    const option: SelectOption = {
      label: response.name,
      value: response.id,
      sublabel: response.displacement || ' - ',
      module: '',
      disabled: false,
    };

    if (this.mode() === 'edit') {
      this.vehicleEngineStore.updateOption(option);
    } else {
      this.vehicleEngineStore.addOption(option);
    }
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

  onActionClick(event: { actionId: string; row: VehicleEngineResponse }): void {
    switch (event.actionId) {
      case 'view':
        this.viewEngine(event.row);
        break;
      case 'edit':
        this.editEngine(event.row);
        break;
      case 'delete':
        this.confirmDelete(event.row);
        break;
    }
  }
}
