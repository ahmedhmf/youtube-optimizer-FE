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
    // Backend should redirect here with query params after successful OAuth
    this.route.queryParams.subscribe((params) => {
      const success = params['success'];
      const error = params['error'];
      const state = params['state'];

      // Validate state for CSRF protection
      const storedState = sessionStorage.getItem('oauth_state');
      sessionStorage.removeItem('oauth_state');

      if (state !== storedState) {
        this.message = 'Security validation failed';
        setTimeout(() => {
          void this.router.navigate(['/login'], {
            queryParams: { error: 'Invalid state parameter' },
          });
        }, this.REDIRECT_DELAY);
        return;
      }

      if (error) {
        this.message = 'Authentication failed';
        setTimeout(() => {
          void this.router.navigate(['/login'], {
            queryParams: { error: decodeURIComponent(error) },
          });
        }, this.REDIRECT_DELAY);
        return;
      }

      if (success === 'true') {
        // Backend has already set the session cookie and access token
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
      } else {
        // No success or error params - invalid callback
        this.message = 'Invalid callback';
        setTimeout(() => {
          void this.router.navigate(['/login']);
        }, this.REDIRECT_DELAY);
      }
    });
  }
}
