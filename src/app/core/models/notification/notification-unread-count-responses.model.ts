export interface NotificationGeneralResponse {
  success: boolean;
  message: string;
  data: {
    unread_count: number;
  } | null;
}
