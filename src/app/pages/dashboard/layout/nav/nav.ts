import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../services/auth/auth.service';

@Component({
  selector: 'app-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav.html',
  styleUrl: './nav.scss',
})
export class Nav {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        void this.router.navigate(['/']);
      },
    });
  }
}
