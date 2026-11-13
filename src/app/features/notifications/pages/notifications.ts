import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { PageHeaderComponent } from '../../../design-system/page-header/page-header';
import { SearchInputComponent } from '../../../design-system/input/search-input';
import { ButtonComponent } from '../../../design-system/button/button';
import { PaginationComponent } from '../../../design-system/pagination/pagination';
import { ConfirmDialogComponent } from '../../../design-system/dialog/confirm-dialog';
import { AppIconComponent } from '../../../design-system/icon/app-icon';
import { NotificationDetailModalComponent } from '../components/notification-detail-modal/notification-detail-modal';
import { ToastService } from '../../../core/services/toast';
import { SelectComponent } from '../../../design-system/select/select';
import { NotificationService } from '../../../core/services/notification';
import { SelectOption } from '../../../core/models/design-system/select-option.model';
import { NotificationResponse } from '../../../core/models/notification/notification-response.model';
import { PaginationMeta } from '../../../core/models/pagination/pagination.model';
import { initialValuesPagination } from '../../../design-system/pagination/utils/initial-values';
import { NotificationMockService } from '../../../core/utils/notification-mock';
import {
  NotificationCategoryValue,
  NotificationSeverityValue,
} from '../../../core/models/notification-mock.model';
import { NotificationsFiltersRequest } from '../../../core/models/notification/notification-filters-request.model';
import { NotificationDisplayResponse } from '../../../core/models/notification/notification-display-response.model';
import { DateRangePicker } from '../../../design-system/date-range-picker/date-range-picker';
import { DateRange } from '../../../core/models/date-range-picker/date-range-picker.model';
import { DatePipe, NgClass } from '@angular/common';

const TYPE_ICON_MAP: Record<string, string> = {
  warning: 'alert-triangle',
  success: 'check-circle',
  error: 'alert-circle',
  system: 'cpu',
  info: 'info',
};

const TYPE_BADGE_VARIANT_MAP: Record<string, 'warning' | 'success' | 'error' | 'info' | 'default'> =
  {
    warning: 'warning',
    success: 'success',
    error: 'error',
    info: 'info',
  };

const TYPE_ICON_COLOR_MAP: Record<string, string> = {
  warning:
    'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200/80 dark:border-amber-800/80',
  success:
    'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/80 dark:border-emerald-800/80',
  error:
    'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200/80 dark:border-rose-800/80',
  system:
    'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border-purple-200/80 dark:border-purple-800/80',
  info: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200/80 dark:border-blue-800/80',
};

