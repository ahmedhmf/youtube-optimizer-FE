import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { RetryService } from './retry.service';
import { RetryConfigService } from './retry-configuration.service';
import { errorCodes } from './error-codes.constants';

describe('RetryService', () => {
  let service: RetryService;
  let configService: RetryConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RetryService, RetryConfigService],
    });
    service = TestBed.inject(RetryService);
    configService = TestBed.inject(RetryConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should succeed on first attempt without retry', (done) => {
    const mockOperation = jasmine.createSpy('operation').and.returnValue(of('success'));

    service
      .retryWithCategory(mockOperation, 'crud', {
        operation: 'test-operation',
      })
      .subscribe({
        next: (result) => {
          expect(result).toBe('success');
          expect(mockOperation).toHaveBeenCalledTimes(1);
          done();
        },
        error: done.fail,
      });
  });

  it('should retry on server error and eventually succeed', (done) => {
    const mockOperation = jasmine.createSpy('operation').and.returnValues(
      throwError(() => ({ status: 500 })), // First call fails
      throwError(() => ({ status: 500 })), // Second call fails
      of('success'), // Third call succeeds
    );

    service
      .retryWithCategory(mockOperation, 'crud', {
        operation: 'test-retry-operation',
      })
      .subscribe({
        next: (result) => {
          const retryTime = 3;
          expect(result).toBe('success');
          expect(mockOperation).toHaveBeenCalledTimes(retryTime);
          done();
        },
        error: done.fail,
      });
  });

  it('should not retry on client error (4xx)', (done) => {
    const mockOperation = jasmine
      .createSpy('operation')
      .and.returnValue(throwError(() => ({ status: errorCodes.notFound })));

    service
      .retryWithCategory(mockOperation, 'crud', {
        operation: 'test-no-retry',
      })
      .subscribe({
        next: () => {
          done.fail('Should have failed');
        },
        error: (error) => {
          expect(error.status).toBe(errorCodes.notFound);
          expect(mockOperation).toHaveBeenCalledTimes(1);
          done();
        },
      });
  });

  it('should respect maxRetries limit', (done) => {
    const mockOperation = jasmine
      .createSpy('operation')
      .and.returnValue(throwError(() => ({ status: errorCodes.internalServerError })));

    service
      .retryWithCategory(mockOperation, 'crud', {
        operation: 'test-max-retries',
      })
      .subscribe({
        next: () => {
          done.fail('Should have failed');
        },
        error: (error) => {
          expect(error.status).toBe(errorCodes.internalServerError);
          // Should be called maxRetries + 1 times (initial + retries)
          const crudConfig = configService.getConfig('crud');
          expect(mockOperation).toHaveBeenCalledTimes(crudConfig.maxRetries);
          done();
        },
      });
  });
});
