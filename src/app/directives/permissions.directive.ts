import { TemplateRef, ViewContainerRef } from '@angular/core';
import { Directive, Input, inject } from '@angular/core';
import { JwtAuthService } from '../services/jwt-auth.service';

@Directive({
  selector: '[appHasPermission]',
})
export class HasPermissionDirective {
  @Input() public set appHasPermission(permission: string) {
    if (this.authService.hasPermission(permission)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly templateRef = inject(TemplateRef<any>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly authService = inject(JwtAuthService);
}
