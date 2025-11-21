import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, of, throwError } from 'rxjs';
import type { Observable } from 'rxjs';
import { tap, catchError, map, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { CsrfService } from './csrf.service';
import { JwtService } from './jwt.service';
import type { AuthResponse } from '../../models/auth/auth-response.type';
import type { DecodedJwtToken } from '../../models/auth/decoded-jwt-token.type';
import type { LoginRequest } from '../../models/auth/login-request.type';
import type { LogoutResponse } from '../../models/auth/logout-response.type';
import type { RegisterRequest } from '../../models/auth/register-request.type';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly csrfService = inject(CsrfService);
  private readonly jwtService = inject(JwtService);

  private readonly isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private readonly isInitializedSubject = new BehaviorSubject<boolean>(false);

  /**
   * Get authentication status as observable
   */
  public getAuthenticationStatus(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  /**
   * Get initialization status as observable
   */
  public getInitializationStatus(): Observable<boolean> {
    return this.isInitializedSubject.asObservable();
  }

  /**
   * Check if user is currently authenticated
   */
  public isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Check if auth service is initialized
   */
  public isInitialized(): boolean {
    return this.isInitializedSubject.value;
  }

  /**
   * Get current user information
   */
  public getCurrentUser(): Observable<DecodedJwtToken | null> {
    return this.jwtService.getUserInfoObservable();
  }

  /**
   * Check if user has specific role
   */
  public hasRole(role: string): boolean {
    return this.jwtService.hasRole(role);
  }

  /**
   * Check if user has any of the specified roles
   */
  public hasAnyRole(roles: string[]): boolean {
    return this.jwtService.hasAnyRole(roles);
  }

  /**
   * Check if user has all specified roles
   */
  public hasAllRoles(roles: string[]): boolean {
    return this.jwtService.hasAllRoles(roles);
  }

  /**
   * Initialize authentication service
   * Phase 1: Initialize CSRF + Phase 4: Restore session if valid
   */
  public initialize(): Observable<boolean> {
    return this.csrfService.initialize().pipe(
      switchMap(() => {
        // Try to restore JWT session
        return this.jwtService.initialize();
      }),
      tap((isAuthenticated) => {
        this.isAuthenticatedSubject.next(isAuthenticated);
        this.isInitializedSubject.next(true);
      }),
      catchError((error) => {
        console.error('❌ Auth: Initialization failed:', error);
        this.isAuthenticatedSubject.next(false);
        this.isInitializedSubject.next(true);
        return of(false);
      }),
    );
  }

  /**
   * Register new user account
   * Phase 2: Registration with CSRF protection
   */
  public register(registerData: RegisterRequest): Observable<AuthResponse> {
    return this.csrfService.getToken().pipe(
      switchMap((csrfToken) => {
        const headers = {
          'X-CSRF-Token': csrfToken,
        };

        return this.http.post<AuthResponse>(
          `${environment.backendURL}/auth/register`,
          registerData,
          {
            headers,
            withCredentials: true,
          },
        );
      }),
      tap((response) => {
        if (response.accessToken) {
          this.jwtService.storeTokens(
            response.accessToken,
            response.expiresIn,
            response.refreshToken,
          );
          this.isAuthenticatedSubject.next(true);
        }
      }),
      catchError((error) => {
        console.error('❌ Auth: Registration failed:', error);
        return throwError(() => new Error(`Registration failed: ${error.message}`));
      }),
    );
  }

  /**
   * Login user with email and password
   */
  public login(loginData: LoginRequest): Observable<AuthResponse> {
    return this.csrfService.getToken().pipe(
      switchMap((csrfToken) => {
        const headers = {
          'X-CSRF-Token': csrfToken,
        };

        return this.http.post<AuthResponse>(`${environment.backendURL}/auth/login`, loginData, {
          headers,
          withCredentials: true,
        });
      }),
      tap((response) => {
        if (response.accessToken) {
          this.jwtService.storeTokens(
            response.accessToken,
            response.expiresIn,
            response.refreshToken,
          );
          this.isAuthenticatedSubject.next(true);
        }
      }),
      catchError((error) => {
        console.error('❌ Auth: Login failed:', error);
        return throwError(() => new Error(`Login failed: ${error.message}`));
      }),
    );
  }

  /**
   * Logout current user
   */
  public logout(): Observable<boolean> {
    return this.csrfService.getToken().pipe(
      switchMap((csrfToken) => {
        const headers = {
          'X-CSRF-Token': csrfToken,
        };

        return this.http.post<LogoutResponse>(
          `${environment.backendURL}/auth/logout`,
          {},
          {
            headers,
            withCredentials: true,
          },
        );
      }),
      tap(() => {
        this.clearAuthenticationState();
      }),
      map((response) => response.success),
      catchError((error) => {
        console.error('❌ Auth: Logout request failed:', error);
        // Clear local state even if server request fails
        this.clearAuthenticationState();
        return of(true); // Return success to continue logout flow
      }),
    );
  }

  /**
   * Force logout (clear local state and redirect)
   */
  public forceLogout(reason = 'Session expired'): void {
    console.warn(`🚪 Auth: Force logout - ${reason}`);
    this.clearAuthenticationState();
    this.router.navigate(['/login']).catch(console.error);
  }

  /**
   * Get valid access token (refresh if needed)
   */
  public getValidAccessToken(): Observable<string> {
    return this.jwtService.getValidAccessToken().pipe(
      catchError((error) => {
        console.error('❌ Auth: Token refresh failed, forcing logout:', error);
        this.forceLogout('Token refresh failed');
        return throwError(() => error);
      }),
    );
  }

  /**
   * Clear all authentication state
   */
  private clearAuthenticationState(): void {
    this.jwtService.clearTokens();
    this.csrfService.clearToken();
    this.isAuthenticatedSubject.next(false);
  }
}
