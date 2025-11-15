import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { JwtAuthService } from '../../../services/jwt-auth.service';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
  private readonly jwtAuthService = inject(JwtAuthService);

  protected logout(): void {
    this.jwtAuthService.logout().subscribe({
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
