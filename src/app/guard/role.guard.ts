import { inject, Injectable } from '@angular/core';
import type { CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

@Injectable()
export class RoleGuard implements CanActivate {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  public canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRoles = route.data['roles'] as string[];
    const requiredPermissions = route.data['permissions'] as string[];

    if (requiredRoles && !this.authService.hasAnyRole(requiredRoles)) {
      void this.router.navigate(['/unauthorized']);
      return false;
    }

    if (requiredPermissions) {
      for (const permission of requiredPermissions) {
        if (!this.authService.hasRole(permission)) {
          void this.router.navigate(['/unauthorized']);
          return false;
        }
      }
    }

    return true;
  }
}
