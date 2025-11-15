import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, timer, EMPTY } from 'rxjs';
import type { Observable } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { JwtTokenService } from './jwt-token.service';
import { environment } from '../../environments/environment';

export type TokenResponse = {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
};

@Injectable({ providedIn: 'root' })
export class JwtTokenRefreshService {
  public refreshInProgress$;

  private readonly httpClient = inject(HttpClient);
  private readonly jwtTokenService = inject(JwtTokenService);
  private readonly refreshInProgress = new BehaviorSubject<boolean>(false);
  private readonly REFRESH_INTERVAL_MS = 60000; // Check every minute

  constructor() {
    this.refreshInProgress$ = this.refreshInProgress.asObservable();
    this.startTokenRefreshTimer();
  }

  /**
   * Refresh the access token using refresh token
   */
  public refreshToken(): Observable<TokenResponse> {
    const refreshToken = this.jwtTokenService.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    this.refreshInProgress.next(true);

    return this.httpClient
      .post<TokenResponse>(`${environment.backendURL}/auth/refresh`, {
        refreshToken,
      })
      .pipe(
        tap((response) => {
          // Store new tokens
          this.jwtTokenService.setTokens(response.accessToken, response.refreshToken);
        }),
        catchError((error) => {
          // If refresh fails, clear tokens and logout
          this.jwtTokenService.clearTokens();
          throw error;
        }),
        tap({
          finalize: () => {
            this.refreshInProgress.next(false);
          },
        }),
      );
  }

  /**
   * Check if token needs refresh and refresh if necessary
   */
  public checkAndRefreshToken(): Observable<TokenResponse | null> {
    if (!this.jwtTokenService.isAuthenticated()) {
      return EMPTY;
    }

    if (this.jwtTokenService.shouldRefreshToken() && !this.refreshInProgress.value) {
      return this.refreshToken().pipe(
        catchError((error) => {
          console.error('Token refresh failed:', error);
          return EMPTY;
        }),
      );
    }

    return EMPTY;
  }

  /**
   * Force refresh token (useful for manual refresh)
   */
  public forceRefreshToken(): Observable<TokenResponse> {
    return this.refreshToken();
  }

  /**
   * Stop the refresh process (useful for logout)
   */
  public stopRefreshTimer(): void {
    this.refreshInProgress.next(false);
  }

  /**
   * Check if refresh is currently in progress
   */
  public isRefreshInProgress(): boolean {
    return this.refreshInProgress.value;
  }

  /**
   * Start automatic token refresh timer
   */
  private startTokenRefreshTimer(): void {
    timer(0, this.REFRESH_INTERVAL_MS)
      .pipe(switchMap(() => this.checkAndRefreshToken()))
      .subscribe({
        next: (response) => {
          if (response) {
            // Token refreshed automatically - no console.log needed
          }
        },
        error: (error) => {
          console.error('Automatic token refresh error:', error);
        },
      });
  }
}
