import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../../design-system/page-header/page-header';
import { ToolbarComponent } from '../../design-system/toolbar/toolbar';
import { SearchInputComponent } from '../../design-system/input/search-input';
import { SelectComponent } from '../../design-system/select/select';
import { ButtonComponent } from '../../design-system/button/button';
import { DataTableComponent } from '../../design-system/data-table/data-table';
import { PaginationComponent } from '../../design-system/pagination/pagination';
import { ConfirmDialogComponent } from '../../design-system/dialog/confirm-dialog';
import { AppIconComponent } from '../../design-system/icon/app-icon';
import { ManufacturerFormComponent } from './components/manufacturer-form/manufacturer-form';
import { ToastService } from '../../core/services/toast';
import { ManufacturerService } from '../../core/services/manufacturer';
import { Manufacturer } from '../../core/models/manufacturer';
import { TableColumn, TableAction } from '../../core/models/table-config';

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
    ManufacturerFormComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './manufacturers.html',
  styleUrl: './manufacturers.css'
})
export class ManufacturersPageComponent implements OnInit {
  private toastService = inject(ToastService);
  private manufacturerService = inject(ManufacturerService);

  readonly loading = signal<boolean>(false);
  readonly searchQuery = signal<string>('');
  readonly selectedStatus = signal<string>('');
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(10);
  readonly totalItems = signal<number>(0);

  // Form Drawer State
  readonly isFormOpen = signal<boolean>(false);
  readonly formMode = signal<'create' | 'edit' | 'view'>('create');
  readonly selectedManufacturer = signal<Manufacturer | null>(null);

  // Delete Dialog State
  readonly deleteDialogOpen = signal<boolean>(false);
  readonly selectedManufacturerForDelete = signal<Manufacturer | null>(null);
  readonly isDeleting = signal<boolean>(false);

  readonly allManufacturers = signal<Manufacturer[]>([]);

  readonly columns: TableColumn<Manufacturer>[] = [
    {
      key: 'image',
      header: 'Logo',
      width: '70px',
      align: 'center',
      type: 'icon',
      iconGetter: () => 'building'
    },
    { key: 'name', header: 'Fabricante / Marca' },
    { key: 'slug', header: 'Slug / URL', width: '160px' },
    {
      key: 'website',
      header: 'Website Oficial',
      width: '240px',
      valueGetter: (m: Manufacturer) => m.website || '—'
    },
    {
      key: 'active',
      header: 'Status',
      width: '120px',
      align: 'center',
      type: 'badge',
      badgeConfig: (m: Manufacturer) => ({
        text: m.active ? 'Ativo' : 'Inativo',
        variant: m.active ? 'success' : 'neutral'
      })
    },
    {
      key: 'created_at',
      header: 'Criado em',
      width: '120px',
      align: 'center',
      type: 'date'
    }
  ];

  readonly actions: TableAction<Manufacturer>[] = [
    {
      id: 'view',
      label: 'Visualizar',
      icon: 'eye',
      colorClass: 'text-gray-400 hover:text-[#5A8DEE] hover:bg-gray-100 dark:hover:bg-slate-700',
      title: 'Visualizar Detalhes',
      handler: (m) => this.viewManufacturer(m)
    },
    {
      id: 'edit',
      label: 'Editar',
      icon: 'edit',
      colorClass: 'text-gray-400 hover:text-[#4F8A6B] hover:bg-gray-100 dark:hover:bg-slate-700',
      title: 'Editar Fabricante',
      handler: (m) => this.editManufacturer(m)
    },
    {
      id: 'delete',
      label: 'Excluir',
      icon: 'trash-2',
      colorClass: 'text-gray-400 hover:text-[#D66A6A] hover:bg-gray-100 dark:hover:bg-slate-700',
      title: 'Excluir Fabricante',
      handler: (m) => this.confirmDelete(m)
    }
  ];

  // Quick KPI Signals
  readonly totalCount = computed(() => this.allManufacturers().length);
  readonly activeCount = computed(() => this.allManufacturers().filter(m => m.active).length);
  readonly withWebsiteCount = computed(() => this.allManufacturers().filter(m => !!m.website).length);

  ngOnInit(): void {
    this.loadManufacturers();
  }

  loadManufacturers(): void {
    this.loading.set(true);
    this.manufacturerService.getAll().subscribe({
      next: (response) => {
        this.allManufacturers.set(response.data);
        if (response.meta) {
          this.totalItems.set(response.meta.total);
          this.currentPage.set(response.meta.current_page);
          this.pageSize.set(response.meta.per_page);
        } else {
          this.totalItems.set(response.data.length);
        }
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.toastService.error('Erro ao buscar fabricantes', error.message || 'Falha ao carregar lista de fabricantes.');
      }
    });
  }

  readonly filteredManufacturers = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const st = this.selectedStatus();

    return this.allManufacturers().filter(m => {
      const matchesQ =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.slug.toLowerCase().includes(q) ||
        (m.website || '').toLowerCase().includes(q);

      const matchesSt = !st || (st === 'active' ? m.active : !m.active);
      return matchesQ && matchesSt;
    });
  });

  readonly paginatedManufacturers = computed(() => {
    const all = this.filteredManufacturers();
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

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedStatus.set('');
    this.currentPage.set(1);
    this.toastService.info('Filtros limpos', 'Todos os parâmetros de busca foram resetados.');
  }

  newManufacturer(): void {
    this.selectedManufacturer.set(null);
    this.formMode.set('create');
    this.isFormOpen.set(true);
  }

  editManufacturer(mfr: Manufacturer): void {
    this.selectedManufacturer.set(mfr);
    this.formMode.set('edit');
    this.isFormOpen.set(true);
  }

  viewManufacturer(mfr: Manufacturer): void {
    this.selectedManufacturer.set(mfr);
    this.formMode.set('view');
    this.isFormOpen.set(true);
  }

  closeForm(): void {
    this.isFormOpen.set(false);
    this.selectedManufacturer.set(null);
  }

  onManufacturerSaved(): void {
    this.loadManufacturers();
  }

  confirmDelete(mfr: Manufacturer): void {
    this.selectedManufacturerForDelete.set(mfr);
    this.deleteDialogOpen.set(true);
  }

  executeDelete(): void {
    const mfr = this.selectedManufacturerForDelete();
    if (!mfr) return;

    this.isDeleting.set(true);
    this.manufacturerService.delete(mfr.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.deleteDialogOpen.set(false);
        this.allManufacturers.update(list => list.filter(m => m.id !== mfr.id));
        this.toastService.success(
          'Fabricante Excluído',
          `O fabricante "${mfr.name}" foi removido com sucesso.`
        );
      },
      error: (err) => {
        this.isDeleting.set(false);
        this.deleteDialogOpen.set(false);
        this.toastService.error('Erro ao excluir', err.message || 'Falha ao remover fabricante.');
      }
    });
  }
}