const CATEGORY_LABEL_MAP: Record<string, string> = {
  estoque: 'Estoque',
  importacao: 'Importação',
  catalogo: 'Catálogo',
  compatibilidade: 'Compatibilidade OEM',
  veiculos: 'Veículos',
  sistema: 'Sistema',
};

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [
    PageHeaderComponent,
    SearchInputComponent,
    SelectComponent,
    ButtonComponent,
    PaginationComponent,
    ConfirmDialogComponent,
    AppIconComponent,
    NotificationDetailModalComponent,
    DateRangePicker,
    DatePipe,
    NgClass,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notifications.html',
  styleUrl: './notifications.css',
})
export class NotificationsPageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  readonly notificationService = inject(NotificationService);
  readonly notificationMockService = inject(NotificationMockService);

  readonly page = signal<number>(1);
  readonly perPage = signal<number>(10);

  readonly selectedIds = signal<string[]>([]);

  readonly loading = signal<boolean>(false);
  readonly isDeleteDialogOpen = signal<boolean>(false);
  readonly activeNotification = signal<boolean>(false);
  readonly isBulkDeleteConfirmOpen = signal<boolean>(false);

  readonly notifications = signal<NotificationDisplayResponse[]>([]);
  readonly notificationToDelete = signal<NotificationResponse | null>(null);
  readonly notificationSelected = signal<NotificationDisplayResponse | null>(null);

  // Simulation Menu state
  readonly isSimulatorMenuOpen = signal<boolean>(false);

  readonly pagination = signal<PaginationMeta>(initialValuesPagination);

  // Category select options
  readonly categoryOptions: SelectOption[] = [
    { value: 'all', label: 'Todas as Categorias', sublabel: 'all', disabled: false, module: '' },
    { value: 'estoque', label: 'Estoque', sublabel: 'all', disabled: false, module: '' },
    { value: 'importacao', label: 'Importação', sublabel: 'all', disabled: false, module: '' },
    { value: 'catalogo', label: 'Catálogo', sublabel: 'all', disabled: false, module: '' },
    {
      value: 'compatibilidade',
      label: 'Compatibilidade OEM',
      sublabel: 'all',
      disabled: false,
      module: '',
    },
    { value: 'veiculos', label: 'Veículos', sublabel: 'all', disabled: false, module: '' },
    { value: 'sistema', label: 'Sistema', sublabel: 'all', disabled: false, module: '' },
  ];

  readonly severityOptions: SelectOption[] = [
    { value: 'all', label: 'Todas as Gravidades', sublabel: 'all', disabled: false, module: '' },
    {
      value: 'CRITICAL',
      label: 'Crítico (CRITICAL)',
      sublabel: 'all',
      disabled: false,
      module: '',
    },
    { value: 'WARNING', label: 'Aviso (WARNING)', sublabel: 'all', disabled: false, module: '' },
    { value: 'INFO', label: 'Informativo (INFO)', sublabel: 'all', disabled: false, module: '' },
    { value: 'SUCCESS', label: 'Sucesso (SUCCESS)', sublabel: 'all', disabled: false, module: '' },
  ];

  // Occurrence status options matching API active param
  readonly activeOptions: SelectOption[] = [
    { value: 'all', label: 'Todas as Ocorrências', sublabel: 'all', disabled: false, module: '' },
    { value: 'active', label: 'Somente Ativas', sublabel: 'all', disabled: false, module: '' },
    {
      value: 'resolved',
      label: 'Normalizadas / Resolvidas',
      sublabel: 'all',
      disabled: false,
      module: '',
    },
  ];

  params: NotificationsFiltersRequest = {
    read: null,
    search: null,
    date_to: null,
    active: null,
    unread: null,
    date_from: null,
    category: null,
    severity: null,
    page: this.page(),
    per_page: this.perPage(),
  };

  // Check if all items on current page are selected
  readonly isAllCurrentPageSelected = computed(() => {
    const currentPageItems = this.notifications();
    if (currentPageItems.length === 0) return false;
    const selected = this.selectedIds();
    return currentPageItems.every((n) => selected.includes(n.id));
  });

  ngOnInit(): void {
    this.getAllNotifications(this.params);
  }

  getAllNotifications(params: NotificationsFiltersRequest) {
    this.loading.set(true);
    this.notificationService.getAll(params).subscribe({
      next: (response) => {
        const result = response.data.map((item) => ({
          ...item,
          icon: TYPE_ICON_MAP[item.type] ?? 'info',
          badgeVariant: TYPE_BADGE_VARIANT_MAP[item.type] ?? 'info',
          iconColor:
            TYPE_ICON_COLOR_MAP[item.type] ??
            'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200/80 dark:border-blue-800/80',
          categoryLabel: CATEGORY_LABEL_MAP[item.category.label] ?? item.category.label,
        }));
        this.notifications.set(result);
      },
      error: () => {
        this.notifications.set([]);
      },
      complete: () => {
        this.loading.set(false);
      },
    });
  }

  // --- Actions ---

  onSearchChange(query: string): void {
    this.notificationMockService.setSearchQuery(query);
  }

  onStatusFilterChange(status: 'all' | 'unread' | 'read'): void {
    this.notificationMockService.setStatusFilter(status);
  }

  onCategoryFilterChange(val: string): void {
    this.notificationMockService.setCategoryFilter(val as NotificationCategoryValue | 'all');
  }

  onSeverityFilterChange(val: string): void {
    this.notificationMockService.setSeverityFilter(val as NotificationSeverityValue | 'all');
  }

  onActiveFilterChange(val: string): void {
    this.notificationMockService.setActiveFilter(val as 'all' | 'active' | 'resolved');
  }

  onItemsPerPageChange(value: string): void {
    this.notificationMockService.setItemsPerPage(parseInt(value, 10) || 10);
  }

  onPageChange(page: number): void {
    this.notificationMockService.setPage(page);
  }

  toggleSelectAll(event: Event): void {
    const currentIds = this.notifications().map((n) => n.id);
    const allSelected = (event.currentTarget as HTMLInputElement).checked;

    if (allSelected) {
      this.selectedIds.set(currentIds);
    } else {
      this.selectedIds.set([]);
    }
  }

  toggleSelect(id: string): void {
    this.selectedIds.update((ids) =>
      ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id],
    );
  }

  onDateRangeChange(range: DateRange): void {
    this.notificationMockService.setDateFrom(range.dateFrom);
    this.notificationMockService.setDateTo(range.dateTo);
  }

  openDetails(notification: NotificationDisplayResponse, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.notificationSelected.set(notification);
    this.activeNotification.set(true);
  }

  closeDetails(): void {
    this.activeNotification.set(false);
    this.notificationSelected.set(null);
  }

  toggleRead(notification: NotificationDisplayResponse, event: Event): void {
    event.stopPropagation();
    this.notificationMockService.toggleReadStatus(notification.id);
    // const newStatus = !notification.read ? 'lida' : 'não lida';
    const newStatus = 'lida';
    this.toastService.info('Situação atualizada', `Notificação marcada como ${newStatus}.`);
  }

  markAllAsRead(): void {
    this.notificationMockService.markAllAsRead();
    this.toastService.success('Sucesso', 'Todas as notificações foram marcadas como lidas.');
  }

  confirmDelete(notification: NotificationDisplayResponse, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.notificationToDelete.set(notification);
    this.isDeleteDialogOpen.set(true);
  }

  executeDelete(): void {
    const item = this.notificationToDelete();
    if (item) {
      this.notificationService.deleteNotification(item.id).subscribe({
        next: () => {
          this.toastService.success('Excluída', 'A notificação foi removida da central.');
        },
        error: () => {
          this.toastService.error('Erro', 'Erro ao excluir notificação.');
        },
        complete: () => {
          this.isDeleteDialogOpen.set(false);
          this.notificationToDelete.set(null);
        },
      });
    }
  }

  // Bulk Actions
  markSelectedAsRead(): void {
    const count = this.notificationMockService.selectedIds().length;
    this.notificationMockService.markSelectedAsRead();
    this.toastService.success('Sucesso', `${count} notificação(ões) marcada(s) como lida(s).`);
  }

  markSelectedAsUnread(): void {
    const count = this.notificationMockService.selectedIds().length;
    this.notificationMockService.markSelectedAsUnread();
    this.toastService.info('Atualizado', `${count} notificação(ões) marcada(s) como não lida(s).`);
  }

  confirmBulkDelete(): void {
    this.isBulkDeleteConfirmOpen.set(true);
  }

  executeBulkDelete(): void {
    const count = this.notificationMockService.selectedIds().length;
    this.notificationMockService.deleteSelected();
    this.toastService.success('Excluídas', `${count} notificação(ões) removida(s) da central.`);
    this.isBulkDeleteConfirmOpen.set(false);
  }

  navigateToRelated(route: string, event: Event): void {
    event.stopPropagation();
    this.router.navigateByUrl(route);
  }

  // Event Simulation
  toggleSimulatorMenu(): void {
    this.isSimulatorMenuOpen.update((v) => !v);
  }

  triggerSimulatedEvent(preset?: 'estoque' | 'importacao' | 'oem' | 'catalogo'): void {
    // const created = this.notificationMockService.simulateEvent(preset);
    console.log(preset);
    this.isSimulatorMenuOpen.set(false);
    // this.toastService.success(
    //   'Evento de Sistema Gerado',
    //   `Nova notificação "${created.title}" registrada com sucesso.`,
    // );
  }

  resetDefaults(): void {
    // this.notificationMockService.resetToDefaults();
    this.toastService.info(
      'Restaurado',
      'A lista de notificações foi restaurada para o estado inicial.',
    );
  }

  onPaginationChange(meta: PaginationMeta): void {
    this.pagination.set(meta);
    this.params = {
      ...this.params,
      page: meta.current_page,
      per_page: meta.per_page,
    };
    this.getAllNotifications(this.params);
  }
}
