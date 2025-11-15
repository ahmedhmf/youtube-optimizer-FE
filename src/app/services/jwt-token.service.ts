import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type DecodedToken = {
  exp: number;
  iat: number;
  sub: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
};

@Injectable({ providedIn: 'root' })
export class JwtTokenService {
  public token$;

  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly SIXTY = 60;
  private readonly ONE_THOUSAND = 1000;
  private readonly FIVE = 5;
  private readonly MINUTES_IN_MS = this.SIXTY * this.ONE_THOUSAND;
  private readonly TOKEN_EXPIRY_BUFFER_MINUTES = this.FIVE;
  private readonly TOKEN_EXPIRY_BUFFER = this.TOKEN_EXPIRY_BUFFER_MINUTES * this.MINUTES_IN_MS;

  private readonly tokenSubject = new BehaviorSubject<string | null>(this.getAccessToken());

  constructor() {
    this.token$ = this.tokenSubject.asObservable();
    // Check token validity on service initialization
    this.validateStoredToken();
  }

  /**
   * Store access and refresh tokens
   */
  public setTokens(accessToken: string, refreshToken?: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
    this.tokenSubject.next(accessToken);
  }

  /**
   * Get access token from storage
   */
  public getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Get refresh token from storage
   */
  public getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Check if user is authenticated (has valid token)
   */
  public isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return token !== null && !this.isTokenExpired(token);
  }

  /**
   * Check if token is expired
   */
  public isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      const currentTime = Math.floor(Date.now() / this.ONE_THOUSAND);
      return decoded.exp < currentTime;
    } catch {
      return true; // Consider invalid tokens as expired
    }
  }

  /**
   * Check if token needs refresh (expires within buffer time)
   */
  public shouldRefreshToken(): boolean {
    const token = this.getAccessToken();
    if (!token) {
      return false;
    }

    try {
      const decoded = this.decodeToken(token);
      const currentTime = Date.now();
      const expiryTime = decoded.exp * this.ONE_THOUSAND; // Convert to milliseconds

      return expiryTime - currentTime <= this.TOKEN_EXPIRY_BUFFER;
    } catch {
      return true; // If we can't decode, we should refresh
    }
  }

  /**
   * Decode JWT token
   */
  public decodeToken(token: string): DecodedToken {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded) as DecodedToken;
    } catch {
      throw new Error('Invalid token format');
    }
  }

  /**
   * Get user information from token
   */
  public getTokenInfo(): DecodedToken | null {
    const token = this.getAccessToken();
    if (!token) {
      return null;
    }

    try {
      return this.decodeToken(token);
    } catch {
      return null;
    }
  }

  /**
   * Get user ID from token
   */
  public getUserId(): string | null {
    const tokenInfo = this.getTokenInfo();
    return tokenInfo?.sub ?? null;
  }

  /**
   * Get user email from token
   */
  public getUserEmail(): string | null {
    const tokenInfo = this.getTokenInfo();
    return tokenInfo?.email ?? null;
  }

  /**
   * Get user role from token
   */
  public getUserRole(): string | null {
    const tokenInfo = this.getTokenInfo();
    return tokenInfo?.role ?? null;
  }

  /**
   * Clear all tokens and logout
   */
  public clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    this.tokenSubject.next(null);
  }

  /**
   * Get time until token expires
   */
  public getTimeUntilExpiry(): number | null {
    const token = this.getAccessToken();
    if (!token) {
      return null;
    }

    try {
      const decoded = this.decodeToken(token);
      const currentTime = Date.now();
      const expiryTime = decoded.exp * this.ONE_THOUSAND;

      return Math.max(0, expiryTime - currentTime);
    } catch {
      return null;
    }
  }

  /**
   * Validate stored token and clear if invalid
   */
  private validateStoredToken(): void {
    const token = this.getAccessToken();
    if (token && this.isTokenExpired(token)) {
      this.clearTokens();
    }
  }
}
