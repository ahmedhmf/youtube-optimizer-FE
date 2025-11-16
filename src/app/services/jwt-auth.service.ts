/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, throwError } from 'rxjs';
import type { Observable } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { JwtTokenService } from './jwt-token.service';
import { JwtTokenRefreshService } from './jwt-token-refresh.service';
import { SocialAuthService } from './social-auth.service';
import { environment } from '../../environments/environment';

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  name?: string;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  PREMIUM = 'premium',
}

export type User = {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  role: UserRole; // Add this field
  createdAt?: Date;
  updatedAt?: Date;
};

@Injectable({ providedIn: 'root' })
export class JwtAuthService {
  public currentUser$;

  private readonly httpClient = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly jwtTokenService = inject(JwtTokenService);
  private readonly tokenRefreshService = inject(JwtTokenRefreshService);
  private readonly socialAuthService = inject(SocialAuthService);
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);

  constructor() {
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.initializeAuthState();
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return this.jwtTokenService.isAuthenticated();
  }

  /**
   * Get current user
   */
  public getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get current user observable
   */
  public getCurrentUser$(): Observable<User | null> {
    return this.currentUser$;
  }

  /**
   * Check if current user has specific role
   */
  public hasRole(...roles: UserRole[]): boolean {
    const userRole = this.getCurrentUser()?.role;
    return userRole ? roles.includes(userRole) : false;
  }

  /**
   * Check if current user has any of the specified roles
   */
  public hasAnyRole(roles: string[]): boolean {
    const currentUser = this.getCurrentUser();
    return currentUser?.role ? roles.includes(currentUser.role) : false;
  }

  /**
   * Get user profile from server
   */
  public getUserProfile(): Observable<User> {
    return this.httpClient.get<User>(`${environment.backendURL}/auth/profile`).pipe(
      tap((user) => {
        this.currentUserSubject.next(user);
      }),
      catchError(this.handleAuthError.bind(this)),
    );
  }

  /**
   * Update user profile
   */
  public updateProfile(profileData: Partial<User>): Observable<User> {
    return this.httpClient.put<User>(`${environment.backendURL}/auth/profile`, profileData).pipe(
      tap((updatedUser) => {
        this.currentUserSubject.next(updatedUser);
      }),
      catchError(this.handleAuthError.bind(this)),
    );
  }

  /**
   * Change password
   */
  public changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.httpClient
      .post<any>(`${environment.backendURL}/auth/change-password`, {
        oldPassword,
        newPassword,
      })
      .pipe(catchError(this.handleAuthError.bind(this)));
  }

  /**
   * Request password reset
   */
  public requestPasswordReset(email: string): Observable<any> {
    return this.httpClient
      .post<any>(`${environment.backendURL}/auth/forgot-password`, { email })
      .pipe(catchError(this.handleAuthError.bind(this)));
  }

  /**
   * Reset password with token
   */
  public resetPassword(token: string, newPassword: string): Observable<any> {
    return this.httpClient
      .post(`${environment.backendURL}/auth/reset-password`, {
        token,
        newPassword,
      })
      .pipe(catchError(this.handleAuthError.bind(this)));
  }

  /**
   * Login user with email and password
   */
  public login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.httpClient
      .post<AuthResponse>(`${environment.backendURL}/auth/login`, credentials)
      .pipe(
        tap((response) => {
          // Store tokens
          this.jwtTokenService.setTokens(response.accessToken, response.refreshToken);
          // Update current user
          this.currentUserSubject.next(response.user);
        }),
        catchError(this.handleAuthError.bind(this)),
      );
  }

  /**
   * Register new user
   */
  public register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.httpClient
      .post<AuthResponse>(`${environment.backendURL}/auth/register`, userData)
      .pipe(
        tap((response) => {
          // Store tokens
          this.jwtTokenService.setTokens(response.accessToken, response.refreshToken);
          // Update current user
          this.currentUserSubject.next(response.user);
        }),
        catchError(this.handleAuthError.bind(this)),
      );
  }

  /**
   * Logout user
   */
  public logout(): Observable<any> {
    return this.httpClient.post<any>(`${environment.backendURL}/auth/logout`, {}).pipe(
      tap(() => {
        this.performLogout();
      }),
      catchError(() => {
        // Even if logout API fails, clear local tokens
        this.performLogout();
        return throwError(() => new Error('Logout failed'));
      }),
    );
  }

  public hasPermission(permission: string): boolean {
    const role = this.getCurrentUser()?.role;
    if (!role) {
      return false;
    }

    // Define permissions based on role
    const permissions = this.getRolePermissions(role);
    return permissions[permission] || false;
  }

  // Social authentication methods

  /**
   * Sign in with Google
   */
  public signInWithGoogle(credentialToken: string): Observable<User> {
    return this.socialAuthService.signInWithGoogle(credentialToken).pipe(
      tap((response: any) => {
        // Convert SocialAuthResponse to AuthResponse
        const authResponse: AuthResponse = {
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          user: {
            ...response.user,
            role: UserRole.USER, // Default role for social login users
          },
        };
        this.handleAuthSuccess(authResponse);
      }),
      map((response: any) => ({
        ...response.user,
        role: UserRole.USER,
      })),
      catchError(this.handleAuthError.bind(this)),
    );
  }

  /**
   * Sign in with GitHub
   */
  public signInWithGitHub(): Observable<User> {
    return this.socialAuthService.signInWithGitHub().pipe(
      tap((response: any) => {
        // Convert SocialAuthResponse to AuthResponse
        const authResponse: AuthResponse = {
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          user: {
            ...response.user,
            role: UserRole.USER, // Default role for social login users
          },
        };
        this.handleAuthSuccess(authResponse);
      }),
      map((response: any) => ({
        ...response.user,
        role: UserRole.USER,
      })),
      catchError(this.handleAuthError.bind(this)),
    );
  }

  /**
   * Initialize Google One-Tap sign-in
   */
  public async initializeGoogleOneTap(): Promise<void> {
    const callback = (response: any): void => {
      this.signInWithGoogle(response.credential).subscribe({
        next: () => {
          console.log('Google One-Tap sign-in successful');
        },
        error: (error) => {
          console.error('Google One-Tap sign-in failed:', error);
        },
      });
    };

    await this.socialAuthService.initializeGoogleOneTap(callback);
  }

  /**
   * Show Google One-Tap prompt
   */
  public showGoogleOneTap(): void {
    this.socialAuthService.showGoogleOneTap();
  }

  /**
   * Render Google Sign-In button
   */
  public async renderGoogleButton(element: HTMLElement): Promise<void> {
    const callback = (response: any): void => {
      this.signInWithGoogle(response.credential).subscribe({
        next: () => {
          console.log('Google sign-in successful');
        },
        error: (error) => {
          console.error('Google sign-in failed:', error);
        },
      });
    };

    await this.socialAuthService.renderGoogleButton(element, callback);
  }

  /**
   * Check if social login is available
   */
  public isSocialLoginAvailable(): boolean {
    return this.socialAuthService.isSocialLoginAvailable();
  }

  /**
   * Get available social providers
   */
  public getAvailableProviders(): string[] {
    return this.socialAuthService.getAvailableProviders();
  }

  /**
   * Handle successful authentication from any source
   */
  private async handleAuthSuccess(response: AuthResponse): Promise<void> {
    // Store tokens
    this.jwtTokenService.setTokens(response.accessToken, response.refreshToken);

    // Set current user
    this.currentUserSubject.next(response.user);

    // Token refresh is automatically started in the constructor
    await this.router.navigate(['/dashboard']);
  }

  private getRolePermissions(role: UserRole): Record<string, boolean> {
    const permissionMap = {
      [UserRole.USER]: {
        canAccessAdminPanel: false,
        canManageUsers: false,
        canDeleteAnyContent: false,
        canViewAllJobs: false,
        canUsePremiumFeatures: false,
      },
      [UserRole.PREMIUM]: {
        canAccessAdminPanel: false,
        canManageUsers: false,
        canDeleteAnyContent: false,
        canViewAllJobs: false,
        canUsePremiumFeatures: true,
      },
      [UserRole.MODERATOR]: {
        canAccessAdminPanel: true,
        canManageUsers: false,
        canDeleteAnyContent: true,
        canViewAllJobs: true,
        canUsePremiumFeatures: true,
      },
      [UserRole.ADMIN]: {
        canAccessAdminPanel: true,
        canManageUsers: true,
        canDeleteAnyContent: true,
        canViewAllJobs: true,
        canUsePremiumFeatures: true,
      },
    };
    return permissionMap[role];
  }

  /**
   * Perform local logout operations
   */
  private performLogout(): void {
    this.jwtTokenService.clearTokens();
    this.tokenRefreshService.stopRefreshTimer();
    this.currentUserSubject.next(null);
    void this.router.navigate(['/login']);
  }

  /**
   * Initialize authentication state from stored tokens
   */
  private initializeAuthState(): void {
    if (this.jwtTokenService.isAuthenticated()) {
      const tokenInfo = this.jwtTokenService.getTokenInfo();
      if (tokenInfo) {
        const user: User = {
          id: tokenInfo.sub,
          email: tokenInfo.email ?? '',
          name: this.extractStringFromToken(tokenInfo, 'name'),
          role: tokenInfo.role as UserRole,
        };
        this.currentUserSubject.next(user);
      }
    }
  }

  /**
   * Safely extract string values from token
   */
  private extractStringFromToken(tokenInfo: any, key: string): string | undefined {
    const value = tokenInfo[key];
    return typeof value === 'string' ? value : undefined;
  }

  /**
   * Handle authentication errors
   */
  private handleAuthError(error: HttpErrorResponse): Observable<never> {
    const UNAUTHORIZED_STATUS = 401;
    const FORBIDDEN_STATUS = 403;

    if (error.status === UNAUTHORIZED_STATUS || error.status === FORBIDDEN_STATUS) {
      // Clear tokens and redirect to login
      this.performLogout();
    }

    return throwError(() => error);
  }
}
