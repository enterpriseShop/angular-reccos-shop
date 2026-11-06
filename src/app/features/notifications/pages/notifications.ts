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
  NotificationCategory,
  NotificationReadFilter,
} from '../../../core/models/notification-mock.model';
import { NotificationsFiltersRequest } from '../../../core/models/notification/notification-filters-request.model';
import { NotificationDisplayResponse } from '../../../core/models/notification/notification-display-response.model';

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
  // Delete Confirm Dialog State

  readonly loading = signal<boolean>(false);
  readonly isDeleteDialogOpen = signal<boolean>(false);
  readonly isBulkDeleteConfirmOpen = signal<boolean>(false);

  readonly notifications = signal<NotificationDisplayResponse[]>([]);
  readonly notificationToDelete = signal<NotificationResponse | null>(null);

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

  readonly endItemIndex = computed(() => {
    const total = this.notificationMockService.filteredNotifications().length;
    const end =
      this.notificationMockService.currentPage() * this.notificationMockService.itemsPerPage();
    return Math.min(end, total);
  });

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
    const currentPageItems = this.notificationMockService.paginatedNotifications();
    if (currentPageItems.length === 0) return false;
    const selected = this.notificationMockService.selectedIds();
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

  onStatusFilterChange(status: NotificationReadFilter): void {
    this.notificationMockService.setStatusFilter(status);
  }

  onCategoryFilterChange(categoryValue: string): void {
    this.notificationMockService.setCategoryFilter(categoryValue as NotificationCategory | 'all');
  }

  onItemsPerPageChange(value: string): void {
    this.notificationMockService.setItemsPerPage(parseInt(value, 10) || 10);
  }

  onPageChange(page: number): void {
    this.notificationMockService.setPage(page);
  }

  toggleSelectAll(): void {
    this.notificationMockService.selectAllCurrentPage();
  }

  toggleSelect(id: string, event: Event): void {
    event.stopPropagation();
    this.notificationMockService.toggleSelectId(id);
  }

  // openDetails(notification: NotificationResponse, event?: Event): void {
  openDetails(notification: NotificationDisplayResponse, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    // this.notificationMockService.openDetails(notification);
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
  confirmDelete() {
    console.log('[CONFIRM DELETE]');
  }

  // confirmDelete(notification: NotificationDisplayResponse, event?: Event): void {
  //   if (event) {
  //     event.stopPropagation();
  //   }
  //   this.notificationToDelete.set(notification);
  //   this.isDeleteDialogOpen.set(true);
  // }

  executeDelete(): void {
    const item = this.notificationToDelete();
    if (item) {
      this.notificationMockService.deleteNotification(item.id);
      this.toastService.success('Excluída', 'A notificação foi removida da central.');
    }
    this.isDeleteDialogOpen.set(false);
    this.notificationToDelete.set(null);
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
    const created = this.notificationMockService.simulateEvent(preset);
    this.isSimulatorMenuOpen.set(false);
    this.toastService.success(
      'Evento de Sistema Gerado',
      `Nova notificação "${created.title}" registrada com sucesso.`,
    );
  }

  resetDefaults(): void {
    this.notificationMockService.resetToDefaults();
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
