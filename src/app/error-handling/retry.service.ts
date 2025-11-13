/* eslint-disable max-params */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { throwError, timer } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import type { RetryCategory, RetryConfig } from './retry-configuration.service';
import { RetryConfigService } from './retry-configuration.service';

export type RetryContext = {
  readonly operation: string;
  readonly category: RetryCategory;
  readonly startTime: number;
  readonly metadata?: Record<string, any>;
};

@Injectable({
  providedIn: 'root',
})
export class RetryService {
  private readonly configService = inject(RetryConfigService);

  /**
   * Retry an operation using a predefined category
   */
  public retryWithCategory<T>(
    operation: () => Observable<T>,
    category: RetryCategory,
    context: Partial<RetryContext> = {},
  ): Observable<T> {
    const config = this.configService.getConfig(category);
    const fullContext: RetryContext = {
      operation: 'unknown',
      category,
      startTime: Date.now(),
      ...context,
    };

    return this.executeWithRetry(operation, config, fullContext, 1);
  }

  /**
   * Retry an operation with custom config overrides
   */
  public retryWithOverrides<T>(
    operation: () => Observable<T>,
    category: RetryCategory,
    overrides: Partial<RetryConfig>,
    context: Partial<RetryContext> = {},
  ): Observable<T> {
    const config = this.configService.getConfigWithOverrides(category, overrides);
    const fullContext: RetryContext = {
      operation: 'unknown',
      category,
      startTime: Date.now(),
      ...context,
    };

    return this.executeWithRetry(operation, config, fullContext, 1);
  }

  /**
   * Execute operation with retry logic
   */
  private executeWithRetry<T>(
    operation: () => Observable<T>,
    config: RetryConfig,
    context: RetryContext,
    attempt: number,
  ): Observable<T> {
    return operation().pipe(
      catchError((error) => {
        const shouldRetry = this.configService.shouldRetry(error, context.category);

        if (!shouldRetry || attempt >= config.maxRetries) {
          return throwError(() => error);
        }

        const delay = this.calculateDelay(attempt, config);

        return timer(delay).pipe(
          switchMap(() => this.executeWithRetry(operation, config, context, attempt + 1)),
        );
      }),
    );
  }

  /**
   * Calculate delay with exponential backoff and jitter
   */
  private calculateDelay(attempt: number, config: RetryConfig): number {
    const exponentialDelay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1);

    // Add jitter (±25%) to prevent thundering herd
    const twentyFivePercent = 0.25;
    const fiftyPercent = 0.5;
    const jitter = exponentialDelay * twentyFivePercent * (Math.random() - fiftyPercent);
    const delayWithJitter = exponentialDelay + jitter;

    return Math.min(delayWithJitter, config.maxDelay);
  }
}
