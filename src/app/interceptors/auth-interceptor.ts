import { inject } from '@angular/core';
import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { from, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth';
import { environment } from '../../environments/environment';

export const AuthInterceptor: HttpInterceptorFn =
  (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
    const supabase = inject(AuthService);
    if (!req.url.startsWith(environment.backendURL)) {
      return next(req);
    }

    return from(supabase.client.auth.getSession()).pipe(
      switchMap(({ data }) => {
        const token = data?.session?.access_token;
        if (token) {
          const authReq = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` },
          });
          return next(authReq);
        }
        return next(req);
      })
    );
  };
