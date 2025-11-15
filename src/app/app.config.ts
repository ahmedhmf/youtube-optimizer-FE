import type { ApplicationConfig } from '@angular/core';
import {
  ErrorHandler,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { jwtInterceptor } from './interceptors/jwt-interceptor';
import { globalErrorHandlingInterceptor } from './error-handling/global-error-handling.interceptors';
import { GlobalErrorHandler } from './error-handling/global-error-handling.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([
        jwtInterceptor, // Use JWT interceptor for authentication
        globalErrorHandlingInterceptor,
      ]),
    ),
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    importProvidersFrom(FormsModule),
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler,
    },
  ],
};
