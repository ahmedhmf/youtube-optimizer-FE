import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { type Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import type { SocialAuthResponse } from '../../models/auth/social-auth-response.type';

@Injectable({
  providedIn: 'root',
})
export class SocialAuthService {
  private readonly http = inject(HttpClient);

  /**
   * Initiate Google OAuth flow via backend (server-side)
   * This avoids COOP issues by letting the backend handle OAuth
   */
  public async initiateGoogleOAuth(): Promise<void> {
    try {
      const response = await fetch(`${environment.backendURL}/auth/social/google/url`);

      if (!response.ok) {
        throw new Error(`Failed to get OAuth URL: ${response.statusText}`);
      }

      const { url, state } = await response.json();
      sessionStorage.setItem('oauth_state', state);
      window.location.href = url;
    } catch {
      throw new Error('Failed to start Google authentication');
    }
  }

  /**
   * Sign in with Google credential token (legacy method - not used with server-side OAuth)
   */
  public signInWithGoogle(credentialToken: string): Observable<SocialAuthResponse> {
    const payload = {
      token: credentialToken,
      provider: 'google',
    };

    return this.http
      .post<SocialAuthResponse>(`${environment.backendURL}/auth/social/google`, payload)
      .pipe(
        catchError(() => {
          return throwError(() => new Error('Failed to sign in with Google'));
        }),
      );
  }

  /**
   * Check if social login is available
   */
  public isSocialLoginAvailable(): boolean {
    return !!environment.oauth.google.clientId;
  }

  /**
   * Get available social providers
   */
  public getAvailableProviders(): string[] {
    const providers: string[] = [];

    if (environment.oauth.google.clientId) {
      providers.push('google');
    }

    return providers;
  }
}
