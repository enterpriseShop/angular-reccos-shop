import { NotificationCategory } from './notification-category-type.model';
import { NotificationSeverity } from './notification-severity-type.model';

export interface NotificationResponse {
  id: string;
  title: string;
  message: string;
  category: NotificationCategoryData;
  type: string;
  severity: NotificationSeverityData;
  tags: string[];
  origin: string;
  reference: NotificationReference;
  is_read: boolean;
  read_at: string | null;
  is_resolved: boolean;
  resolved_at: string | null;
  occurred_at: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationCategoryData {
  value: NotificationCategory;
  label: string;
}

export interface NotificationSeverityData {
  value: NotificationSeverity;
  label: string;
}

export interface NotificationReference {
  type: string;
  id: string;
}
