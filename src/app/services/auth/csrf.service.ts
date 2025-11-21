import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, of, throwError } from 'rxjs';
import type { Observable } from 'rxjs';
import { tap, catchError, switchMap, shareReplay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import type { CsrfResponse } from '../../models/auth/csrf-response.type';

@Injectable({
  providedIn: 'root',
})
export class CsrfService {
  private readonly http = inject(HttpClient);

  private csrfToken: string | null = null;
  private readonly csrfTokenSubject = new BehaviorSubject<string | null>(null);
  private tokenRequest$: Observable<string> | null = null; /**

  /**
   * Clear CSRF token (on logout or session invalidation)
   */
  public clearToken(): void {
    this.csrfToken = null;
    this.csrfTokenSubject.next(null);
    this.tokenRequest$ = null;
  }

  /**
   * Refresh CSRF token (get new one from server)
   */
  public refreshToken(): Observable<string> {
    // Clear current token first
    this.clearToken();

    // Use csrf-token endpoint for refreshing existing tokens
    this.tokenRequest$ = this.http
      .get<CsrfResponse>(`${environment.backendURL}/auth/csrf-token`, {
        withCredentials: true, // Include session cookies
      })
      .pipe(
        tap((response) => {
          this.setToken(response.csrfToken);
          this.tokenRequest$ = null; // Clear ongoing request
        }),
        switchMap((response) => of(response.csrfToken)),
        catchError((error) => {
          console.error('❌ CSRF: Token refresh failed:', {
            status: error.status ?? 'unknown',
            statusText: error.statusText ?? 'unknown',
            url: error.url ?? 'unknown',
          });
          this.tokenRequest$ = null; // Clear failed request
          return throwError(() => error);
        }),
        shareReplay(1), // Share result with multiple subscribers
      );

    return this.tokenRequest$;
  }

  /**
   * Check if request needs CSRF protection
   */
  public needsCsrfProtection(method: string, url: string): boolean {
    const protectedMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
    const isProtectedMethod = protectedMethods.includes(method.toUpperCase());

    // Skip CSRF for these endpoints
    const skipEndpoints = ['/csrf/token', '/auth/csrf-token', '/auth/csrf', '/api/csrf/token'];

    const shouldSkip = skipEndpoints.some((endpoint) => url.includes(endpoint));
    const needsProtection = isProtectedMethod && !shouldSkip;
    return needsProtection;
  }

  /**
   * Initialize CSRF on application start
   */
  public initialize(): Observable<string> {
    return this.getToken();
  }

  /**
   * Get CSRF token - fetch new one if not available
   */
  public getToken(): Observable<string> {
    // Return cached token if available
    if (this.csrfToken) {
      return of(this.csrfToken);
    }

    // Return ongoing request if already fetching
    if (this.tokenRequest$) {
      return this.tokenRequest$;
    }

    // Fetch new token from backend - use csrf-token endpoint
    this.tokenRequest$ = this.http
      .get<CsrfResponse>(`${environment.backendURL}/auth/csrf-token`, {
        withCredentials: true, // Include session cookies
      })
      .pipe(
        tap((response) => {
          this.setToken(response.csrfToken);
          this.tokenRequest$ = null; // Clear ongoing request
        }),
        switchMap((response) => of(response.csrfToken)),
        catchError((error) => {
          console.error('❌ CSRF: Token fetch failed:', {
            status: error.status ?? 'unknown',
            statusText: error.statusText ?? 'unknown',
            url: error.url ?? 'unknown',
          });
          this.tokenRequest$ = null; // Clear failed request
          return throwError(() => error);
        }),
        shareReplay(1), // Share result with multiple subscribers
      );

    return this.tokenRequest$;
  }

  /**
   * Set CSRF token
   */
  private setToken(token: string): void {
    this.csrfToken = token;
    this.csrfTokenSubject.next(token);
  }
}
