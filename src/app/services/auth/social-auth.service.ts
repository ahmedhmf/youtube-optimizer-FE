import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { type Observable, from, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CsrfService } from './csrf.service';
import type { GoogleButtonConfiguration } from '../../models/auth/google-button-configuration.type';
import type { GoogleCredentialResponse } from '../../models/auth/google-credential-response.type';
import type { GoogleIdConfiguration } from '../../models/auth/google-id-configuration.type';
import type { SocialAuthResponse } from '../../models/auth/social-auth-response.type';

// Google Identity Services types
declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleIdConfiguration) => void;
          prompt: () => void;
          renderButton: (element: HTMLElement, config: GoogleButtonConfiguration) => void;
          cancel: () => void;
        };
      };
    };
  }
}

@Injectable({
  providedIn: 'root',
})
export class SocialAuthService {
  private readonly http = inject(HttpClient);
  private readonly csrfTokenService = inject(CsrfService);
  private googleLoaded = false;

  /**
   * Initialize Google One-Tap sign-in
   */
  public async initializeGoogleOneTap(
    callback: (response: GoogleCredentialResponse) => void,
  ): Promise<void> {
    await this.loadGoogleScript();

    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: environment.oauth.google.clientId,
        callback,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
    }
  }

  /**
   * Show Google One-Tap prompt
   */
  public showGoogleOneTap(): void {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    }
  }

  /**
   * Cancel Google One-Tap prompt
   */
  public cancelGoogleOneTap(): void {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.cancel();
    }
  }

  /**
   * Render Google Sign-In button
   */
  public async renderGoogleButton(
    element: HTMLElement,
    callback: (response: GoogleCredentialResponse) => void,
    config: GoogleButtonConfiguration = {},
  ): Promise<void> {
    await this.loadGoogleScript();

    // Initialize Google ID services first
    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: environment.oauth.google.clientId,
        callback,
      });

      // Default button configuration
      const buttonConfig: GoogleButtonConfiguration = {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: '300',
        ...config,
      };

      window.google.accounts.id.renderButton(element, buttonConfig);
    }
  }

  /**
   * Sign in with Google credential token
   */
  public signInWithGoogle(credentialToken: string): Observable<SocialAuthResponse> {
    const payload = {
      token: credentialToken,
      provider: 'google',
    };

    return this.http
      .post<SocialAuthResponse>(`${environment.backendURL}/auth/social/google`, payload)
      .pipe(
        catchError((error) => {
          console.error('Google sign-in error:', error);
          return throwError(() => new Error('Failed to sign in with Google'));
        }),
      );
  }

  /**
   * Sign in with GitHub using popup window
   */
  public signInWithGitHub(): Observable<SocialAuthResponse> {
    return from(this.initiateGitHubOAuth()).pipe(
      switchMap((authCode) => {
        const payload = {
          code: authCode,
          provider: 'github',
        };

        return this.http.post<SocialAuthResponse>(
          `${environment.backendURL}/auth/social/github`,
          payload,
          { withCredentials: true }, // Enable session cookies
        );
      }),
      catchError((error) => {
        console.error('GitHub sign-in error:', error);
        return throwError(() => new Error('Failed to sign in with GitHub'));
      }),
    );
  }

  /**
   * Check if social login is available
   */
  public isSocialLoginAvailable(): boolean {
    return !!(environment.oauth?.google?.clientId ?? environment.oauth?.github?.clientId);
  }

  /**
   * Get available social providers
   */
  public getAvailableProviders(): string[] {
    const providers: string[] = [];

    if (environment.oauth?.google?.clientId) {
      providers.push('google');
    }

    if (environment.oauth?.github?.clientId) {
      providers.push('github');
    }

    return providers;
  }

  /**
   * Load Google Identity Services script
   */
  private loadGoogleScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.googleLoaded) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;

      script.onload = (): void => {
        this.googleLoaded = true;
        resolve();
      };

      script.onerror = (error): void => {
        reject(error);
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Initiate GitHub OAuth flow using popup
   */
  private initiateGitHubOAuth(): Promise<string> {
    return new Promise((resolve, reject) => {
      const clientId = environment.oauth.github.clientId;
      const redirectUri = `${environment.siteUrl}/auth/github/callback`;
      const scope = 'user:email read:user';
      const state = this.generateRandomState();

      // Store state for validation
      sessionStorage.setItem('github_oauth_state', state);

      const authUrl =
        'https://github.com/login/oauth/authorize?' +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `state=${state}&` +
        'allow_signup=true';

      // Open popup window
      const popup = window.open(
        authUrl,
        'github-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes',
      );

      if (!popup) {
        reject(new Error('Failed to open GitHub OAuth popup'));
        return;
      }

      // Listen for the callback
      const messageListener = (event: MessageEvent): void => {
        // Verify origin
        if (event.origin !== environment.siteUrl) {
          return;
        }

        if (event.data.type === 'GITHUB_OAUTH_SUCCESS') {
          const { code, state: returnedState } = event.data;
          const storedState = sessionStorage.getItem('github_oauth_state');

          // Validate state parameter
          if (returnedState !== storedState) {
            reject(new Error('Invalid state parameter'));
            return;
          }

          sessionStorage.removeItem('github_oauth_state');
          window.removeEventListener('message', messageListener);
          popup.close();
          resolve(code);
        } else if (event.data.type === 'GITHUB_OAUTH_ERROR') {
          window.removeEventListener('message', messageListener);
          popup.close();
          reject(new Error(event.data.error || 'GitHub OAuth failed'));
        }
      };

      window.addEventListener('message', messageListener);

      // Handle popup closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          sessionStorage.removeItem('github_oauth_state');
          reject(new Error('OAuth popup was closed'));
        }
      }, 1000);
    });
  }

  /**
   * Generate random state for OAuth security
   */
  private generateRandomState(): string {
    const array = new Uint32Array(4);
    crypto.getRandomValues(array);
    return Array.from(array, (dec) => ('0' + dec.toString(16)).substr(-2)).join('');
  }
}
