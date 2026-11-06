import { NotificationResponse } from './notification-response.model';

export interface NotificationDisplayResponse extends NotificationResponse {
  icon: string;
  iconColor: string;
  badgeVariant: 'warning' | 'success' | 'error' | 'info' | 'default';
  categoryLabel: string;
}
