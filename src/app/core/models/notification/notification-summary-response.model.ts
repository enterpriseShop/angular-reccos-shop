export interface NotificationSummaryResponse {
  unread_count: number;
  recent: NotificationSummary[];
}

export interface NotificationSummary {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  severity: NotificationSeverity;
  tags: string[];
  origin: string;
  reference: NotificationReference;
  is_read: boolean;
  read_at: string | null;
  is_resolved: boolean;
  resolved_at: string | null;
  occurred_at: string;
  created_at: string;
}

export interface NotificationCategory {
  value: NotificationCategory;
  label: string;
}

export interface NotificationSeverity {
  value: NotificationSeverity;
  label: string;
}

export interface NotificationReference {
  type: string;
  id: string;
}
