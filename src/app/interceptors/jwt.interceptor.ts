import { inject } from '@angular/core';
import type { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpEvent } from '@angular/common/http';
import { switchMap, catchError } from 'rxjs/operators';
import { throwError, from } from 'rxjs';
import type { Observable } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

/**
 * 🔐 JWT Authorization Interceptor
 *
 * Automatically adds JWT access tokens to authenticated requests
 * - Intercepts all outgoing HTTP requests
 * - Adds Authorization header with Bearer token
 * - Handles token refresh for expired tokens (401 errors)
 * - Manages authentication failures and logout
 */
export const jwtInterceptor: HttpInterceptorFn = (request, next) => {
  const HTTP_UNAUTHORIZED = 401;
  const HTTP_FORBIDDEN = 403;

  const authService = inject(AuthService);

  // Skip JWT for auth endpoints (login, register, csrf)
  if (shouldSkipJwt(request.url)) {
    return next(request);
  }

  // Only add JWT if user is authenticated
  if (!authService.isAuthenticated()) {
    return next(request);
  }

  // Get valid access token and add to request
  return authService.getValidAccessToken().pipe(
    switchMap((accessToken) => {
      const authenticatedRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      return next(authenticatedRequest).pipe(
        catchError((error: HttpErrorResponse) => {
          // Handle 401 errors by attempting token refresh
          if (error.status === HTTP_UNAUTHORIZED && !request.url.includes('/auth/refresh')) {
            return handleTokenRefresh(request, next, authService);
          }

          if (error.status === HTTP_FORBIDDEN) {
            authService.forceLogout();
          }

          return throwError(() => error);
        }),
      );
    }),
    catchError((error) => {
      // Initial token fetch failed
      authService.forceLogout();
      return throwError(() => error);
    }),
  );
};

/**
 * Handle token refresh and retry original request
 */
function handleTokenRefresh(
  request: HttpRequest<unknown>,
  next: Parameters<HttpInterceptorFn>[1],
  authService: AuthService,
): Observable<HttpEvent<unknown>> {
  return from(authService.getValidAccessToken()).pipe(
    switchMap((newAccessToken) => {
      // Retry original request with new token
      const retryRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${newAccessToken}`,
        },
      });
      return next(retryRequest);
    }),
    catchError((refreshError) => {
      // Refresh failed - logout user
      authService.forceLogout();
      return throwError(() => refreshError);
    }),
  );
}

/**
 * Check if JWT should be skipped for this URL
 */
function shouldSkipJwt(url: string): boolean {
  const skipEndpoints = [
    '/auth/login',
    '/auth/register',
    '/auth/refresh',
    '/auth/csrf-token',
    '/csrf/token',
    '/public/',
    '/login',
    '/register',
  ];

  return skipEndpoints.some((endpoint) => url.includes(endpoint));
}
