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

  /**
   * Initialize the application with authentication and session management
   * This function is called during app bootstrap via APP_INITIALIZER
   */
  public async initializeApp(): Promise<void> {
    try {
      // Skip auto-initialization in development if backend is not ready
      if (!this.shouldAutoInitialize()) {
        this.sessionService.initialize();
        return;
      }

      // Phase 1 & 4: Initialize authentication (CSRF + JWT session restoration)
      await firstValueFrom(this.authService.initialize());

      // Phase 5: Initialize session monitoring
      this.sessionService.initialize();
    } catch (error) {
      console.error('❌ App: Initialization failed:', error);

      // Clear any partial state and continue with unauthenticated flow
      this.authService.forceLogout('Initialization failed');
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
    // Always attempt initialization - let individual services handle failures gracefully
    return true;
  }
}
