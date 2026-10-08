import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  DestroyRef,
} from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import { VehicleBrandService } from '../../../core/services/vehicle-brand';
import { VehicleModelFiltersResponse } from '../../../core/models/vehicles-model/vehicle-model-filters.models';
import { VehicleBrandFiltersRequest } from '../../../core/models/vehicles-brands/vehicle-brand-filters.model';
import { GeneralStatusParams } from '../../../utils/general-simplify-status';

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
  private vehicleModelStore = inject(VehicleModelStore);
  private vehicleBrandService = inject(VehicleBrandService);
  private vehicleModelService = inject(VehicleModelService);
  private destroyRef = inject(DestroyRef);

  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((query) => {
        this.executeSearch(query);
      });
  }

  // Data & State Signals
  readonly allModels = signal<VehicleModelResponse[]>([]);
  // readonly brandOptions = signal<VehicleBrandOption[]>([]);
  readonly loading = signal<boolean>(false);

  readonly searchQuery = signal<string>('');
  readonly selectedStatus = signal<string>('');
  readonly selectedBrandId = signal<string>('');
  readonly selectedVersion = signal<string>('');
  readonly brandSelectOptions = signal<SelectOption[]>([]);
  readonly versionSelectOptions = signal<SelectOption[]>([]);

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
  readonly statusOptions: SelectOption[] = GeneralStatusParams;

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

  brandParams: VehicleBrandFiltersRequest = {
    active: 1,
    search: null,
  };

  params: Partial<VehicleModelFiltersResponse> = {
    brand: null,
    search: null,
    active: null,
    version: null,
    vehicle_brand_id: null,
    page: this.currentPage(),
    per_page: this.perPage(),
  };

  ngOnInit(): void {
    this.loadModels(this.params);
    this.loadBrands(this.brandParams);
  }

  private extractErrorMessage(err: any, fallbackMessage: string): string {
    if (err?.error?.errors && typeof err.error.errors === 'object') {
      const messages = Object.values(err.error.errors).flat();
      if (messages.length > 0) {
        return messages.join(' ');
      }
    }
    return err?.error?.message || err?.message || fallbackMessage;
  }

  onActionClick(event: { actionId: string; row: VehicleModelResponse }): void {
    console.log('[ON ACTION CLICK 1]', event);
    switch (event.actionId) {
      case 'view':
        this.viewModel(event.row);
        break;
      case 'edit':
        this.editModel(event.row);
        break;
      case 'delete':
        this.confirmDelete(event.row);
        break;
    }
  }

  viewVehicleModel(model: VehicleModelResponse): void {
    this.viewModel(model);
  }

  editVehicleModel(model: VehicleModelResponse): void {
    this.editModel(model);
  }

  loadModels(query: Partial<GeneralOptionQuery>): void {
    this.loading.set(true);
    this.vehicleModelService.getAll(query).subscribe({
      next: (response) => {
        this.allModels.set(response.data);
        this.pagination.set(response.meta);
      },
      error: (err) => {
        this.loading.set(false);
        const message = this.extractErrorMessage(
          err,
          'Não foi possível carregar os modelos de veículos.',
        );
        this.toastService.error('Erro ao Carregar', message);
      },
      complete: () => {
        this.loading.set(false);
      },
    });
  }

  loadBrands(query: Partial<VehicleBrandFiltersRequest>) {
    this.vehicleBrandService.getOptions(query).subscribe({
      next: (response) => {
        this.brandSelectOptions.set(response.data);
      },
      error: (err) => {
        console.error('Erro ao carregar marcas model', err);
        const message = this.extractErrorMessage(
          err,
          'Não foi possível carregar as marcas de veículos.',
        );
        this.toastService.error('Erro ao Carregar Marcas', message);
      },
    });
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.searchSubject.next(query);
  }

  private executeSearch(query: string): void {
    this.currentPage.set(1);
    this.params = {
      ...this.params,
      search: query || null,
      page: this.currentPage(),
      per_page: this.perPage(),
    };
    this.loadModels(this.params);
  }

  onBrandFilterChange(brandId: string): void {
    this.selectedBrandId.set(brandId);
    this.currentPage.set(1);
    this.params = {
      ...this.params,
      vehicle_brand_id: brandId || null,
      page: this.currentPage(),
      per_page: this.perPage(),
    };
    this.loadModels(this.params);
  }

  onVersionFilterChange(version: string): void {
    this.selectedVersion.set(version);
    this.currentPage.set(1);
    this.params = {
      ...this.params,
      version: version || null,
      page: this.currentPage(),
      per_page: this.perPage(),
    };
    this.loadModels(this.params);
  }

  onStatusChange(status: string): void {
    this.selectedStatus.set(status);
    this.currentPage.set(1);
    const activeValue = status === 'active' ? 1 : status === 'inactive' ? 0 : null;
    this.params = {
      ...this.params,
      active: activeValue,
      page: this.currentPage(),
      per_page: this.perPage(),
    };
    this.loadModels(this.params);
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
    this.selectedVersion.set('');
    this.selectedStatus.set('');
    this.currentPage.set(1);
    this.params = {
      ...this.params,
      search: null,
      vehicle_brand_id: null,
      version: null,
      active: null,
      page: 1,
    };
    this.loadModels(this.params);
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
