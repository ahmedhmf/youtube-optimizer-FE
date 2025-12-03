export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export type NotificationPriority = 'low' | 'medium' | 'high';

export type Notification = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  isRead: boolean;
  link?: string;
  actionUrl?: string;
  actionButtonText?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  readAt?: Date;
  severity: string;
};

export type NotificationResponse = {
  notifications: Notification[];
  unreadCount: number;
  total: number;
  page: number;
  limit: number;
};

export type UnreadCountData = {
  count: number;
};
