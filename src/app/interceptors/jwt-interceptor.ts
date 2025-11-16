/* eslint-disable @typescript-eslint/no-floating-promises */
import { inject } from '@angular/core';
import type {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { throwError } from 'rxjs';
import type { Observable } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { JwtTokenService } from '../services/jwt-token.service';
import { JwtTokenRefreshService } from '../services/jwt-token-refresh.service';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

export const jwtInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const jwtTokenService = inject(JwtTokenService);
  const tokenRefreshService = inject(JwtTokenRefreshService);
  const router = inject(Router);

  // Skip interceptor for non-API requests
  if (!req.url.startsWith(environment.backendURL)) {
    return next(req);
  }

  console.warn('🌐 JWT Interceptor processing:', req.method, req.url);

  // Skip interceptor for auth endpoints to avoid infinite loops
  if (
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/refresh')
  ) {
    return next(req);
  }

  const token = jwtTokenService.getAccessToken();

  // If no token, proceed without authorization header
  if (!token) {
    console.warn('⚠️ No JWT token found for request:', req.url);
    return next(req);
  }

  // Debug: Check if token is expired
  if (jwtTokenService.isTokenExpired(token)) {
    console.warn('⚠️ JWT token is expired for request:', req.url);
  }

  // Add authorization header
  const authReq = addAuthHeader(req, token);

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const UNAUTHORIZED_STATUS = 401;
      const FORBIDDEN_STATUS = 403;
      // Handle 401 Unauthorized errors
      if (error.status === UNAUTHORIZED_STATUS) {
        return handle401Error({
          req: authReq,
          next,
          jwtTokenService,
          tokenRefreshService,
        });
      } else if (error.status === FORBIDDEN_STATUS) {
        // Role/permission denied
        router.navigate(['/unauthorized']);
      }
      return throwError(() => error);
    }),
  );
};

/**
 * Add authorization header to request
 */
function addAuthHeader(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  const authHeader = `Bearer ${token}`;
  const PREVIEW_LENGTH = 30;
  console.warn('🔑 Adding Authorization header:', authHeader.substring(0, PREVIEW_LENGTH) + '...');

  return req.clone({
    setHeaders: {
      Authorization: authHeader,
    },
  });
}

type Handle401ErrorParams = {
  req: HttpRequest<unknown>;
  next: HttpHandlerFn;
  jwtTokenService: JwtTokenService;
  tokenRefreshService: JwtTokenRefreshService;
};

/**
 * Handle 401 errors by attempting token refresh
 */
function handle401Error({
  req,
  next,
  jwtTokenService,
  tokenRefreshService,
}: Handle401ErrorParams): Observable<HttpEvent<unknown>> {
  // If refresh is already in progress, wait for it to complete
  if (tokenRefreshService.isRefreshInProgress()) {
    return tokenRefreshService.refreshInProgress$.pipe(
      filter((inProgress) => !inProgress),
      take(1),
      switchMap(() => {
        const newToken = jwtTokenService.getAccessToken();
        if (newToken) {
          const newAuthReq = addAuthHeader(req, newToken);
          return next(newAuthReq);
        } else {
          // Token refresh failed, logout user
          jwtTokenService.clearTokens();
          return throwError(() => new Error('Authentication failed'));
        }
      }),
    );
  }

  // Attempt to refresh token
  return tokenRefreshService.forceRefreshToken().pipe(
    switchMap((tokenResponse) => {
      // Retry original request with new token
      const newAuthReq = addAuthHeader(req, tokenResponse.accessToken);
      return next(newAuthReq);
    }),
    catchError((refreshError) => {
      // Refresh failed, clear tokens and logout
      jwtTokenService.clearTokens();
      return throwError(() => refreshError);
    }),
  );
}
