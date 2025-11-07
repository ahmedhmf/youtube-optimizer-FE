import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';

export const publicGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  try {
    const { data: { session }, error } = await authService.client.auth.getSession();
    
    if (error) {
      return true;
    }

    if (session && session.user) {
      router.navigate(['/dashboard']);
      return false;
    } else {
      return true;
    }
  } catch (error) {
    // Todo : handle error properly
    return true;
  }
};