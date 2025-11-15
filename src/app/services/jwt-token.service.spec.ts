import { TestBed } from '@angular/core/testing';
import { JwtTokenService } from './jwt-token.service';

describe('JwtTokenService', () => {
  let service: JwtTokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JwtTokenService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should store and retrieve access token', () => {
    const token = 'test-token';
    service.setTokens(token);

    expect(service.getAccessToken()).toBe(token);
  });

  it('should store and retrieve refresh token', () => {
    const accessToken = 'access-token';
    const refreshToken = 'refresh-token';

    service.setTokens(accessToken, refreshToken);

    expect(service.getAccessToken()).toBe(accessToken);
    expect(service.getRefreshToken()).toBe(refreshToken);
  });

  it('should clear all tokens', () => {
    service.setTokens('access-token', 'refresh-token');
    service.clearTokens();

    expect(service.getAccessToken()).toBeNull();
    expect(service.getRefreshToken()).toBeNull();
  });

  it('should decode valid JWT token', () => {
    // Sample JWT token payload: { "sub": "123", "email": "test@example.com", "exp": 9999999999 }
    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJleHAiOjk5OTk5OTk5OTl9.invalid';

    const decoded = service.decodeToken(token);
    const exp = 9999999999;
    expect(decoded.sub).toBe('123');
    expect(decoded.email).toBe('test@example.com');
    expect(decoded.exp).toBe(exp);
  });

  it('should throw error for invalid token', () => {
    const invalidToken = 'invalid-token';

    expect(() => service.decodeToken(invalidToken)).toThrow('Invalid token format');
  });

  it('should check if token is expired', () => {
    // Token with past expiry
    const expiredToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJleHAiOjE1MDAwMDAwMDB9.invalid';
    // Token with future expiry
    const validToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJleHAiOjk5OTk5OTk5OTl9.invalid';

    expect(service.isTokenExpired(expiredToken)).toBe(true);
    expect(service.isTokenExpired(validToken)).toBe(false);
  });

  it('should check authentication status', () => {
    expect(service.isAuthenticated()).toBe(false);

    // Set valid token
    const validToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJleHAiOjk5OTk5OTk5OTl9.invalid';
    service.setTokens(validToken);

    expect(service.isAuthenticated()).toBe(true);
  });

  it('should extract user information from token', () => {
    const tokenWithUserInfo =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJleHAiOjk5OTk5OTk5OTl9.invalid';
    service.setTokens(tokenWithUserInfo);

    expect(service.getUserId()).toBe('123');
    expect(service.getUserEmail()).toBe('test@example.com');
    expect(service.getUserRole()).toBe('admin');
  });
});
