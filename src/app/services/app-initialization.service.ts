import { NotificationService } from './notification.service';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth/auth.service';
import { SessionService } from './auth/session.service';

@Injectable({
  providedIn: 'root',
})
export class AppInitializationService {
  private readonly authService = inject(AuthService);
  private readonly sessionService = inject(SessionService);
  private readonly notificationService = inject(NotificationService);

  /**
   * Initialize the application with authentication and session management
   * This function is called during app bootstrap via APP_INITIALIZER
   */
  public async initializeApp(): Promise<void> {
    try {
      if (!this.shouldAutoInitialize()) {
        this.sessionService.initialize();
        return;
      }

      await firstValueFrom(this.authService.initialize());

      this.sessionService.initialize();

      // Initialize notifications after successful authentication
      if (this.authService.isAuthenticated()) {
        this.notificationService.initialize();
        // await this.notificationService.requestPermission();
      }
    } catch {
      this.authService.forceLogout();
    }
  }

  /**
   * Get app initialization status
   */
  public isInitialized(): boolean {
    return this.authService.isInitialized();
  }

  /**
   * Check if we should attempt auto-initialization
   */
  private shouldAutoInitialize(): boolean {
    return true;
  }
}
