import { inject } from '@angular/core';
import { Router } from '@angular/router';
import type { CanActivateFn } from '@angular/router';
import { JwtTokenService } from '../services/jwt-token.service';

export const jwtAuthGuard: CanActivateFn = (route, state) => {
  const jwtTokenService = inject(JwtTokenService);
  const router = inject(Router);

  // Check if user is authenticated with valid JWT token
  if (jwtTokenService.isAuthenticated()) {
    return true;
  }

  // Redirect to login with return URL
  void router.navigate(['/login'], {
    queryParams: { returnUrl: state.url },
  });

  return false;
};
