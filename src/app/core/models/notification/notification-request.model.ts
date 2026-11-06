import { NotificationCategory } from './notification-category-type.model';
import { NotificationSeverity } from './notification-severity-type.model';

export interface NotificationRequest {
  title: string;
  message: string;
  category: NotificationCategory;
  severity: NotificationSeverity;
  tags: string[];
  origin: string;
  reference_type: string;
  reference_id: string;
}
