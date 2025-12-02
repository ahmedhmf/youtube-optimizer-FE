import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { notificationStore } from '../../stores/notification.store';
import type { Notification } from '../../models/notification.model';

@Component({
  selector: 'app-notification-dropdown',
  imports: [CommonModule],
  templateUrl: './notification-dropdown.html',
  styleUrl: './notification-dropdown.scss',
})
export class NotificationDropdownComponent {
  private static readonly DEFAULT_LIMIT = 20;
  private static readonly MS_PER_MINUTE = 60000;
  private static readonly MS_PER_HOUR = 3600000;
  private static readonly MS_PER_DAY = 86400000;
  private static readonly MINUTES_PER_HOUR = 60;
  private static readonly HOURS_PER_DAY = 24;
  private static readonly DAYS_PER_WEEK = 7;

  protected readonly store = inject(notificationStore);
  protected readonly isOpen = signal(false);

  public handleNotificationClick(notification: Notification): void {
    if (!notification.isRead) {
      this.store.markAsRead(notification.id);
    }
    if (notification.link) {
      window.location.href = notification.link;
    }
  }

  public deleteNotification(event: Event, notificationId: string): void {
    event.stopPropagation();
    this.store.deleteNotification(notificationId);
  }

  public loadMore(): void {
    const nextPage = this.store.currentPage() + 1;
    this.store.loadNotifications({
      page: nextPage,
      limit: NotificationDropdownComponent.DEFAULT_LIMIT,
    });
  }

  protected toggleDropdown(): void {
    this.isOpen.set(!this.isOpen());
    if (this.isOpen() && this.store.notifications().length === 0) {
      this.store.loadNotifications({
        page: 1,
        limit: NotificationDropdownComponent.DEFAULT_LIMIT,
      });
    }
  }

  protected markAllAsRead(): void {
    this.store.markAllAsRead(undefined);
  }

  protected getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / NotificationDropdownComponent.MS_PER_MINUTE);
    const diffHours = Math.floor(diffMs / NotificationDropdownComponent.MS_PER_HOUR);
    const diffDays = Math.floor(diffMs / NotificationDropdownComponent.MS_PER_DAY);

    if (diffMins < 1) {
      return 'Just now';
    }
    if (diffMins < NotificationDropdownComponent.MINUTES_PER_HOUR) {
      return `${diffMins}m ago`;
    }
    if (diffHours < NotificationDropdownComponent.HOURS_PER_DAY) {
      return `${diffHours}h ago`;
    }
    if (diffDays < NotificationDropdownComponent.DAYS_PER_WEEK) {
      return `${diffDays}d ago`;
    }
    return new Date(date).toLocaleDateString();
  }
}
