import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { computed } from '@angular/core';
import type { Notification, NotificationResponse } from '../models/notification.model';

type NotificationState = {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
};

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  hasMore: true,
};

export const notificationStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    unreadNotifications: computed(() => store.notifications().filter((n) => !n.isRead)),
    readNotifications: computed(() => store.notifications().filter((n) => n.isRead)),
    hasUnread: computed(() => store.unreadCount() > 0),
  })),
  withMethods((store) => ({
    setNotifications(notifications: Notification[]): void {
      patchState(store, { notifications });
    },
    addNotification(notification: Notification): void {
      const currentNotifications = store.notifications();
      patchState(store, {
        notifications: [notification, ...currentNotifications],
        unreadCount: store.unreadCount() + 1,
      });
    },
    setUnreadCount(count: number): void {
      patchState(store, { unreadCount: count });
    },
    setLoading(isLoading: boolean): void {
      patchState(store, { isLoading });
    },

    setError(error: string | null): void {
      patchState(store, { error });
    },
    loadNotificationsSuccess(response: NotificationResponse, append = false): void {
      const existingIds = new Set(store.notifications().map((n) => n.id));
      const newNotifications = response.notifications.filter((n) => !existingIds.has(n.id));

      patchState(store, {
        notifications: append
          ? [...store.notifications(), ...newNotifications]
          : response.notifications,
        unreadCount: response.unreadCount,
        currentPage: response.page,
        totalPages: Math.ceil(response.total / response.limit),
        hasMore: response.page * response.limit < response.total,
        isLoading: false,
        error: null,
      });
    },
    markAsReadLocal(notificationId: string): void {
      const notifications = store
        .notifications()
        .map((n) => (n.id === notificationId ? { ...n, isRead: true, readAt: new Date() } : n));
      const unreadCount = notifications.filter((n) => !n.isRead).length;
      patchState(store, { notifications, unreadCount });
    },
    markAllAsReadLocal(): void {
      const notifications = store.notifications().map((n) => ({
        ...n,
        isRead: true,
        readAt: new Date(),
      }));
      patchState(store, { notifications, unreadCount: 0 });
    },
    deleteNotificationLocal(notificationId: string): void {
      const notifications = store.notifications().filter((n) => n.id !== notificationId);
      const unreadCount = notifications.filter((n) => !n.isRead).length;
      patchState(store, { notifications, unreadCount });
    },
    clearAll(): void {
      patchState(store, initialState);
    },
  })),
);
