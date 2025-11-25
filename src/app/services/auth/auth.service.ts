import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, of, throwError } from 'rxjs';
import type { Observable } from 'rxjs';
import { tap, catchError, map, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { CsrfService } from './csrf.service';
import { JwtService } from './jwt.service';
import { UserProfileService } from './user-profile.service';
import type { AuthResponse } from '../../models/auth/auth-response.type';
import type { DecodedJwtToken } from '../../models/auth/decoded-jwt-token.type';
import type { LoginRequest } from '../../models/auth/login-request.type';
import type { LogoutResponse } from '../../models/auth/logout-response.type';
import type { RegisterRequest } from '../../models/auth/register-request.type';
import type { UserProfile } from '../../models/user-profile.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private static readonly HTTP_UNAUTHORIZED = 401;

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly csrfService = inject(CsrfService);
  private readonly jwtService = inject(JwtService);
  private readonly userProfileService = inject(UserProfileService);

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
   */
  public initialize(): Observable<boolean> {
    return this.csrfService.initialize().pipe(
      switchMap(() => {
        return this.jwtService.initialize();
      }),
      tap((isAuthenticated) => {
        this.isAuthenticatedSubject.next(isAuthenticated);
      }),
      switchMap((isAuthenticated) => {
        if (isAuthenticated) {
          return this.userProfileService.fetchProfile().pipe(
            map(() => isAuthenticated),
            catchError((error) => {
              if (error.status === AuthService.HTTP_UNAUTHORIZED) {
                this.isAuthenticatedSubject.next(false);
                this.clearAuthenticationState();
                return of(false);
              }
              return of(isAuthenticated);
            }),
          );
        }
        return of(false);
      }),
      tap(() => {
        this.isInitializedSubject.next(true);
      }),
      catchError(() => {
        this.isAuthenticatedSubject.next(false);
        this.isInitializedSubject.next(true);
        return of(false);
      }),
    );
  }

  /**
   * Register new user account
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
      switchMap((response) => {
        return this.userProfileService.fetchProfile().pipe(
          map(() => response),
          catchError(() => {
            return of(response);
          }),
        );
      }),
      catchError((error) => {
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
      switchMap((response) => {
        return this.userProfileService.fetchProfile().pipe(
          map(() => response),
          catchError(() => {
            return of(response);
          }),
        );
      }),
      catchError((error) => {
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
        void this.router.navigate(['/']);
      }),
      map((response) => response.success),
      catchError(() => {
        this.clearAuthenticationState();
        return of(true);
      }),
    );
  }

  /**
   * Force logout (clear local state and redirect)
   */
  public forceLogout(): void {
    this.clearAuthenticationState();
    void this.router.navigate(['/']);
  }

  /**
   * Get valid access token (refresh if needed)
   */
  public getValidAccessToken(): Observable<string> {
    return this.jwtService.getValidAccessToken().pipe(
      catchError((error) => {
        this.forceLogout();
        return throwError(() => error);
      }),
    );
  }

  /**
   * Refresh user profile manually
   */
  public refreshUserProfile(): Observable<UserProfile> {
    return this.userProfileService.fetchProfile();
  }

  /**
   * Clear all authentication state
   */
  private clearAuthenticationState(): void {
    this.jwtService.clearTokens();
    this.csrfService.clearToken();
    this.userProfileService.clearProfile();
    this.isAuthenticatedSubject.next(false);
  }
}
