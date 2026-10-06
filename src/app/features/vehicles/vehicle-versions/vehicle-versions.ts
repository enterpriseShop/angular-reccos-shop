import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehicleVersionFormComponent } from './vehicle-version-form/vehicle-version-form';
import { ConfirmDialogComponent } from '../../../design-system/dialog/confirm-dialog';
import { SearchInputComponent } from '../../../design-system/input/search-input';
import { PageHeaderComponent } from '../../../design-system/page-header/page-header';
import { PaginationComponent } from '../../../design-system/pagination/pagination';
import { DataTableComponent } from '../../../design-system/data-table/data-table';
import { ButtonComponent } from '../../../design-system/button/button';
import { SelectComponent } from '../../../design-system/select/select';
import { ToolbarComponent } from '../../../design-system/toolbar/toolbar';
import { AppIconComponent } from '../../../design-system/icon/app-icon';
import { VehicleVersionService } from '../../../core/services/vehicle-version';
import { VehicleModelService } from '../../../core/services/vehicle-model';
import { VehicleBrandService } from '../../../core/services/vehicle-brand';
import { ToastService } from '../../../core/services/toast';
import {
  VehicleVersionFilters,
  VehicleVersionResponse,
} from '../../../core/models/vehicles-version/vehicle-version.model';
import { VehicleModelOption } from '../../../core/models/vehicles-model/vehicle-model.model';
import { SelectOption } from '../../../core/models/design-system/select-option.model';
import { TableAction, TableColumn } from '../../../core/models/list-table/list-table.model';
import {
  vehicleVersionsTableActions,
  vehicleVersionsTableColumns,
} from '../../../utils/vehicle-versions-table-collums';
import { GeneralOptionQuery } from '../../../core/models/generals/general-option-query.model';
import { VehicleModelStore } from '../../../core/store/vehicles/vehicle-model/vehicle-model-store';

@Component({
  selector: 'app-vehicle-versions-page',
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
    VehicleVersionFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vehicle-versions.html',
  styleUrl: './vehicle-versions.css',
})
export class VehicleVersionsPageComponent implements OnInit {
  private toastService = inject(ToastService);
  private vehicleModelStore = inject(VehicleModelStore);
  private vehicleModelService = inject(VehicleModelService);
  private vehicleBrandService = inject(VehicleBrandService);
  private vehicleVersionService = inject(VehicleVersionService);

  // Data & State Signals
  readonly modelOptions = signal<VehicleModelOption[]>([]);
  readonly allVersions = signal<VehicleVersionResponse[]>([]);
  readonly loading = signal<boolean>(false);
  readonly searchQuery = signal<string>('');
  readonly selectedBrandId = signal<string>('');
  readonly selectedModelId = signal<string>('');
  readonly selectedStatus = signal<string>('');

  // Pagination Signals
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(10);
  readonly totalItems = signal<number>(0);

  // Form Drawer Signals
  readonly isFormOpen = signal<boolean>(false);
  readonly formMode = signal<'create' | 'edit' | 'view'>('create');
  readonly selectedVersion = signal<VehicleVersionResponse | null>(null);

  // Delete Dialog Signals
  readonly deleteDialogOpen = signal<boolean>(false);
  readonly selectedVersionForDelete = signal<VehicleVersionResponse | null>(null);
  readonly isDeleting = signal<boolean>(false);

