/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable complexity */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import type { HttpErrorResponse } from '@angular/common/http';
import { errorCodes } from './error-codes.constants';

export type RetryCategory =
  | 'analysis' // AI processing, video analysis
  | 'upload' // File uploads, large data transfers
  | 'crud' // Standard CRUD operations
  | 'listing' // Data fetching, pagination
  | 'auth' // Authentication operations
  | 'realtime' // WebSocket, real-time features
  | 'external-api' // Third-party API calls (YouTube, etc.)
  | 'background' // Background tasks, async operations
  | 'critical'; // Critical operations that must succeed

export type RetryConfig = {
  readonly maxRetries: number;
  readonly initialDelay: number;
  readonly maxDelay: number;
  readonly backoffMultiplier: number;
  readonly retryCondition?: (error: any) => boolean;
  readonly description?: string;
};

@Injectable({
  providedIn: 'root',
})
export class RetryConfigService {
  private readonly configs: Record<RetryCategory, RetryConfig> = {
    // AI and analysis operations - can be slow and unstable
    analysis: {
      maxRetries: 4,
      initialDelay: 2000,
      maxDelay: 20000,
      backoffMultiplier: 2,
      description: 'AI processing, video analysis',
      retryCondition: (error: any) => {
        return (
          error?.status >= errorCodes.internalServerError ||
          error?.status === errorCodes.unknown ||
          error?.status === errorCodes.requestTimeout ||
          error?.status === errorCodes.serviceUnavailable || // Service unavailable
          error?.message?.includes('timeout')
        );
      },
    },

    // File upload operations - network intensive
    upload: {
      maxRetries: 5,
      initialDelay: 3000,
      maxDelay: 30000,
      backoffMultiplier: 2,
      description: 'File uploads, large data transfers',
      retryCondition: (error: any) => {
        return (
          error?.status >= errorCodes.internalServerError ||
          error?.status === errorCodes.unknown ||
          error?.status === errorCodes.requestTimeout ||
          error?.status === errorCodes.payloadTooLarge ||
          error?.status === errorCodes.badGateway ||
          error?.name === 'TimeoutError'
        );
      },
    },

    // Standard CRUD operations
    crud: {
      maxRetries: 3,
      initialDelay: 1000,
      maxDelay: 8000,
      backoffMultiplier: 2,
      description: 'Create, Read, Update, Delete operations',
    },

    // Data listing and pagination
    listing: {
      maxRetries: 2,
      initialDelay: 1500,
      maxDelay: 5000,
      backoffMultiplier: 1.5,
      description: 'Data fetching, pagination, search',
    },

    // Authentication operations
    auth: {
      maxRetries: 2,
      initialDelay: 1000,
      maxDelay: 4000,
      backoffMultiplier: 2,
      description: 'Login, logout, token refresh',
      retryCondition: (error: any) => {
        // Don't retry 401/403 (auth failures), but retry server errors
        return (
          error?.status >= errorCodes.internalServerError || error?.status === errorCodes.unknown
        );
      },
    },

    // External API calls (YouTube, third-party services)
    'external-api': {
      maxRetries: 4,
      initialDelay: 2500,
      maxDelay: 15000,
      backoffMultiplier: 2,
      description: 'Third-party API calls',
      retryCondition: (error: any) => {
        // Retry rate limits with longer delays
        if (error?.status === errorCodes.tooManyRequests) {
          return true;
        }
        // Retry quota exceeded for APIs like YouTube
        if (
          error?.status === errorCodes.forbidden &&
          error?.error?.error?.errors?.[0]?.reason === 'quotaExceeded'
        ) {
          return true;
        }
        return (
          error?.status >= errorCodes.internalServerError || error?.status === errorCodes.unknown
        );
      },
    },

    // Real-time operations (WebSocket, SSE)
    realtime: {
      maxRetries: 10, // More retries for real-time connections
      initialDelay: 1000,
      maxDelay: 10000,
      backoffMultiplier: 1.5, // Gentler backoff
      description: 'WebSocket, Server-sent events',
    },

    // Background operations
    background: {
      maxRetries: 6,
      initialDelay: 5000, // Longer initial delay
      maxDelay: 60000, // Up to 1 minute
      backoffMultiplier: 2,
      description: 'Background tasks, async operations',
    },

    // Critical operations that must succeed
    critical: {
      maxRetries: 8,
      initialDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2,
      description: 'Critical operations that must succeed',
      retryCondition: (error: any) => {
        // Retry almost everything except obvious client errors
        if (
          error?.status >= errorCodes.badRequest &&
          error?.status < errorCodes.internalServerError
        ) {
          // Don't retry 4xx except timeouts and rate limits
          return (
            error?.status === errorCodes.requestTimeout ||
            error?.status === errorCodes.tooManyRequests
          );
        }
        return true; // Retry all 5xx and network errors
      },
    },
  };

  /**
   * Get retry configuration for a specific category
   */
  public getConfig(category: RetryCategory): RetryConfig {
    return { ...this.configs[category] };
  }

  /**
   * Get configuration with custom overrides
   */
  public getConfigWithOverrides(
    category: RetryCategory,
    overrides: Partial<RetryConfig>,
  ): RetryConfig {
    return { ...this.configs[category], ...overrides };
  }

  /**
   * Check if an error should be retried for a specific category
   */
  public shouldRetry(error: any, category: RetryCategory): boolean {
    const config = this.configs[category];

    if (config.retryCondition) {
      return config.retryCondition(error);
    }

    // Default retry logic
    if (error?.status) {
      const httpError = error as HttpErrorResponse;
      return (
        httpError.status >= errorCodes.internalServerError ||
        httpError.status === errorCodes.tooManyRequests ||
        httpError.status === errorCodes.requestTimeout ||
        httpError.status === errorCodes.unknown
      );
    }

    return (
      error?.name === 'NetworkError' ||
      error?.message?.includes('fetch') ||
      error?.message?.includes('timeout')
    );
  }

  /**
   * Get all available categories with descriptions
   */
  public getAvailableCategories(): Array<{ category: RetryCategory; description: string }> {
    return Object.entries(this.configs).map(([category, config]) => ({
      category: category as RetryCategory,
      description: config.description ?? category,
    }));
  }

  /**
   * Update configuration for a category (useful for A/B testing configs)
   */
  public updateConfig(category: RetryCategory, config: Partial<RetryConfig>): void {
    this.configs[category] = { ...this.configs[category], ...config };
  }
}
