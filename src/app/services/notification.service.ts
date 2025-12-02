import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { JwtService } from './auth/jwt.service';
import type {
  Notification as AppNotification,
  NotificationResponse,
  UnreadCountData,
} from '../models/notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private static readonly DEFAULT_LIMIT = 20;

  private readonly http = inject(HttpClient);
  private readonly jwtService = inject(JwtService);
  private socket: Socket | null = null;
  private readonly unreadCountSubject = new BehaviorSubject<number>(0);
  private readonly notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  private isConnected = false;

  /**
   * Get unread notification count as observable
   */
  public getUnreadCount(): Observable<number> {
    return this.unreadCountSubject.asObservable();
  }

  /**
   * Get notifications as observable
   */
  public getNotifications(): Observable<AppNotification[]> {
    return this.notificationsSubject.asObservable();
  }

  /**
   * Request browser notification permission
   */
  public async requestNotificationPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('⚠️ This browser does not support notifications');
      return 'denied';
    }

    const browserNotification = window.Notification;

    if (browserNotification.permission === 'granted') {
      return 'granted';
    }

    if (browserNotification.permission !== 'denied') {
      return await browserNotification.requestPermission();
    }

    return browserNotification.permission;
  }

  /**
   * Initialize WebSocket connection
   */
  public connect(): void {
    if (this.isConnected || this.socket?.connected) {
      return;
    }

    const token = this.jwtService.getCurrentUserInfo();
    if (!token) {
      console.warn('⚠️ Cannot connect to notifications: No authentication token');
      return;
    }

    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      console.warn('⚠️ Cannot connect to notifications: No access token in localStorage');
      return;
    }

    this.socket = io(`${environment.backendURL}/notifications`, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.setupEventListeners();
    this.isConnected = true;
  }

  /**
   * Disconnect WebSocket
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  /**
   * Fetch notifications from API
   */
  public fetchNotifications(
    page = 1,
    limit = NotificationService.DEFAULT_LIMIT,
  ): Observable<NotificationResponse> {
    return this.http.get<NotificationResponse>(
      `${environment.backendURL}/api/v1/notifications?page=${page}&limit=${limit}`,
      { withCredentials: true },
    );
  }

  /**
   * Mark notification as read
   */
  public markAsRead(notificationId: string): Observable<{ success: boolean }> {
    return this.http.patch<{ success: boolean }>(
      `${environment.backendURL}/api/v1/notifications/${notificationId}/read`,
      {},
      { withCredentials: true },
    );
  }

  /**
   * Mark all notifications as read
   */
  public markAllAsRead(): Observable<{ success: boolean; updatedCount: number }> {
    return this.http.patch<{ success: boolean; updatedCount: number }>(
      `${environment.backendURL}/api/v1/notifications/read-all`,
      {},
      { withCredentials: true },
    );
  }

  /**
   * Delete notification
   */
  public deleteNotification(notificationId: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(
      `${environment.backendURL}/api/v1/notifications/${notificationId}`,
      { withCredentials: true },
    );
  }

  /**
   * Setup WebSocket event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) {
      return;
    }

    this.socket.on('connect', () => {
      // Connected to notification server
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
    });

    this.socket.on('error', (error: Error) => {
      console.error('❌ Notification socket error:', error);
    });

    this.socket.on('new-notification', (notification: AppNotification) => {
      this.handleNewNotification(notification);
    });

    this.socket.on('unread-count', (data: UnreadCountData) => {
      this.unreadCountSubject.next(data.count);
    });

    this.socket.on('notification-read', (data: { notificationId: string }) => {
      this.updateNotificationReadStatus(data.notificationId);
    });
  }

  /**
   * Handle new notification
   */
  private handleNewNotification(notification: AppNotification): void {
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([notification, ...currentNotifications]);
    this.unreadCountSubject.next(this.unreadCountSubject.value + 1);

    // Show browser notification if permission granted
    this.showBrowserNotification(notification);
  }

  /**
   * Update notification read status in local state
   */
  private updateNotificationReadStatus(notificationId: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.map((n) =>
      n.id === notificationId ? { ...n, isRead: true, readAt: new Date() } : n,
    );
    this.notificationsSubject.next(updatedNotifications);

    const unreadCount = updatedNotifications.filter((n) => !n.isRead).length;
    this.unreadCountSubject.next(unreadCount);
  }

  /**
   * Show browser notification
   */
  private showBrowserNotification(notification: AppNotification): void {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const browserNotificationClass = window.Notification;
      if (browserNotificationClass.permission === 'granted') {
        const browserNotification = new browserNotificationClass(notification.title, {
          body: notification.message,
          icon: '/images/logo.png',
          badge: '/images/badge.png',
          tag: notification.id,
        });

        browserNotification.onclick = (): void => {
          window.focus();
          if (notification.link) {
            window.location.href = notification.link;
          }
        };
      }
    }
  }
}
