import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import type { Notification } from '../models/notification.model';
import { NotificationService } from '../services/notification.service';

const DEFAULT_LIMIT = 20;

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
  withMethods((store) => {
    const notificationService = inject(NotificationService);

    return {
      /**
       * Initialize notification store with WebSocket connection
       */
      initialize: (): void => {
        notificationService.connect();

        // Subscribe to unread count updates
        notificationService.getUnreadCount().subscribe((count) => {
          patchState(store, { unreadCount: count });
        });

        // Subscribe to notification updates
        notificationService.getNotifications().subscribe((notifications) => {
          patchState(store, { notifications });
        });
      },

      /**
       * Load notifications from API
       */
      loadNotifications: rxMethod<{ page?: number; limit?: number }>(
        pipe(
          tap(() => {
            patchState(store, { isLoading: true, error: null });
          }),
          switchMap(({ page = 1, limit = DEFAULT_LIMIT }) =>
            notificationService.fetchNotifications(page, limit).pipe(
              tapResponse({
                next: (response: {
                  notifications: Notification[];
                  unreadCount: number;
                  total: number;
                  page: number;
                  limit: number;
                }) => {
                  const existingIds = new Set(store.notifications().map((n) => n.id));
                  const newNotifications = response.notifications.filter(
                    (n) => !existingIds.has(n.id),
                  );

                  patchState(store, {
                    notifications:
                      page === 1
                        ? response.notifications
                        : [...store.notifications(), ...newNotifications],
                    unreadCount: response.unreadCount,
                    currentPage: response.page,
                    totalPages: Math.ceil(response.total / response.limit),
                    hasMore: response.page * response.limit < response.total,
                    isLoading: false,
                  });
                },
                error: (error: Error) => {
                  patchState(store, {
                    error: error.message,
                    isLoading: false,
                  });
                },
              }),
            ),
          ),
        ),
      ),

      /**
       * Mark notification as read
       */
      markAsRead: rxMethod<string>(
        pipe(
          switchMap((notificationId) =>
            notificationService.markAsRead(notificationId).pipe(
              tapResponse({
                next: () => {
                  const notifications = store
                    .notifications()
                    .map((n) =>
                      n.id === notificationId ? { ...n, isRead: true, readAt: new Date() } : n,
                    );
                  const unreadCount = notifications.filter((n) => !n.isRead).length;
                  patchState(store, { notifications, unreadCount });
                },
                error: (error: Error) => {
                  console.error('Failed to mark notification as read:', error);
                },
              }),
            ),
          ),
        ),
      ),

      /**
       * Mark all notifications as read
       */
      markAllAsRead: rxMethod<undefined>(
        pipe(
          switchMap(() =>
            notificationService.markAllAsRead().pipe(
              tapResponse({
                next: () => {
                  const notifications = store.notifications().map((n) => ({
                    ...n,
                    isRead: true,
                    readAt: new Date(),
                  }));
                  patchState(store, { notifications, unreadCount: 0 });
                },
                error: (error: Error) => {
                  console.error('Failed to mark all as read:', error);
                },
              }),
            ),
          ),
        ),
      ),

      /**
       * Delete notification
       */
      deleteNotification: rxMethod<string>(
        pipe(
          switchMap((notificationId) =>
            notificationService.deleteNotification(notificationId).pipe(
              tapResponse({
                next: () => {
                  const notifications = store
                    .notifications()
                    .filter((n) => n.id !== notificationId);
                  const unreadCount = notifications.filter((n) => !n.isRead).length;
                  patchState(store, { notifications, unreadCount });
                },
                error: (error: Error) => {
                  console.error('Failed to delete notification:', error);
                },
              }),
            ),
          ),
        ),
      ),

      /**
       * Request browser notification permission
       */
      requestPermission: async (): Promise<void> => {
        await notificationService.requestNotificationPermission();
      },

      /**
       * Disconnect from notification service
       */
      disconnect: (): void => {
        notificationService.disconnect();
      },

      /**
       * Clear all local notifications
       */
      clearAll: (): void => {
        patchState(store, initialState);
      },
    };
  }),
);
