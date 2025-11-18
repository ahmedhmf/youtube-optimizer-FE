import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

type CsrfTokenResponse = {
  csrfToken: string;
};

@Injectable({
  providedIn: 'root',
})
export class CsrfTokenService {
  private readonly httpClient = inject(HttpClient);

  // In-memory CSRF token storage for security
  private csrfToken: string | null = null;
  private readonly csrfTokenSubject = new BehaviorSubject<string | null>(null);
  private fetchingToken = false;

  /**
   * Get the current CSRF token from memory
   */
  public getCsrfToken(): string | null {
    return this.csrfToken;
  }

  /**
   * Observable for CSRF token changes
   */
  public get csrfToken$(): Observable<string | null> {
    return this.csrfTokenSubject.asObservable();
  }

  /**
   * Fetch a fresh CSRF token from the backend
   */
  public fetchCsrfToken(): Observable<string> {
    if (this.fetchingToken) {
      // Wait for ongoing fetch to complete
      return this.csrfTokenSubject.pipe(
        map((token) => {
          if (!token) {
            throw new Error('Failed to fetch CSRF token');
          }
          return token;
        }),
      );
    }

    this.fetchingToken = true;
    console.warn('🛡️ Fetching fresh CSRF token from:', `${environment.backendURL}/auth/csrf-token`);
    console.warn('🍪 Including cookies with CSRF request (withCredentials: true)');

    return this.httpClient
      .get<CsrfTokenResponse>(`${environment.backendURL}/auth/csrf-token`, {
        withCredentials: true, // This is equivalent to credentials: 'include' in fetch API
      })
      .pipe(
        tap((response) => {
          console.warn('🛡️ CSRF token response received:', response);
          if (response.csrfToken) {
            this.setCsrfToken(response.csrfToken);
            const TOKEN_PREVIEW_LENGTH = 10;
            console.warn(
              '🛡️ CSRF token set successfully:',
              response.csrfToken.substring(0, TOKEN_PREVIEW_LENGTH) + '...',
            );
          } else {
            console.error('❌ Invalid CSRF token response format:', response);
            throw new Error('Invalid CSRF token response format');
          }
          this.fetchingToken = false;
        }),
        map((response) => response.csrfToken),
        catchError((error) => {
          this.fetchingToken = false;
          console.error('❌ Failed to fetch CSRF token:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            url: error.url,
            error: error.error,
          });
          return throwError(() => error);
        }),
      );
  }

  /**
   * Set the CSRF token in memory
   */
  public setCsrfToken(token: string): void {
    this.csrfToken = token;
    this.csrfTokenSubject.next(token);
  }

  /**
   * Clear the CSRF token (e.g., on logout)
   */
  public clearCsrfToken(): void {
    this.csrfToken = null;
    this.csrfTokenSubject.next(null);
    console.warn('🛡️ CSRF token cleared');
  }

  /**
   * Get CSRF token, fetching if not available
   */
  public ensureCsrfToken(): Observable<string> {
    if (this.csrfToken) {
      console.warn('🛡️ Using cached CSRF token');
      return new Observable((subscriber) => {
        if (this.csrfToken) {
          subscriber.next(this.csrfToken);
        }
        subscriber.complete();
      });
    }

    return this.fetchCsrfToken();
  }

  /**
   * Check if we need a CSRF token for this request
   */
  public needsCsrfToken(method: string, url: string): boolean {
    // Allow bypassing CSRF in development if backend doesn't support it yet
    // Uncomment the following lines to temporarily disable CSRF in development:
    // if (!environment.production) {
    //   console.warn('⚠️ CSRF protection disabled in development');
    //   return false;
    // }

    const protectedMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
    const isProtectedMethod = protectedMethods.includes(method.toUpperCase());

    // Skip CSRF for certain endpoints that don't need it
    const skipCsrfEndpoints = [
      '/auth/csrf-token',
      '/auth/refresh',
      '/auth/logout',
      '/auth/social/',
    ];

    const skipCsrf = skipCsrfEndpoints.some((endpoint) => url.includes(endpoint));

    return isProtectedMethod && !skipCsrf;
  }

  /**
   * Refresh CSRF token (force fetch new one)
   */
  public refreshCsrfToken(): Observable<string> {
    this.clearCsrfToken();
    return this.fetchCsrfToken();
  }

  /**
   * Pre-fetch CSRF token for login/register operations
   * This ensures we have a token ready before attempting authentication
   */
  public prepareCsrfForAuth(): Observable<string | null> {
    if (this.csrfToken) {
      console.warn('🛡️ CSRF token already available for auth');
      return new Observable((subscriber) => {
        subscriber.next(this.csrfToken);
        subscriber.complete();
      });
    }

    console.warn('🛡️ Pre-fetching CSRF token for authentication');
    return this.tryGetCsrfToken();
  }

  /**
   * Check what cookies are available (for debugging)
   */
  public debugCookieStatus(): void {
    console.warn('🍪 Current document cookies:', document.cookie || 'No cookies found');
    console.warn('🍪 Cookie info:');
    console.warn('  - httpOnly cookies are not visible here (they are sent automatically)');
    console.warn('  - Session cookies should be sent with withCredentials: true');
    console.warn('  - Check Network tab to see actual cookies sent with requests');
  }

  /**
   * Test if CSRF endpoint is accessible
   */
  public testCsrfEndpoint(): Observable<boolean> {
    console.warn('🔍 Testing CSRF endpoint connectivity...');
    console.warn('🍪 Test request will include cookies (withCredentials: true)');

    return this.httpClient
      .get<CsrfTokenResponse>(`${environment.backendURL}/auth/csrf-token`, {
        withCredentials: true, // Sends session cookies with request
      })
      .pipe(
        map((response) => {
          console.warn('✅ CSRF endpoint test successful:', response);
          return true;
        }),
        catchError((error) => {
          console.error('❌ CSRF endpoint test failed:', {
            status: error.status,
            statusText: error.statusText,
            url: error.url,
          });
          return new Observable<boolean>((subscriber) => {
            subscriber.next(false);
            subscriber.complete();
          });
        }),
      );
  }

  /**
   * Try to get CSRF token, but don't fail if not available
   */
  public tryGetCsrfToken(): Observable<string | null> {
    if (this.csrfToken) {
      return new Observable((subscriber) => {
        subscriber.next(this.csrfToken);
        subscriber.complete();
      });
    }

    // For login/register requests, we need to fetch CSRF token without session
    return this.httpClient
      .get<CsrfTokenResponse>(`${environment.backendURL}/auth/csrf-token`, {
        withCredentials: true, // Send any existing cookies but don't require authentication
      })
      .pipe(
        tap((response) => {
          this.setCsrfToken(response.csrfToken);
          console.warn('🛡️ CSRF token fetched successfully');
        }),
        map((response) => response.csrfToken),
        catchError((error) => {
          const UNAUTHORIZED_STATUS = 401;
          const FORBIDDEN_STATUS = 403;
          if (error.status === UNAUTHORIZED_STATUS || error.status === FORBIDDEN_STATUS) {
            // Authentication required for CSRF token - this shouldn't happen for login flows
            console.error('❌ CSRF token requires authentication - backend misconfiguration?', {
              status: error.status,
              url: error.url,
            });
          } else {
            console.warn('⚠️ CSRF endpoint not available, continuing without CSRF:', {
              status: error.status,
              message: error.message,
              url: error.url,
            });
          }
          return new Observable<null>((subscriber) => {
            subscriber.next(null);
            subscriber.complete();
          });
        }),
      );
  }

  /**
   * Comprehensive debug method to test CSRF and cookie setup
   */
  public debugCsrfSetup(): void {
    console.warn('🔍 === CSRF Setup Debug ===');

    this.debugCookieStatus();

    console.warn('🛡️ Testing CSRF endpoint...');
    this.testCsrfEndpoint().subscribe({
      next: (success) => {
        if (success) {
          console.warn('✅ CSRF endpoint is working');
          const TOKEN_PREVIEW_LENGTH = 10;
          console.warn(
            '🛡️ Current CSRF token:',
            this.csrfToken ? this.csrfToken.substring(0, TOKEN_PREVIEW_LENGTH) + '...' : 'None',
          );
        } else {
          console.error('❌ CSRF endpoint failed');
        }
      },
      error: (error) => {
        console.error('❌ CSRF setup test error:', error);
      },
      complete: () => {
        console.warn('🔍 === CSRF Debug Complete ===');
      },
    });
  }
}
