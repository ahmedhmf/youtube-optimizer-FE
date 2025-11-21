import { inject } from '@angular/core';
import { Router } from '@angular/router';
import type { CanActivateFn } from '@angular/router';
import { switchMap, of } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

export const jwtAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if authenticated
  if (authService.isAuthenticated()) {
    return true;
  }

  // Check if app is initialized, if not wait for initialization
  if (!authService.isInitialized()) {
    return authService.getInitializationStatus().pipe(
      switchMap((isInitialized) => {
        if (isInitialized && authService.isAuthenticated()) {
          return of(true);
        } else {
          void router.navigate(['/login'], {
            queryParams: { returnUrl: state.url },
          });
          return of(false);
        }
      }),
    );
  }

  // Not authenticated, redirect to login
  void router.navigate(['/login'], {
    queryParams: { returnUrl: state.url },
  });
  return false;
};
