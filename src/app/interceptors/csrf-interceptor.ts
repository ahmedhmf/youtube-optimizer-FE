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
import { catchError, switchMap } from 'rxjs/operators';
import { CsrfTokenService } from '../services/csrf-token.service';
import { environment } from '../../environments/environment';

export const csrfInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const csrfTokenService = inject(CsrfTokenService);

  if (!req.url.startsWith(environment.backendURL)) {
    return next(req);
  }

  // Check if this request needs CSRF protection
  if (!csrfTokenService.needsCsrfToken(req.method, req.url)) {
    console.warn('🛡️ CSRF Interceptor skipping (no CSRF needed):', req.method, req.url);
    return next(req);
  }

  console.warn('🛡️ CSRF Interceptor processing:', req.method, req.url);

  // Get CSRF token for all protected requests
  return csrfTokenService.ensureCsrfToken().pipe(
    switchMap((csrfToken) => {
      // Clone request with CSRF token header
      const csrfReq = req.clone({
        setHeaders: {
          'X-CSRF-Token': csrfToken,
        },
      });

      console.warn('🛡️ Adding CSRF token to request:', req.method, req.url);

      return next(csrfReq).pipe(
        catchError((error: HttpErrorResponse) => {
          // Handle CSRF-related 403 errors
          const FORBIDDEN_STATUS = 403;
          if (error.status === FORBIDDEN_STATUS && isCsrfError(error)) {
            console.warn('🛡️ CSRF token invalid, refreshing and retrying...');

            // Refresh CSRF token and retry the request
            return csrfTokenService.refreshCsrfToken().pipe(
              switchMap((newCsrfToken) => {
                const retryReq = req.clone({
                  setHeaders: {
                    'X-CSRF-Token': newCsrfToken,
                  },
                });

                console.warn('🛡️ Retrying request with fresh CSRF token:', req.method, req.url);
                return next(retryReq);
              }),
              catchError((retryError) => {
                console.error('❌ Failed to retry request with fresh CSRF token:', retryError);
                return throwError(() => retryError);
              }),
            );
          }

          return throwError(() => error);
        }),
      );
    }),
    catchError((error) => {
      console.error('❌ CSRF interceptor error:', {
        status: error.status,
        statusText: error.statusText,
        url: error.url,
        message:
          'CSRF token fetch failed. Check if /auth/csrf-token endpoint exists and is accessible.',
      });

      // For critical auth operations, we should fail rather than continue
      if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
        console.error(
          '❌ Authentication request failed due to CSRF error - this is expected if backend CSRF is not implemented',
        );
        return throwError(() => error);
      }

      // For other requests, continue without CSRF
      console.warn('⚠️ Continuing non-auth request without CSRF token');
      return next(req);
    }),
  );
};

/**
 * Check if the error is CSRF-related
 */
function isCsrfError(error: HttpErrorResponse): boolean {
  const errorMessage = error.error?.message ?? error.message ?? '';
  const csrfKeywords = ['csrf', 'token', 'invalid', 'forbidden'];

  return csrfKeywords.some((keyword) => errorMessage.toLowerCase().includes(keyword.toLowerCase()));
}
