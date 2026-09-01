import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { PageHeaderComponent } from '../../../design-system/page-header/page-header';
import { ToolbarComponent } from '../../../design-system/toolbar/toolbar';
import { SearchInputComponent } from '../../../design-system/input/search-input';
import { SelectComponent } from '../../../design-system/select/select';
import { ButtonComponent } from '../../../design-system/button/button';
import { DataTableComponent } from '../../../design-system/data-table/data-table';
import { PaginationComponent } from '../../../design-system/pagination/pagination';
import { ConfirmDialogComponent } from '../../../design-system/dialog/confirm-dialog';
import { AppIconComponent } from '../../../design-system/icon/app-icon';
import { ManufacturerFormComponent } from './manufacturer-form/manufacturer-form';
import { ToastService } from '../../../core/services/toast';
import { ManufacturerService } from '../../../core/services/manufacture-service';
import { ManufacturerResponse } from '../../../core/models/manufactureres/manufacturer-response.model';
import { TableAction, TableColumn } from '../../../core/models/list-table/list-table.model';
import {
  manufacturerTableActions,
  manufacturerTableColumns,
} from '../../../utils/manufacturer-table-collums';
import { PaginationMeta } from '../../../core/models/pagination/pagination.model';
import { initialValuesPagination } from '../../../design-system/pagination/utils/initial-values';
import { GeneralOptionQuery } from '../../../core/models/generals/general-option-query.model';

@Component({
  selector: 'app-manufacturers-page',
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
    ManufacturerFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './manufacturers.html',
  styleUrl: './manufacturers.css',
})
export class ManufacturersPageComponent implements OnInit, OnDestroy {
  private toastService = inject(ToastService);
  private manufacturerService = inject(ManufacturerService);

  readonly loading = signal<boolean>(false);
  readonly searchQuery = signal<string>('');
  readonly selectedStatus = signal<string>('');
  readonly currentPage = signal<number>(1);
  readonly perPage = signal<number>(10);

  // Subject para gerenciar a busca com atraso (debounce)
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  // Form Drawer State
  readonly isFormOpen = signal<boolean>(false);
  readonly formMode = signal<'create' | 'edit' | 'view'>('create');
  readonly selectedManufacturer = signal<ManufacturerResponse | null>(null);

  // Delete Dialog State
  readonly deleteDialogOpen = signal<boolean>(false);
  readonly selectedManufacturerForDelete = signal<ManufacturerResponse | null>(null);
  readonly isDeleting = signal<boolean>(false);

  readonly allManufacturers = signal<ManufacturerResponse[]>([]);

  readonly columns: TableColumn<ManufacturerResponse>[] = manufacturerTableColumns;
  readonly actions: TableAction<ManufacturerResponse>[] = manufacturerTableActions;

  readonly pagination = signal<PaginationMeta>(initialValuesPagination);

  query: Partial<GeneralOptionQuery> = {
    active: null,
    page: this.currentPage(),
    per_page: this.perPage(),
  };

  // Quick KPI Signals
  readonly totalCount = computed(() => this.allManufacturers().length);
  readonly activeCount = computed(() => this.allManufacturers().filter((m) => m.active).length);
  readonly withWebsiteCount = computed(
    () => this.allManufacturers().filter((m) => !!m.website).length,
  );

  ngOnInit(): void {
    // Busca inicial de dados
    this.loadManufacturers(this.query);

    // Inscrição no Subject com debounceTime (400ms)
    this.searchSubscription = this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((queryText) => {
        this.currentPage.set(1);
        this.query = {
          ...this.query,
          search: queryText,
          page: 1,
        };
        this.loadManufacturers(this.query);
      });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  loadManufacturers(query: Partial<GeneralOptionQuery>): void {
    this.loading.set(true);
    this.manufacturerService.getAll(query).subscribe({
      next: (response) => {
        this.allManufacturers.set(response.data);
        this.pagination.set(response.meta);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.toastService.error(
          'Erro ao buscar fabricantes',
          error.message || 'Falha ao carregar lista de fabricantes.',
        );
      },
    });
  }

  onActionClick(event: { actionId: string; row: ManufacturerResponse }): void {
    switch (event.actionId) {
      case 'view':
        this.viewManufacturer(event.row);
        break;
      case 'edit':
        this.editManufacturer(event.row);
        break;
      case 'delete':
        this.confirmDelete(event.row);
        break;
    }
  }

  // Chamado a cada digitação do input de busca
  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.searchSubject.next(query);
  }

  // Filtro por status
  onStatusChange(status: string): void {
    let activeValue: boolean | null = null;
    if (status === 'active') activeValue = true;
    if (status === 'inactive') activeValue = false;

    this.selectedStatus.set(status);
    this.currentPage.set(1);

    this.query = {
      ...this.query,
      active: activeValue,
      page: 1,
    };
    this.loadManufacturers(this.query);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.query = { ...this.query, page };
    this.loadManufacturers(this.query);
  }

  onPageSizeChange(size: number): void {
    this.perPage.set(size);
    this.currentPage.set(1);
    this.query = { ...this.query, per_page: size, page: 1 };
    this.loadManufacturers(this.query);
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedStatus.set('');
    this.currentPage.set(1);

    this.query = {
      active: null,
      search: '',
      page: 1,
      per_page: this.perPage(),
    };

    this.loadManufacturers(this.query);
    this.toastService.info('Filtros limpos', 'Todos os parâmetros de busca foram resetados.');
  }

  newManufacturer(): void {
    this.selectedManufacturer.set(null);
    this.formMode.set('create');
    this.isFormOpen.set(true);
  }

  editManufacturer(mfr: ManufacturerResponse): void {
    this.selectedManufacturer.set(mfr);
    this.formMode.set('edit');
    this.isFormOpen.set(true);
  }

  viewManufacturer(mfr: ManufacturerResponse): void {
    this.selectedManufacturer.set(mfr);
    this.formMode.set('view');
    this.isFormOpen.set(true);
  }

  closeForm(): void {
    this.isFormOpen.set(false);
    this.selectedManufacturer.set(null);
  }

  onManufacturerSaved(): void {
    this.loadManufacturers(this.query);
  }

  confirmDelete(mfr: ManufacturerResponse): void {
    this.selectedManufacturerForDelete.set(mfr);
    this.deleteDialogOpen.set(true);
  }

  executeDelete(): void {
    const mfr = this.selectedManufacturerForDelete();
    if (!mfr) return;

    this.isDeleting.set(true);
    this.manufacturerService.deleteManufacturer(mfr.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.deleteDialogOpen.set(false);
        this.allManufacturers.update((list) => list.filter((m) => m.id !== mfr.id));
        this.toastService.success(
          'Fabricante Excluído',
          `O fabricante "${mfr.name}" foi removido com sucesso.`,
        );
      },
      error: (err) => {
        this.isDeleting.set(false);
        this.deleteDialogOpen.set(false);
        this.toastService.error('Erro ao excluir', err.message || 'Falha ao remover fabricante.');
      },
    });
  }

  onPaginationChange(meta: PaginationMeta): void {
    this.pagination.set(meta);
    this.query = {
      ...this.query,
      page: meta.current_page,
      per_page: meta.per_page,
    };
    this.loadManufacturers(this.query);
  }
}
