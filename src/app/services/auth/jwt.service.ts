import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, of, throwError } from 'rxjs';
import type { Observable } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import type { DecodedJwtToken } from '../../models/auth/decoded-jwt-token.type';
import type { JwtRefreshResponse } from '../../models/auth/jwt-refresh-response.type';

@Injectable({
  providedIn: 'root',
})
export class JwtService {
  private static readonly MILLISECONDS_TO_SECONDS = 1000;
  private static readonly JWT_PARTS_COUNT = 3;
  private static readonly TOKEN_BUFFER_TIME_SECONDS = 300;
  private static readonly HTTP_BAD_REQUEST = 400;
  private static readonly HTTP_UNAUTHORIZED = 401;

  private readonly http = inject(HttpClient);

  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpirationTime: number | null = null;
  private readonly accessTokenSubject = new BehaviorSubject<string | null>(null);
  private readonly userInfoSubject = new BehaviorSubject<DecodedJwtToken | null>(null);
  private refreshRequest$: Observable<string> | null = null;

  /**
   * Get current user info as observable
   */
  public getUserInfoObservable(): Observable<DecodedJwtToken | null> {
    return this.userInfoSubject.asObservable();
  }

  /**
   * Get current user info directly
   */
  public getCurrentUserInfo(): DecodedJwtToken | null {
    return this.userInfoSubject.value;
  }

  /**
   * Clear all JWT tokens
   */
  public clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpirationTime = null;
    this.accessTokenSubject.next(null);
    this.userInfoSubject.next(null);
    this.refreshRequest$ = null;
  }

  /**
   * Check if user has specific role
   */
  public hasRole(role: string): boolean {
    const userInfo = this.getCurrentUserInfo();
    return userInfo?.roles.includes(role) ?? false;
  }

  /**
   * Check if user has any of the specified roles
   */
  public hasAnyRole(roles: string[]): boolean {
    const userInfo = this.getCurrentUserInfo();
    if (!userInfo?.roles) {
      return false;
    }
    return roles.some((role) => userInfo.roles.includes(role));
  }

  /**
   * Check if user has all specified roles
   */
  public hasAllRoles(roles: string[]): boolean {
    const userInfo = this.getCurrentUserInfo();
    if (!userInfo?.roles) {
      return false;
    }
    return roles.every((role) => userInfo.roles.includes(role));
  }

  /**
   * Check if current access token is valid
   */
  public isTokenValid(): boolean {
    if (!this.accessToken || !this.tokenExpirationTime) {
      return false;
    }

    const currentTime = Math.floor(Date.now() / JwtService.MILLISECONDS_TO_SECONDS);
    return this.tokenExpirationTime > currentTime + JwtService.TOKEN_BUFFER_TIME_SECONDS;
  }

  /**
   * Get valid access token - refresh if needed
   */
  public getValidAccessToken(): Observable<string> {
    if (this.isTokenValid() && this.accessToken) {
      return of(this.accessToken);
    }
    return this.refreshAccessToken();
  }

  /**
   * Refresh access token using refresh token or session
   */
  public refreshAccessToken(): Observable<string> {
    if (this.refreshRequest$) {
      return this.refreshRequest$;
    }

    this.refreshRequest$ = this.http
      .post<JwtRefreshResponse>(
        `${environment.backendURL}/auth/refresh`,
        {},
        { withCredentials: true },
      )
      .pipe(
        tap((response) => {
          this.setAccessToken(response.accessToken, response.expiresIn);
        }),
        map((response) => response.accessToken),
        catchError((error) => {
          this.clearTokens();
          this.refreshRequest$ = null;
          return throwError(() => new Error(`Token refresh failed: ${error.message}`));
        }),
        tap(() => {
          this.refreshRequest$ = null;
        }),
      );

    return this.refreshRequest$;
  }

  /**
   * Store JWT tokens from login response
   */
  public storeTokens(accessToken: string, expiresIn: number, refreshToken: string): void {
    this.setAccessToken(accessToken, expiresIn);
    this.refreshToken = refreshToken;
  }

  /**
   * Initialize JWT service - attempt to restore session
   */
  public initialize(): Observable<boolean> {
    return this.refreshAccessToken().pipe(
      map(() => true),
      catchError(() => {
        this.clearTokens();
        return of(false);
      }),
    );
  }

  /**
   * Set access token and decode user info
   */
  private setAccessToken(token: string, expiresIn: number): void {
    this.accessToken = token;
    this.tokenExpirationTime =
      Math.floor(Date.now() / JwtService.MILLISECONDS_TO_SECONDS) + expiresIn;
    this.accessTokenSubject.next(token);
    try {
      const decoded = this.decodeJwtToken(token);
      this.userInfoSubject.next(decoded);
    } catch {
      this.userInfoSubject.next(null);
    }
  }

  /**
   * Decode JWT token to extract user information
   */
  private decodeJwtToken(token: string): DecodedJwtToken {
    try {
      const parts = token.split('.');
      if (parts.length !== JwtService.JWT_PARTS_COUNT) {
        throw new Error('Invalid JWT token format');
      }

      const payload = parts[1];
      const decoded = JSON.parse(atob(payload)) as DecodedJwtToken;

      return decoded;
    } catch (error) {
      throw new Error(`Failed to decode JWT token: ${error}`);
    }
  }
}
