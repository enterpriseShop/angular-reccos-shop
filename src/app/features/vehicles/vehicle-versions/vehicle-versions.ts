import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
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
import { ToastService } from '../../../core/services/toast';
import {
  VehicleVersionFilters,
  VehicleVersionResponse,
} from '../../../core/models/vehicles-version/vehicle-version.model';
import { SelectOption } from '../../../core/models/design-system/select-option.model';
import { TableAction, TableColumn } from '../../../core/models/list-table/list-table.model';
import {
  vehicleVersionsTableActions,
  vehicleVersionsTableColumns,
} from '../../../utils/vehicle-versions-table-collums';
import { VehicleModelStore } from '../../../core/store/vehicles/vehicle-model/vehicle-model-store';
import { VehicleBrandStore } from '../../../core/store/vehicles/vehicles-brand/vehicle-brand-store';
import { GeneralStatusParams } from '../../../utils/general-simplify-status';
import { PaginationMeta } from '../../../core/models/pagination/pagination.model';
import { initialValuesPagination } from '../../../design-system/pagination/utils/initial-values';

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
  private vehicleBrandStore = inject(VehicleBrandStore);
  private vehicleModelService = inject(VehicleModelService);
  private vehicleVersionService = inject(VehicleVersionService);

  // Data & State Signals
  readonly loading = signal<boolean>(false);
  readonly searchQuery = signal<string>('');
  readonly selectedStatus = signal<string>('');
  readonly selectedBrandId = signal<string>('');
  readonly selectedModelId = signal<string>('');
  readonly allVersions = signal<VehicleVersionResponse[]>([]);

  // Pagination Signals
  readonly perPage = signal<number>(10);
  readonly totalItems = signal<number>(0);
  readonly currentPage = signal<number>(1);
  readonly currentStatus = signal<number | null>(1);

  // Form Drawer Signals
  readonly isFormOpen = signal<boolean>(false);
  readonly formMode = signal<'create' | 'edit' | 'view'>('create');
  readonly selectedVersion = signal<VehicleVersionResponse | null>(null);

  // Delete Dialog Signals
  readonly isDeleting = signal<boolean>(false);
  readonly deleteDialogOpen = signal<boolean>(false);
  readonly selectedVersionForDelete = signal<VehicleVersionResponse | null>(null);

  // Filter Dropdown Options
  readonly statusOptions = signal<SelectOption[]>(GeneralStatusParams);

  readonly brandSelectOptions = computed<SelectOption[]>(() => {
    return this.vehicleBrandStore.optionList();
  });

  readonly modelSelectOptions = computed<SelectOption[]>(() => {
    return this.vehicleModelStore.optionList();
  });

  // Table Columns Definition
  readonly columns: TableColumn<VehicleVersionResponse>[] = vehicleVersionsTableColumns;
  readonly actions: TableAction<VehicleVersionResponse>[] = vehicleVersionsTableActions;

  // Pagination
  readonly pagination = signal<PaginationMeta>(initialValuesPagination);

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
    search: null,
    vehicle_brand_id: null,
    vehicle_model_id: null,
    page: this.currentPage(),
    per_page: this.perPage(),
    active: this.currentStatus(),
  };

  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((query) => {
        this.currentPage.set(1);
        this.searchQuery.set(query);
        this.params = { ...this.params, search: query || null, page: 1 };
        this.loadVersions(this.params);
      });
  }

  ngOnInit(): void {
    this.loadVersions(this.params);
  }

  loadVersions(params: VehicleVersionFilters): void {
    this.loading.set(true);
    this.vehicleVersionService.getAll(params).subscribe({
      next: (response) => {
        this.allVersions.set([]);
        this.allVersions.set(response.data || []);
        this.pagination.set(response.meta);
      },
      error: (error) => {
        this.toastService.error(
          'Erro ao buscar versões',
          error.message || 'Falha ao carregar lista de versões de veículos.',
        );
      },
      complete: () => {
        this.loading.set(false);
      },
    });
  }

  onSearchChange(query: string): void {
    this.searchSubject.next(query);
  }

  onBrandFilterChange(brandId: string): void {
    this.selectedBrandId.set(brandId);
    this.selectedModelId.set('');
    this.currentPage.set(1);
    this.params = {
      ...this.params,
      vehicle_brand_id: brandId || null,
      vehicle_model_id: null,
      page: 1,
    };
    this.loadVersions(this.params);
  }

  onModelFilterChange(modelId: string): void {
    this.selectedModelId.set(modelId);
    this.currentPage.set(1);
    this.params = {
      ...this.params,
      vehicle_model_id: modelId || null,
      page: 1,
    };
    this.loadVersions(this.params);
  }

  onStatusChange(status: string): void {
    this.selectedStatus.set(status);
    this.currentPage.set(1);
    const activeValue = status === 'active' ? 1 : status === 'inactive' ? 0 : null;
    this.currentStatus.set(activeValue);
    this.params = {
      ...this.params,
      active: activeValue,
      page: this.currentPage(),
    };
    this.loadVersions(this.params);
  }

  resetFilters(): void {
    this.currentPage.set(1);
    this.currentStatus.set(1);

    this.searchQuery.set('');
    this.selectedStatus.set('');
    this.selectedBrandId.set('');
    this.selectedModelId.set('');

    this.params = {
      search: null,
      vehicle_brand_id: null,
      vehicle_model_id: null,
      page: this.currentPage(),
      per_page: this.perPage(),
      active: this.currentStatus(),
    };
    this.loadVersions(this.params);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.params = {
      ...this.params,
      page,
    };
    this.loadVersions(this.params);
  }

  onPageSizeChange(size: number): void {
    this.perPage.set(size);
    this.currentPage.set(1);
    this.params = {
      ...this.params,
      per_page: size,
      page: 1,
    };
    this.loadVersions(this.params);
  }

  onActionClick(event: { actionId: string; row: VehicleVersionResponse }): void {
    switch (event.actionId) {
      case 'view':
        this.viewVersion(event.row);
        break;
      case 'edit':
        this.editVersion(event.row);
        break;
      case 'delete':
        this.confirmDelete(event.row);
        break;
    }
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

  closeForm(): void {
    this.isFormOpen.set(false);
    this.selectedVersion.set(null);
  }

  onPaginationChange(meta: PaginationMeta): void {
    this.pagination.set(meta);
    this.params = {
      ...this.params,
      page: meta.current_page,
      per_page: meta.per_page,
    };
    this.loadVersions(this.params);
  }
}
