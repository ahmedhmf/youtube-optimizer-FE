import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CsrfTokenService } from './csrf-token.service';

describe('CsrfTokenService', () => {
  let service: CsrfTokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CsrfTokenService],
    });
    service = TestBed.inject(CsrfTokenService);
  });

  afterEach(() => {
    service.clearCsrfToken();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should determine if request needs CSRF token', () => {
    expect(service.needsCsrfToken('POST', '/api/test')).toBe(true);
    expect(service.needsCsrfToken('GET', '/api/test')).toBe(false);
    expect(service.needsCsrfToken('PUT', '/api/test')).toBe(true);
    expect(service.needsCsrfToken('DELETE', '/api/test')).toBe(true);
    expect(service.needsCsrfToken('POST', '/auth/csrf-token')).toBe(false);
    expect(service.needsCsrfToken('POST', '/auth/refresh')).toBe(false);
  });

  it('should clear CSRF token', () => {
    service.setCsrfToken('test-token');
    expect(service.getCsrfToken()).toBe('test-token');

    service.clearCsrfToken();
    expect(service.getCsrfToken()).toBeNull();
  });
});
