import { NotificationResponse } from './notification-response.model';

export interface NotificationDisplayResponse extends NotificationResponse, Record<string, unknown> {
  icon: string;
  iconColor: string;
  badgeVariant:
    | 'warning'
    | 'success'
    | 'error'
    | 'info'
    | 'default'
    | 'primary'
    | 'success'
    | 'warning'
    | 'error'
    | 'info'
    | 'neutral';
  categoryLabel: string;
}
