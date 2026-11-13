export type NotificationCategoryValue =
  'STOCK' | 'PRODUCT' | 'PRICE' | 'IMPORT' | 'VEHICLE' | 'ADMIN' | 'SYSTEM' | 'AUDIT' | 'EXPORT';

export type NotificationSeverityValue = 'CRITICAL' | 'WARNING' | 'INFO' | 'SUCCESS';

export interface NotificationCategory {
  value: NotificationCategoryValue;
  label: string;
}

export interface NotificationSeverity {
  value: NotificationSeverityValue;
  label: string;
}

export interface NotificationReference {
  type: string;
  id: string;
  route?: string;
  label?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  type: string;
  severity: NotificationSeverity;
  tags: string[];
  origin: string;
  reference: NotificationReference | null;
  is_read: boolean;
  read_at: string | null;
  is_resolved: boolean;
  resolved_at: string | null;
  occurred_at: string;
  created_at: string;
  updated_at: string;

  // Optional alias properties for template backwards compatibility
  description?: string;
  read?: boolean;
}

export interface NotificationQueryParams {
  page?: number;
  per_page?: number;
  unread?: boolean;
  read?: boolean;
  category?: NotificationCategoryValue | 'all';
  severity?: NotificationSeverityValue | 'all';
  active?: boolean | null;
  search?: string;
  date_from?: string;
  date_to?: string;
}

export interface NotificationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface NotificationLinks {
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
}

export interface NotificationsListResponse {
  success: boolean;
  message: string;
  data: AppNotification[];
  meta: NotificationMeta;
  links: NotificationLinks;
}

export interface NotificationSummaryResponse {
  success: boolean;
  message: string;
  data: {
    unread_count: number;
    recent: AppNotification[];
  };
}

export interface NotificationUnreadCountResponse {
  success: boolean;
  message: string;
  data: {
    unread_count: number;
  };
}

export interface NotificationSingleResponse {
  success: boolean;
  message: string;
  data: AppNotification;
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  critical: number;
}
