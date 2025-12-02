export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export type NotificationPriority = 'low' | 'medium' | 'high';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  isRead: boolean;
  link?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  readAt?: Date;
}

export interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
  total: number;
  page: number;
  limit: number;
}

export interface UnreadCountData {
  count: number;
}
