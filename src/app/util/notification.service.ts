import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  success(message: string, duration: number = 5000) {
    this.addNotification({ message, type: 'success', duration });
  }

  error(message: string, duration: number = 7000) {
    this.addNotification({ message, type: 'error', duration });
  }

  warning(message: string, duration: number = 6000) {
    this.addNotification({ message, type: 'warning', duration });
  }

  info(message: string, duration: number = 5000) {
    this.addNotification({ message, type: 'info', duration });
  }

  private addNotification(notification: Omit<Notification, 'id'>) {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };
    
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, newNotification]);
    
    // Auto remove after duration
    setTimeout(() => {
      this.removeNotification(id);
    }, notification.duration || 5000);
  }

  removeNotification(id: string) {
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next(currentNotifications.filter(n => n.id !== id));
  }
}