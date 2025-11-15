import { inject } from '@angular/core';
import { Router } from '@angular/router';
import type { CanActivateFn } from '@angular/router';
import { JwtAuthService } from '../services/jwt-auth.service';

export const publicGuard: CanActivateFn = () => {
  const jwtAuthService = inject(JwtAuthService);
  const router = inject(Router);

  // If user is already authenticated, redirect to dashboard
  if (jwtAuthService.isAuthenticated()) {
    void router.navigate(['/dashboard']);
    return false;
  }

  // Allow access to public routes for unauthenticated users
  return true;
};
