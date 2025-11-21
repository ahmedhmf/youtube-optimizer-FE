import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
  private readonly authService = inject(AuthService);
  protected logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Logout successful');
        // Navigation is handled automatically in the service
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Even if logout API fails, tokens are cleared
      },
    });
  }
}
