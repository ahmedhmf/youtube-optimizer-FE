import { Component, inject } from '@angular/core';
import type { OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { notificationStore } from '../../../../stores/notification.store';
import { NotificationService } from '../../../../services/notification.service';
import type { Notification } from '../../../../models/notification.model';

@Component({
  selector: 'app-notifications',
  imports: [CommonModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
})
export class Notifications implements OnInit, OnDestroy {
  protected readonly store = inject(notificationStore);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  // Define callback handlers
  private readonly callbackHandlers: Record<string, () => void> = {
    refreshVideoList: () => {
      console.warn('refreshVideoList callback not implemented');
      // TODO: Implement video list refresh
    },
    openSettings: () => {
      void this.router.navigate(['settings']);
    },
    reloadDashboard: () => {
      window.location.reload();
    },
    showUpgradeModal: () => {
      console.warn('showUpgradeModal callback not implemented');
      // TODO: Implement upgrade modal
    },
  };

  public ngOnInit(): void {
    this.notificationService.initialize();
  }

  public ngOnDestroy(): void {
    this.notificationService.disconnect();
  }

  protected close(notificationId: string): void {
    this.store.deleteNotificationLocal(notificationId);
    this.notificationService.markAsRead(notificationId);
  }

  protected handleNotificationClick(notification: Notification): void {
    if (!notification.isRead) {
      this.store.markAsReadLocal(notification.id);
      this.notificationService.markAsRead(notification.id);
    }
    if (notification.link) {
      window.location.href = notification.link;
    }
  }

  protected handleActionClick(notification: Notification): void {
    // If there's a callback, execute it
    if (notification.callback) {
      const handler = this.callbackHandlers[notification.callback];
      handler();
    } else if (notification.actionUrl) {
      // If there's an action URL, navigate to it
      if (notification.actionUrl.startsWith('http')) {
        window.location.href = notification.actionUrl;
      } else {
        void this.router.navigate([notification.actionUrl]);
      }
    }

    // Mark as read after action
    if (!notification.isRead) {
      this.store.markAsReadLocal(notification.id);
      this.notificationService.markAsRead(notification.id);
    }
  }

  protected getNotificationStyle(severity: string): string {
    switch (severity) {
      case 'success':
        return 'bg-green-600/20 text-green-400';
      case 'error':
        return 'bg-red-600/20 text-red-400';
      case 'warning':
        return 'bg-yellow-600/20 text-yellow-400';
      case 'info':
        return 'bg-blue-600/20 text-blue-400';
      default:
        return 'bg-gray-600/20 text-gray-400';
    }
  }
}
