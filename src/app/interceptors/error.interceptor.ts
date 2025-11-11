import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ErrorHandlerService } from '../util/error-handler.service';
import { NotificationService } from '../util/notification.service';
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(
    private errorHandler: ErrorHandlerService,
    private notification: NotificationService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        const handledError = this.errorHandler.handle(error);
        
        // Handle specific error codes
        if (handledError.code === 'UNAUTHORIZED') {
          this.router.navigate(['/auth/login']);
        }
        
        // Show network errors as notifications
        if (handledError.code === 'NETWORK_ERROR') {
          this.notification.error(handledError.message);
        }
        
        return throwError(() => handledError);
      })
    );
  }
}