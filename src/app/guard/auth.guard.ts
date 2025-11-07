import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  try {
    // Check if user is authenticated
    const { data: { session }, error } = await authService.client.auth.getSession();
    
    if (error) {
      router.navigate(['/login']);
      return false;
    }

    if (session && session.user) {
      return true;
    } else {
      router.navigate(['/login'], { 
        queryParams: { returnUrl: state.url } 
      });
      return false;
    }
  } catch (error) {
    router.navigate(['/login']);
    return false;
  }
};