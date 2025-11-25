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
    this.clearToken();

    this.tokenRequest$ = this.http
      .get<CsrfResponse>(`${environment.backendURL}/auth/csrf-token`, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => {
          this.setToken(response.csrfToken);
          this.tokenRequest$ = null;
        }),
        switchMap((response) => of(response.csrfToken)),
        catchError((error) => {
          this.tokenRequest$ = null;
          return throwError(() => error);
        }),
        shareReplay(1),
      );

    return this.tokenRequest$;
  }

  /**
   * Check if request needs CSRF protection
   */
  public needsCsrfProtection(method: string, url: string): boolean {
    const protectedMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
    const isProtectedMethod = protectedMethods.includes(method.toUpperCase());

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
    if (this.csrfToken) {
      return of(this.csrfToken);
    }

    if (this.tokenRequest$) {
      return this.tokenRequest$;
    }
    this.tokenRequest$ = this.http
      .get<CsrfResponse>(`${environment.backendURL}/auth/csrf-token`, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => {
          this.setToken(response.csrfToken);
          this.tokenRequest$ = null;
        }),
        switchMap((response) => of(response.csrfToken)),
        catchError((error) => {
          this.tokenRequest$ = null;
          return throwError(() => error);
        }),
        shareReplay(1),
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
