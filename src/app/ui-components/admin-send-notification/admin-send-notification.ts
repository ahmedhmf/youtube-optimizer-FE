import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import type { NotificationType, NotificationPriority } from '../../models/notification.model';

type SendNotificationRequest = {
  userId?: string;
  type?: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  link?: string;
  actionUrl?: string;
  actionButtonText?: string;
  sendToAll?: boolean;
  severity: NotificationType;
};

@Component({
  selector: 'app-admin-send-notification',
  imports: [FormsModule],
  templateUrl: './admin-send-notification.html',
  styleUrl: './admin-send-notification.scss',
})
export class AdminSendNotificationComponent {
  private static readonly MESSAGE_TIMEOUT = 5000;

  protected readonly userId = signal<string>('');
  protected readonly type = signal<NotificationType>('info');
  protected readonly title = signal<string>('');
  protected readonly message = signal<string>('');
  protected readonly priority = signal<NotificationPriority>('medium');
  protected readonly link = signal<string>('');
  protected readonly actionUrl = signal<string>('');
  protected readonly actionButtonText = signal<string>('');
  protected readonly sendToAll = signal<boolean>(false);
  protected readonly isLoading = signal<boolean>(false);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly notificationTypes: NotificationType[] = [
    'info',
    'success',
    'warning',
    'error',
  ];
  protected readonly priorityLevels: NotificationPriority[] = ['low', 'medium', 'high'];

  private readonly http = inject(HttpClient);

  protected onSendToAllChange(checked: boolean): void {
    this.sendToAll.set(checked);
    if (checked) {
      this.userId.set('');
    }
  }

  protected async sendNotification(): Promise<void> {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    const payload = this.buildPayload();

    try {
      await this.sendNotificationRequest(payload);
      this.successMessage.set('Notification sent successfully!');
      this.resetForm();
    } catch (error) {
      this.handleError(error);
    } finally {
      this.isLoading.set(false);
      this.clearMessagesAfterDelay();
    }
  }

  private validateForm(): boolean {
    if (!this.title() || !this.message()) {
      this.errorMessage.set('Title and message are required');
      return false;
    }

    if (!this.sendToAll() && !this.userId()) {
      this.errorMessage.set('User ID is required when not sending to all users');
      return false;
    }

    return true;
  }

  private buildPayload(): SendNotificationRequest {
    const payload: SendNotificationRequest = {
      severity: this.type(),
      title: this.title(),
      message: this.message(),
      priority: this.priority(),
      sendToAll: this.sendToAll(),
    };

    if (!this.sendToAll() && this.userId()) {
      payload.userId = this.userId();
    }

    if (this.link()) {
      payload.link = this.link();
    }

    if (this.actionUrl()) {
      payload.actionUrl = this.actionUrl();
    }

    if (this.actionButtonText()) {
      payload.actionButtonText = this.actionButtonText();
    }

    return payload;
  }

  private async sendNotificationRequest(payload: SendNotificationRequest): Promise<void> {
    await this.http
      .post<{
        success: boolean;
        message: string;
      }>(`${environment.backendURL}/api/v1/admin/notifications/send`, payload, {
        withCredentials: true,
      })
      .toPromise();
  }

  private handleError(error: unknown): void {
    this.errorMessage.set(error instanceof Error ? error.message : 'Failed to send notification');
  }

  private clearMessagesAfterDelay(): void {
    setTimeout(() => {
      this.successMessage.set(null);
      this.errorMessage.set(null);
    }, AdminSendNotificationComponent.MESSAGE_TIMEOUT);
  }

  private resetForm(): void {
    this.userId.set('');
    this.type.set('info');
    this.title.set('');
    this.message.set('');
    this.priority.set('medium');
    this.link.set('');
    this.actionUrl.set('');
    this.actionButtonText.set('');
    this.sendToAll.set(false);
  }
}
