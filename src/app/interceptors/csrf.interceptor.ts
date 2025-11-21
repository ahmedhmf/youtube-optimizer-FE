import type {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { throwError } from 'rxjs';
import { catchError, switchMap, retry } from 'rxjs/operators';
import { CsrfService } from '../services/auth/csrf.service';

/**
 * 🛡️ CSRF Interceptor - BULLETPROOF VERSION
 *
 * Automatically adds CSRF tokens to protected requests
 * with retry logic and proper error handling
 */
export const csrfInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<any> => {
  const csrfService = inject(CsrfService);

  // Check if this request needs CSRF protection
  if (!csrfService.needsCsrfProtection(req.method, req.url)) {
    console.log(`⏭️ CSRF: Skipping ${req.method} ${req.url}`);
    return next(req);
  }

  console.log(`🛡️ CSRF: Processing ${req.method} ${req.url}`);

  // Get CSRF token and add to request
  return csrfService.getToken().pipe(
    switchMap((csrfToken) => {
      console.log(`🛡️ CSRF: Adding token to ${req.method} ${req.url}`);

      // Add CSRF token to request headers
      const csrfReq = req.clone({
        setHeaders: {
          'X-CSRF-Token': csrfToken,
          'X-Requested-With': 'XMLHttpRequest', // Additional CSRF protection
        },
      });

      return next(csrfReq).pipe(
        catchError((error: HttpErrorResponse) => {
          // Handle CSRF-specific errors
          if (isCsrfError(error)) {
            console.warn(
              `🔄 CSRF: Token invalid, refreshing and retrying ${req.method} ${req.url}`,
            );

            // Refresh CSRF token and retry
            return csrfService.refreshToken().pipe(
              switchMap((newToken) => {
                const retryReq = req.clone({
                  setHeaders: {
                    'X-CSRF-Token': newToken,
                    'X-Requested-With': 'XMLHttpRequest',
                  },
                });
                return next(retryReq);
              }),
            );
          }

          return throwError(() => error);
        }),
      );
    }),
    catchError((error) => {
      console.error(`❌ CSRF: Failed to get token for ${req.method} ${req.url}:`, error);

      // Continue without CSRF token as fallback
      console.warn(`⚠️ CSRF: Continuing without CSRF token for ${req.method} ${req.url}`);
      return next(req);
    }),
  );
};

/**
 * Check if error is CSRF-related
 */
function isCsrfError(error: HttpErrorResponse): boolean {
  // Common CSRF error indicators
  const csrfErrorCodes = [403, 419]; // 403 Forbidden, 419 Page Expired
  const csrfErrorMessages = [
    'csrf',
    'token',
    'forbidden',
    'invalid token',
    'token mismatch',
    'token expired',
  ];

  const statusMatch = csrfErrorCodes.includes(error.status);
  const messageMatch =
    error.error?.message &&
    csrfErrorMessages.some((msg) => error.message.toLowerCase().includes(msg));

  return statusMatch || messageMatch;
}
