import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  AppNotification,
  NotificationCategoryValue,
  NotificationSeverityValue,
  NotificationsListResponse,
  NotificationSummaryResponse,
  NotificationUnreadCountResponse,
  NotificationStats,
} from '../models/notification-mock.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationMockService {
  private readonly http = inject(HttpClient);

  // Notifications state
  readonly notifications = signal<AppNotification[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Summary & Badge State
  readonly unreadCount = signal<number>(0);
  readonly recentNotifications = signal<AppNotification[]>([]);

  // Search & Filter state matching API parameters
  readonly searchQuery = signal<string>('');
  readonly statusFilter = signal<'all' | 'unread' | 'read'>('all');
  readonly categoryFilter = signal<NotificationCategoryValue | 'all'>('all');
  readonly severityFilter = signal<NotificationSeverityValue | 'all'>('all');
  readonly activeFilter = signal<'all' | 'active' | 'resolved'>('all');
  readonly dateFrom = signal<string>('');
  readonly dateTo = signal<string>('');

  // Pagination state
  readonly currentPage = signal<number>(1);
  readonly itemsPerPage = signal<number>(10);
  readonly totalItems = signal<number>(0);
  readonly lastPage = signal<number>(1);

  // Bulk Selection State
  readonly selectedIds = signal<string[]>([]);

  // Active Notification Detail Modal State
  readonly activeNotification = signal<AppNotification | null>(null);

  // Computed: Stats summary based on current list
  readonly stats = computed<NotificationStats>(() => {
    const items = this.notifications();
    return {
      total: this.totalItems() || items.length,
      unread: this.unreadCount(),
      read: Math.max(0, (this.totalItems() || items.length) - this.unreadCount()),
      critical: items.filter((n) => n.severity?.value === 'CRITICAL').length,
    };
  });

  // Computed: Check if any filter is active
  readonly hasActiveFilters = computed<boolean>(() => {
    return (
      this.searchQuery().trim() !== '' ||
      this.statusFilter() !== 'all' ||
      this.categoryFilter() !== 'all' ||
      this.severityFilter() !== 'all' ||
      this.activeFilter() !== 'all' ||
      this.dateFrom() !== '' ||
      this.dateTo() !== ''
    );
  });

  // Computed: Filtered Notifications (fallback or computed view)
  readonly filteredNotifications = computed<AppNotification[]>(() => {
    return this.notifications();
  });

  readonly paginatedNotifications = computed<AppNotification[]>(() => {
    return this.notifications();
  });

  readonly totalPages = computed<number>(() => {
    return this.lastPage();
  });

  constructor() {
    this.refreshAll();
  }

  // --- API CALLS ---

  refreshAll(): void {
    this.fetchNotifications();
    this.fetchSummary();
  }

  fetchNotifications(): void {
    this.isLoading.set(true);
    this.error.set(null);

    let params = new HttpParams()
      .set('page', this.currentPage().toString())
      .set('per_page', this.itemsPerPage().toString());

    const search = this.searchQuery().trim();
    if (search) {
      params = params.set('search', search);
    }

    const status = this.statusFilter();
    if (status === 'unread') {
      params = params.set('unread', 'true');
    } else if (status === 'read') {
      params = params.set('read', 'true');
    }

    const category = this.categoryFilter();
    if (category !== 'all') {
      params = params.set('category', category);
    }

    const severity = this.severityFilter();
    if (severity !== 'all') {
      params = params.set('severity', severity);
    }

    const active = this.activeFilter();
    if (active === 'active') {
      params = params.set('active', 'true');
    } else if (active === 'resolved') {
      params = params.set('active', 'false');
    }

    const df = this.dateFrom();
    if (df) {
      params = params.set('date_from', df);
    }

    const dt = this.dateTo();
    if (dt) {
      params = params.set('date_to', dt);
    }

    this.http.get<NotificationsListResponse>('/api/notifications', { params }).subscribe({
      next: (res) => {
        if (res.success && Array.isArray(res.data)) {
          const items = res.data.map((item) => this.normalizeItem(item));
          this.notifications.set(items);
          if (res.meta) {
            this.totalItems.set(res.meta.total);
            this.lastPage.set(res.meta.last_page);
          }
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching notifications:', err);
        this.error.set('Não foi possível carregar as notificações.');
        this.isLoading.set(false);
      },
    });
  }

  fetchSummary(limit = 5): void {
    const params = new HttpParams().set('limit', limit.toString());
    this.http.get<NotificationSummaryResponse>('/api/notifications/summary', { params }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.unreadCount.set(res.data.unread_count);
          if (Array.isArray(res.data.recent)) {
            const normalizedRecent = res.data.recent.map((item) => this.normalizeItem(item));
            this.recentNotifications.set(normalizedRecent);
          }
        }
      },
      error: (err) => {
        console.error('Error fetching summary:', err);
      },
    });
  }

  fetchUnreadCount(): void {
    this.http.get<NotificationUnreadCountResponse>('/api/notifications/unread-count').subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.unreadCount.set(res.data.unread_count);
        }
      },
    });
  }

  private normalizeItem(item: AppNotification): AppNotification {
    return {
      ...item,
      read: item.is_read,
      description: item.message || item.description || '',
    };
  }

  // --- ACTIONS ---

  markAsRead(id: string): void {
    // Optimistic local update
    this.notifications.update((list) =>
      list.map((item) =>
        item.id === id
          ? { ...item, is_read: true, read: true, read_at: new Date().toISOString() }
          : item,
      ),
    );
    this.recentNotifications.update((list) =>
      list.map((item) =>
        item.id === id
          ? { ...item, is_read: true, read: true, read_at: new Date().toISOString() }
          : item,
      ),
    );
    this.unreadCount.update((c) => Math.max(0, c - 1));

    if (this.activeNotification()?.id === id) {
      this.activeNotification.update((n) =>
        n ? { ...n, is_read: true, read: true, read_at: new Date().toISOString() } : null,
      );
    }

    this.http.patch(`/api/notifications/${id}/read`, {}).subscribe({
      next: () => this.fetchUnreadCount(),
      error: () => this.fetchNotifications(),
    });
  }

  markAsUnread(id: string): void {
    // Optimistic local update
    this.notifications.update((list) =>
      list.map((item) =>
        item.id === id ? { ...item, is_read: false, read: false, read_at: null } : item,
      ),
    );
    this.recentNotifications.update((list) =>
      list.map((item) =>
        item.id === id ? { ...item, is_read: false, read: false, read_at: null } : item,
      ),
    );
    this.unreadCount.update((c) => c + 1);

    if (this.activeNotification()?.id === id) {
      this.activeNotification.update((n) =>
        n ? { ...n, is_read: false, read: false, read_at: null } : null,
      );
    }

    this.http.patch(`/api/notifications/${id}/unread`, {}).subscribe({
      next: () => this.fetchUnreadCount(),
      error: () => this.fetchNotifications(),
    });
  }

  toggleReadStatus(id: string): void {
    const item =
      this.notifications().find((n) => n.id === id) ||
      this.recentNotifications().find((n) => n.id === id);
    if (!item) return;
    if (item.is_read) {
      this.markAsUnread(id);
    } else {
      this.markAsRead(id);
    }
  }

  markAllAsRead(): void {
    // Optimistic local update
    const now = new Date().toISOString();
    this.notifications.update((list) =>
      list.map((item) => ({ ...item, is_read: true, read: true, read_at: now })),
    );
    this.recentNotifications.update((list) =>
      list.map((item) => ({ ...item, is_read: true, read: true, read_at: now })),
    );
    this.unreadCount.set(0);

    if (this.activeNotification()) {
      this.activeNotification.update((n) =>
        n ? { ...n, is_read: true, read: true, read_at: now } : null,
      );
    }

    this.http.post('/api/notifications/read-all', {}).subscribe({
      next: () => {
        this.fetchUnreadCount();
        this.fetchSummary();
      },
      error: () => this.fetchNotifications(),
    });
  }

  deleteNotification(id: string): void {
    // Optimistic local removal
    const target = this.notifications().find((n) => n.id === id);
    if (target && !target.is_read) {
      this.unreadCount.update((c) => Math.max(0, c - 1));
    }

    this.notifications.update((list) => list.filter((item) => item.id !== id));
    this.recentNotifications.update((list) => list.filter((item) => item.id !== id));
    this.selectedIds.update((ids) => ids.filter((i) => i !== id));

    if (this.activeNotification()?.id === id) {
      this.activeNotification.set(null);
    }

    this.http.delete(`/api/notifications/${id}`).subscribe({
      next: () => {
        this.fetchUnreadCount();
        this.fetchNotifications();
      },
      error: () => this.fetchNotifications(),
    });
  }

  // Bulk Actions
  markSelectedAsRead(): void {
    const selected = this.selectedIds();
    if (selected.length === 0) return;

    selected.forEach((id) => this.markAsRead(id));
    this.selectedIds.set([]);
  }

  markSelectedAsUnread(): void {
    const selected = this.selectedIds();
    if (selected.length === 0) return;

    selected.forEach((id) => this.markAsUnread(id));
    this.selectedIds.set([]);
  }

  deleteSelected(): void {
    const selected = this.selectedIds();
    if (selected.length === 0) return;

    selected.forEach((id) => this.deleteNotification(id));
    this.selectedIds.set([]);
  }

  // Selection Controls
  toggleSelectId(id: string): void {
    this.selectedIds.update((ids) =>
      ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id],
    );
  }

  clearSelection(): void {
    this.selectedIds.set([]);
  }

  // Search & Filter Setters
  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
    this.fetchNotifications();
  }

  setStatusFilter(status: 'all' | 'unread' | 'read'): void {
    this.statusFilter.set(status);
    this.currentPage.set(1);
    this.fetchNotifications();
  }

  setCategoryFilter(category: NotificationCategoryValue | 'all'): void {
    this.categoryFilter.set(category);
    this.currentPage.set(1);
    this.fetchNotifications();
  }

  setSeverityFilter(severity: NotificationSeverityValue | 'all'): void {
    this.severityFilter.set(severity);
    this.currentPage.set(1);
    this.fetchNotifications();
  }

  setActiveFilter(active: 'all' | 'active' | 'resolved'): void {
    this.activeFilter.set(active);
    this.currentPage.set(1);
    this.fetchNotifications();
  }

  setDateFrom(date: string): void {
    this.dateFrom.set(date);
    this.currentPage.set(1);
    this.fetchNotifications();
  }

  setDateTo(date: string): void {
    this.dateTo.set(date);
    this.currentPage.set(1);
    this.fetchNotifications();
  }

  setPage(page: number): void {
    this.currentPage.set(page);
    this.fetchNotifications();
  }

  setItemsPerPage(perPage: number): void {
    this.itemsPerPage.set(perPage);
    this.currentPage.set(1);
    this.fetchNotifications();
  }

  clearAllFilters(): void {
    this.searchQuery.set('');
    this.statusFilter.set('all');
    this.categoryFilter.set('all');
    this.severityFilter.set('all');
    this.activeFilter.set('all');
    this.dateFrom.set('');
    this.dateTo.set('');
    this.currentPage.set(1);
    this.fetchNotifications();
  }

  // Details Modal Controls
  openDetails(notification: AppNotification): void {
    if (!notification.is_read) {
      this.markAsRead(notification.id);
    }
    this.activeNotification.set(notification);
  }

  closeDetails(): void {
    this.activeNotification.set(null);
  }
}
