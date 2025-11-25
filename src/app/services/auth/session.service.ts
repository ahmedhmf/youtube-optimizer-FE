import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import type { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { JwtService } from './jwt.service';
import type { DecodedJwtToken } from '../../models/auth/decoded-jwt-token.type';
import type { SessionState } from '../../models/auth/session-state.type';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private static readonly ACTIVITY_UPDATE_INTERVAL = 30000;
  private static readonly SESSION_WARNING_TIME = 300000;
  private static readonly MILLISECONDS_TO_SECONDS = 1000;

  private readonly authService = inject(AuthService);
  private readonly jwtService = inject(JwtService);

  private readonly sessionStateSubject = new BehaviorSubject<SessionState>({
    isActive: false,
    userId: null,
    email: null,
    roles: [],
    lastActivity: Date.now(),
    expiresAt: null,
  });

  private activityTimer: number | null = null;
  private warningTimer: number | null = null;

  /**
   * Get current session state directly
   */
  public getCurrentSessionState(): SessionState {
    return this.sessionStateSubject.value;
  }

  /**
   * Initialize session monitoring
   */
  public initialize(): void {
    this.authService.getAuthenticationStatus().subscribe((isAuthenticated) => {
      if (isAuthenticated) {
        this.startSession();
      } else {
        this.endSession();
      }
    });

    this.jwtService.getUserInfoObservable().subscribe((userInfo) => {
      this.updateSessionFromUserInfo(userInfo);
    });

    this.startActivityMonitoring();
  }

  /**
   * Update user activity timestamp
   */
  public updateActivity(): void {
    const currentState = this.sessionStateSubject.value;

    if (currentState.isActive) {
      this.sessionStateSubject.next({
        ...currentState,
        lastActivity: Date.now(),
      });
    }
  }

  /**
   * Check if session is about to expire
   */
  public isSessionNearExpiry(): boolean {
    const state = this.getCurrentSessionState();

    if (!state.isActive || !state.expiresAt) {
      return false;
    }

    const timeUntilExpiry = state.expiresAt - Date.now();
    return timeUntilExpiry < SessionService.SESSION_WARNING_TIME;
  }

  /**
   * Get time until session expires (in seconds)
   */
  public getTimeUntilExpiry(): number {
    const state = this.getCurrentSessionState();

    if (!state.isActive || !state.expiresAt) {
      return 0;
    }

    return Math.max(
      0,
      Math.floor((state.expiresAt - Date.now()) / SessionService.MILLISECONDS_TO_SECONDS),
    );
  }

  /**
   * Extend session by refreshing token
   */
  public extendSession(): Observable<string> {
    return this.jwtService.refreshAccessToken();
  }

  /**
   * End current session
   */
  public endSession(): void {
    this.sessionStateSubject.next({
      isActive: false,
      userId: null,
      email: null,
      roles: [],
      lastActivity: Date.now(),
      expiresAt: null,
    });

    this.clearTimers();
  }

  /**
   * Start new session
   */
  private startSession(): void {
    const userInfo = this.jwtService.getCurrentUserInfo();

    if (userInfo) {
      this.updateSessionFromUserInfo(userInfo);
    }
  }

  /**
   * Update session state from JWT user info
   */
  private updateSessionFromUserInfo(userInfo: DecodedJwtToken | null): void {
    if (!userInfo) {
      return;
    }

    const expiresAt = userInfo.exp ? userInfo.exp * SessionService.MILLISECONDS_TO_SECONDS : null;

    this.sessionStateSubject.next({
      isActive: true,
      userId: userInfo.sub,
      email: userInfo.email,
      roles: userInfo.roles,
      lastActivity: Date.now(),
      expiresAt,
    });
  }

  /**
   * Start monitoring user activity
   */
  private startActivityMonitoring(): void {
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    let lastUpdate = 0;
    const throttledUpdate = (): void => {
      const now = Date.now();
      if (now - lastUpdate > SessionService.ACTIVITY_UPDATE_INTERVAL) {
        this.updateActivity();
        lastUpdate = now;
      }
    };
    activityEvents.forEach((event) => {
      document.addEventListener(event, throttledUpdate, { passive: true });
    });
  }

  /**
   * Clear all timers
   */
  private clearTimers(): void {
    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
      this.activityTimer = null;
    }

    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
  }
}
