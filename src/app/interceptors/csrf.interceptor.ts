import type {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
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
  if (!csrfService.needsCsrfProtection(req.method, req.url)) {
    return next(req);
  }
  return csrfService.getToken().pipe(
    switchMap((csrfToken) => {
      const csrfReq = req.clone({
        setHeaders: {
          'X-CSRF-Token': csrfToken,
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      return next(csrfReq).pipe(
        catchError((error: HttpErrorResponse) => {
          if (isCsrfError(error)) {
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
      const isAuthRefresh = req.url.includes('/auth/refresh');

      if (isAuthRefresh) {
        return throwError(() => error);
      }
      return next(req);
    }),
  );
};

/**
 * Check if error is CSRF-related
 */
function isCsrfError(error: HttpErrorResponse): boolean {
  // Common CSRF error indicators
  const forbiddenStatus = 403;
  const csrfStatus = 419;
  const csrfErrorCodes = [forbiddenStatus, csrfStatus];
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
