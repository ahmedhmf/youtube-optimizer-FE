import type { OnInit } from '@angular/core';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-oauth-callback',
  template: `
    <div class="bg-black h-screen w-screen flex items-center justify-center">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        <p class="text-white mt-4 font-primary">{{ message }}</p>
      </div>
    </div>
  `,
  standalone: true,
})
export class OAuthCallback implements OnInit {
  protected message = 'Completing authentication...';

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly REDIRECT_DELAY = 2000;

  public ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const success = params['success'];
      const error = params['error'];
      const state = params['state'];
      const accessToken = params['access_token'];
      const refreshToken = params['refresh_token'];

      // Validate state for CSRF protection
      const storedState = sessionStorage.getItem('oauth_state');
      sessionStorage.removeItem('oauth_state');

      if (state !== storedState) {
        this.securityValidationFailed();
        return;
      }

      if (error) {
        this.error(error);
        return;
      }

      if (success === 'true' && accessToken && refreshToken) {
        this.success(accessToken, refreshToken);
      } else {
        this.failed();
      }
    });
  }

  private securityValidationFailed(): void {
    this.message = 'Security validation failed';
    setTimeout(() => {
      void this.router.navigate(['/login'], {
        queryParams: { error: 'Invalid state parameter' },
      });
    }, this.REDIRECT_DELAY);
  }

  private error(error: unknown): void {
    this.message = 'Authentication failed';
    setTimeout(() => {
      void this.router.navigate(['/login'], {
        queryParams: { error: decodeURIComponent(String(error)) },
      });
    }, this.REDIRECT_DELAY);
  }

  private success(accessToken: string, refreshToken: string): void {
    // Save tokens from OAuth callback
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);

    // Re-initialize auth state to load user info
    this.message = 'Loading your account...';

    this.authService.initialize().subscribe({
      next: (isAuthenticated) => {
        if (isAuthenticated) {
          void this.router.navigate(['/dashboard']);
        } else {
          void this.router.navigate(['/login'], {
            queryParams: { error: 'Authentication failed' },
          });
        }
      },
      error: () => {
        void this.router.navigate(['/login'], {
          queryParams: { error: 'Failed to initialize session' },
        });
      },
    });
  }

  private failed(): void {
    this.message = 'Invalid callback';
    setTimeout(() => {
      void this.router.navigate(['/login']);
    }, this.REDIRECT_DELAY);
  }
}
