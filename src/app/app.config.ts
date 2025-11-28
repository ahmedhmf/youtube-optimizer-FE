import type { ApplicationConfig } from '@angular/core';
import {
  ErrorHandler,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
  APP_INITIALIZER,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { jwtInterceptor } from './interceptors/jwt.interceptor';
import { globalErrorHandlingInterceptor } from './error-handling/global-error-handling.interceptors';
import { GlobalErrorHandler } from './error-handling/global-error-handling.service';
import { AppInitializationService } from './services/app-initialization.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([
        jwtInterceptor, // JWT authentication
        globalErrorHandlingInterceptor, // Global error handling
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
    {
      provide: APP_INITIALIZER,
      useFactory: (appInit: AppInitializationService) => () => appInit.initializeApp(),
      deps: [AppInitializationService],
      multi: true,
    },
  ],
};
