import { inject, Injectable } from '@angular/core';
import type { CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { Router } from '@angular/router';
import type { UserRole } from '../services/jwt-auth.service';
import { JwtAuthService } from '../services/jwt-auth.service';

@Injectable()
export class RoleGuard implements CanActivate {
  private readonly authService = inject(JwtAuthService);
  private readonly router = inject(Router);

  public canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRoles = route.data['roles'] as UserRole[];
    const requiredPermissions = route.data['permissions'] as string[];

    if (requiredRoles && !this.authService.hasRole(...requiredRoles)) {
      this.router.navigate(['/unauthorized']);
      return false;
    }

    if (requiredPermissions) {
      for (const permission of requiredPermissions) {
        if (!this.authService.hasPermission(permission)) {
          this.router.navigate(['/unauthorized']);
          return false;
        }
      }
    }

    return true;
  }
}
