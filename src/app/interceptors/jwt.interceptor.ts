import { inject } from '@angular/core';
import type { HttpInterceptorFn } from '@angular/common/http';
import { switchMap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

/**
 * 🔐 JWT Authorization Interceptor
 *
 * Automatically adds JWT access tokens to authenticated requests
 * - Intercepts all outgoing HTTP requests
 * - Adds Authorization header with Bearer token
 * - Handles token refresh for expired tokens
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
      return next(authenticatedRequest);
    }),
    catchError((error) => {
      // Handle authentication errors
      if (error.status === HTTP_UNAUTHORIZED || error.status === HTTP_FORBIDDEN) {
        console.warn('🔐 JWT: Authentication failed, forcing logout...');
        authService.forceLogout('Authentication failed');
      }

      return throwError(() => error);
    }),
  );
};

/**
 * Check if JWT should be skipped for this URL
 */
function shouldSkipJwt(url: string): boolean {
  const skipEndpoints = [
    '/auth/login',
    '/auth/register',
    '/auth/refresh', // Refresh uses session cookies, not JWT
    '/csrf/token',
    '/public/',
    '/login', // Frontend login route
    '/register', // Frontend register route
  ];

  return skipEndpoints.some((endpoint) => url.includes(endpoint));
}
