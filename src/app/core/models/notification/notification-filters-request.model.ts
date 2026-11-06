import { NotificationCategory } from './notification-category-type.model';
import { NotificationSeverity } from './notification-severity-type.model';

export interface NotificationsFiltersRequest {
  page: number | null;
  read: boolean | null;
  search: string | null;
  date_to: string | null;
  active: boolean | null;
  unread: boolean | null;
  per_page: number | null;
  date_from: string | null;
  category: NotificationCategory | null;
  severity: NotificationSeverity | null;
}
