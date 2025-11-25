/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ErrorHandler } from '@angular/core';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  errorStore,
  type ErrorType,
  type ErrorSeverity,
  type ApplicationError,
} from './global-error-handling.store';
import { environment } from '../../environments/environment';
import { HttpErrorResponse } from '@angular/common/http';

type ApplicationErrorInput = Error | string | unknown;

// Constants for error patterns
const ERROR_PATTERNS = {
  CHUNK_LOAD: /Loading chunk \d+ failed|ChunkLoadError/i,
  NETWORK: /Network Error|Failed to fetch|ERR_NETWORK/i,
  PERMISSION: /Permission denied|Unauthorized/i,
  VALIDATION: /Validation|Invalid|Required/i,
} as const;

const BATCH_REPORT_DELAY = 2000;

@Injectable({
  providedIn: 'root',
})
export class GlobalErrorHandler implements ErrorHandler {
  private readonly router = inject(Router);
  private readonly errorStore = inject(errorStore);
  private batchTimer: number | null = null;

  /**
   * Main error handler - processes all uncaught errors
   */
  public handleError(error: any): void {
    const errorDetails = this.extractErrorDetails(error);

    // Add to store
    this.errorStore.addError(errorDetails);

    // Handle based on error type
    this.processError(errorDetails);

    // Schedule batch reporting for non-critical errors
    this.scheduleBatchReport();

    this.reportToBackend(error);
  }

  /**
   * Extract error details from the raw error
   */
  private extractErrorDetails(
    error: ApplicationErrorInput,
  ): Omit<ApplicationError, 'id' | 'dismissed' | 'retryCount'> {
    const timestamp = new Date().toISOString();
    const url = window.location.href;

    let message = 'Unknown error occurred';
    let stack: string | undefined;

    if (error instanceof Error) {
      message = error.message;
      stack = error.stack;
    } else if (typeof error === 'string') {
      message = error;
    } else if (error && typeof error === 'object') {
      const oneThousand = 1000;
      message = JSON.stringify(error).substring(0, oneThousand);
    }

    const errorType = this.categorizeError(message);
    const severity = this.determineSeverity(errorType, message);

    return {
      message,
      category: 'system',
      stack,
      timestamp,
      url,
      userId: this.getCurrentUserId(),
      errorType,
      severity,
    };
  }

  /**
   * Process error based on type and severity
   */
  private processError(
    errorDetails: Omit<ApplicationError, 'id' | 'dismissed' | 'retryCount'>,
  ): void {
    switch (errorDetails.errorType) {
      case 'Chunk Load Error': {
        this.handleChunkLoadError();
        break;
      }
      case 'Network Error': {
        this.handleNetworkError();
        break;
      }
      case 'Permission Error': {
        this.handlePermissionError();
        break;
      }
      default: {
        if (errorDetails.severity === 'critical') {
          this.handleCriticalError(errorDetails);
        }
        break;
      }
    }
  }

  /**
   * Handle chunk loading errors
   */
  private handleChunkLoadError(): void {
    // eslint-disable-next-line no-alert
    if (confirm('A new version is available. Would you like to refresh the page?')) {
      window.location.reload();
    }
  }

  /**
   * Handle network errors
   */
  private handleNetworkError(): void {
    this.errorStore.setNetworkStatus('unstable');

    // Set back to online after a delay
    const waitTime = 5000;
    setTimeout(() => {
      this.errorStore.setNetworkStatus('online');
    }, waitTime);
  }

  /**
   * Handle permission errors
   */
  private handlePermissionError(): void {
    void this.router.navigate(['/login']);
  }

  /**
   * Handle critical errors
   */
  private handleCriticalError(
    errorDetails: Omit<ApplicationError, 'id' | 'dismissed' | 'retryCount'>,
  ): void {
    // Log immediately for critical errors
    this.logToService([errorDetails]);
  }

  /**
   * Schedule batch reporting
   */
  private scheduleBatchReport(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }

    this.batchTimer = setTimeout(() => {
      const queuedErrors = this.errorStore.batchReportQueue();
      if (queuedErrors.length > 0) {
        this.logToService(queuedErrors);
        this.errorStore.clearBatchQueue();
      }
    }, BATCH_REPORT_DELAY);
  }

  /**
   * Log errors to external service
   */
  private logToService(
    errors: Array<Omit<ApplicationError, 'id' | 'dismissed' | 'retryCount'> | ApplicationError>,
  ): void {
    if (!environment.production) {
      errors.forEach((error) => {
        console.error(error);
      });
    }
  }

  /**
   * Categorize error type
   */
  private categorizeError(message: string): ErrorType {
    if (ERROR_PATTERNS.CHUNK_LOAD.test(message)) {
      return 'Chunk Load Error';
    }
    if (ERROR_PATTERNS.NETWORK.test(message)) {
      return 'Network Error';
    }
    if (ERROR_PATTERNS.PERMISSION.test(message)) {
      return 'Permission Error';
    }
    if (ERROR_PATTERNS.VALIDATION.test(message)) {
      return 'Validation Error';
    }
    if (message.includes('Script error') || message.includes('TypeError')) {
      return 'JavaScript Error';
    }
    return 'Unknown Error';
  }

  /**
   * Determine error severity
   */
  private determineSeverity(errorType: ErrorType, message: string): ErrorSeverity {
    if (errorType === 'Chunk Load Error' || message.includes('Cannot read properties')) {
      return 'critical';
    }
    if (errorType === 'Network Error' || errorType === 'Permission Error') {
      return 'high';
    }
    if (errorType === 'Validation Error' || errorType === 'JavaScript Error') {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Get current user ID
   */
  private getCurrentUserId(): string | undefined {
    return 'anonymous'; // Implement based on your auth system
  }

  private reportToBackend(error: any): void {
    // Skip backend reporting in development or if backend is not available
    if (!environment.production) {
      return;
    }

    const errorReport = {
      message: error.message,
      stack: error.stack,
      type: this.getErrorType(error),
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      context: this.buildErrorContext(),
    };

    // Fire and forget - don't handle errors from error reporting
    fetch(`${environment.backendURL}/errors/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorReport),
    }).catch(() => {
      // Silently fail - we don't want error reporting to cause more errors
    });
  }

  private getErrorType(error: any): string {
    if (error instanceof HttpErrorResponse) {
      return 'HTTP_ERROR';
    }
    if (error instanceof TypeError) {
      return 'TYPE_ERROR';
    }
    if (error.name) {
      return error.name;
    }
    return 'UNKNOWN_ERROR';
  }

  private buildErrorContext(): any {
    return {
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      online: navigator.onLine,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };
  }
}
