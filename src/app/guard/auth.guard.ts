import { inject } from '@angular/core';
import { Router } from '@angular/router';
import type { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  try {
    // Check if user is authenticated
    const {
      data: { session },
      error,
    } = await authService.client.auth.getSession();

    if (error) {
      void router.navigate(['/login']);
      return false;
    }

    if (session?.user) {
      return true;
    } else {
      void router.navigate(['/login'], {
        queryParams: { returnUrl: state.url },
      });
      return false;
    }
  } catch (error) {
    void router.navigate(['/login']);
    console.error('Error checking session in auth guard', error);
    return false;
  }
};
