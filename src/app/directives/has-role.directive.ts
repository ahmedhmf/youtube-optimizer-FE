/* eslint-disable @typescript-eslint/no-explicit-any */
import { TemplateRef, ViewContainerRef } from '@angular/core';
import { Directive, Input, inject } from '@angular/core';
import type { UserRole } from '../services/jwt-auth.service';
import { JwtAuthService } from '../services/jwt-auth.service';

@Directive({
  selector: '[appHasRole]',
})
export class HasRoleDirective {
  @Input() public set appHasRole(roles: UserRole | UserRole[]) {
    this.roles = Array.isArray(roles) ? roles : [roles];
    this.updateView();
  }

  private roles: UserRole[] = [];
  private readonly templateRef = inject(TemplateRef<any>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly authService = inject(JwtAuthService);

  private updateView(): void {
    if (this.authService.hasRole(...this.roles)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