  // Filter Dropdown Options
  readonly statusOptions: SelectOption[] = [];

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
      disabled: false,
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
      label: m.label + (m.brand_name ? ` (${m.brand_name})` : ''),
      sublabel: '',
      disabled: false,
      module: '',
    }));
    return [defaultOpt, ...mapped];
  });

  // Table Columns Definition
  readonly columns: TableColumn<VehicleVersionResponse>[] = vehicleVersionsTableColumns;
  readonly actions: TableAction<VehicleVersionResponse>[] = vehicleVersionsTableActions;

  // Quick KPI Signals
  readonly totalCount = computed(() => this.allVersions().length);
  readonly activeCount = computed(() => this.allVersions().filter((v) => v.active).length);
  readonly coveredModelsCount = computed(() => {
    const modelsSet = new Set(this.allVersions().map((v) => v.vehicle_model_id));
    return modelsSet.size;
  });
  readonly totalEnginesCount = computed(() =>
    this.allVersions().reduce((sum, v) => sum + (v.engines?.length ?? v.engines_count ?? 0), 0),
  );

  params: VehicleVersionFilters = {
    page: 1,
    per_page: 10,
    search: null,
    q: null,
    vehicle_brand_id: null,
    vehicle_model_id: null,
    active: false,
  };

  ngOnInit(): void {
    this.loadVersions(this.params);
    this.loadModelOptions(this.params);
  }

  loadModelOptions(params: Partial<GeneralOptionQuery>): void {
    this.vehicleModelService.getOptions(params).subscribe({
      next: (res) => {
        this.modelOptions.set(res.data || []);
      },
    });
  }

  loadVersions(params: VehicleVersionFilters): void {
    this.loading.set(true);
    this.vehicleVersionService.getAll(params).subscribe({
      next: (response) => {
        this.allVersions.set(response.data || []);
        if (response.meta) {
          this.totalItems.set(response.meta.total);
          this.currentPage.set(response.meta.current_page);
          this.pageSize.set(response.meta.per_page);
        } else {
          this.totalItems.set((response.data || []).length);
        }
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.toastService.error(
          'Erro ao buscar versões',
          error.message || 'Falha ao carregar lista de versões de veículos.',
        );
      },
    });
  }

  readonly filteredVersions = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const st = this.selectedStatus();
    const brId = this.selectedBrandId();
    const mdId = this.selectedModelId();

    return this.allVersions().filter((v) => {
      const versionName = (v.name || '').toLowerCase();
      const modelName = (v.model?.name || '').toLowerCase();
      const brandName = (v.model?.brand?.name || '').toLowerCase();

      const matchesQ =
        !q || versionName.includes(q) || modelName.includes(q) || brandName.includes(q);

      const matchesBrand = !brId || v.model?.vehicle_brand_id === brId;
      const matchesModel = !mdId || v.vehicle_model_id === mdId;
      const matchesStatus = !st || (st === 'active' ? v.active : !v.active);

      return matchesQ && matchesBrand && matchesModel && matchesStatus;
    });
  });

  readonly paginatedVersions = computed(() => {
    const all = this.filteredVersions();
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return all.slice(start, start + size);
  });

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  onBrandFilterChange(brandId: string): void {
    this.selectedBrandId.set(brandId);
    // If selected model is not of this brand, reset selected model
    const currentModel = this.modelOptions().find((m) => m.id === this.selectedModelId());
    if (currentModel && brandId && currentModel.vehicle_brand_id !== brandId) {
      this.selectedModelId.set('');
    }
    this.currentPage.set(1);
  }

  onModelFilterChange(modelId: string): void {
    this.selectedModelId.set(modelId);
    this.currentPage.set(1);
  }

  onStatusChange(status: string): void {
    this.selectedStatus.set(status);
    this.currentPage.set(1);
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedBrandId.set('');
    this.selectedModelId.set('');
    this.selectedStatus.set('');
    this.currentPage.set(1);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  newVersion(): void {
    this.selectedVersion.set(null);
    this.formMode.set('create');
    this.isFormOpen.set(true);
  }

  viewVersion(version: VehicleVersionResponse): void {
    this.selectedVersion.set(version);
    this.formMode.set('view');
    this.isFormOpen.set(true);
  }

  editVersion(version: VehicleVersionResponse): void {
    this.selectedVersion.set(version);
    this.formMode.set('edit');
    this.isFormOpen.set(true);
  }

  confirmDelete(version: VehicleVersionResponse): void {
    this.selectedVersionForDelete.set(version);
    this.deleteDialogOpen.set(true);
  }

  executeDelete(): void {
    const item = this.selectedVersionForDelete();
    if (!item) return;

    this.isDeleting.set(true);
    this.vehicleVersionService.delete(item.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.deleteDialogOpen.set(false);
        this.selectedVersionForDelete.set(null);
        this.toastService.success(
          'Versão Excluída',
          `A versão "${item.name}" foi removida do catálogo.`,
        );
        this.loadVersions(this.params);
      },
      error: (err) => {
        this.isDeleting.set(false);
        this.toastService.error(
          'Erro ao Excluir',
          err.error?.message || 'Não foi possível excluir a versão de veículo.',
        );
      },
    });
  }

  onVersionSaved(): void {
    this.loadVersions(this.params);
  }

  closeForm(): void {
    this.isFormOpen.set(false);
    this.selectedVersion.set(null);
  }
}
