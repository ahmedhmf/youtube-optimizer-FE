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

  // Memory-only storage constants (no localStorage for security)
  private readonly SIXTY = 60;
  private readonly ONE_THOUSAND = 1000;
  private readonly FIVE = 5;
  private readonly MINUTES_IN_MS = this.SIXTY * this.ONE_THOUSAND;
  private readonly TOKEN_EXPIRY_BUFFER_MINUTES = this.FIVE;
  private readonly TOKEN_EXPIRY_BUFFER = this.TOKEN_EXPIRY_BUFFER_MINUTES * this.MINUTES_IN_MS;

  // In-memory token storage (no localStorage)
  private currentAccessToken: string | null = null;
  private readonly tokenSubject = new BehaviorSubject<string | null>(null);

  constructor() {
    this.token$ = this.tokenSubject.asObservable();
    // No token validation needed since we use memory-only storage
  }

  /**
   * Store access token in memory only (refresh token handled by HTTP-only cookies)
   */
  public setAccessToken(accessToken: string): void {
    this.currentAccessToken = accessToken;
    this.tokenSubject.next(accessToken);
  }

  /**
   * Legacy method for backward compatibility - use setAccessToken instead
   */
  public setTokens(accessToken: string, refreshToken?: string): void {
    this.setAccessToken(accessToken);
    // Refresh token parameter ignored - handled by HTTP-only cookies
  }

  /**
   * Get access token from memory
   */
  public getAccessToken(): string | null {
    return this.currentAccessToken;
  }

  /**
   * Refresh tokens are now handled by HTTP-only cookies
   * No need to access them from frontend for security
   */
  public getRefreshToken(): string | null {
    // Refresh tokens are HTTP-only cookies - not accessible from JS
    return null;
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
   * Clear access token from memory (refresh token cookies cleared by backend)
   */
  public clearTokens(): void {
    this.currentAccessToken = null;
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
   * Check if token is valid and not expired
   */
  public isTokenValid(): boolean {
    const token = this.getAccessToken();
    return token !== null && !this.isTokenExpired(token);
  }
}
