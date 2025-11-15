import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { HTTP_401_ERROR_MESSAGES } from '../constants/http-errors.constants';

export type ErrorType =
  | 'JavaScript Error' // Uncaught JS errors
  | 'Network Error' // Connection issues
  | 'Chunk Load Error' // App loading issues
  | 'Permission Error' // Auth/authorization
  | 'Validation Error' // Form validation
  | 'Business Logic Error' // Login, register, API errors
  | 'Unknown Error';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ErrorCategory = 'system' | 'business' | 'user' | 'component';

export type ApplicationError = {
  readonly id: string;
  readonly message: string;
  readonly stack?: string;
  readonly timestamp: string;
  readonly url: string;
  readonly userId?: string;
  readonly errorType: ErrorType;
  readonly severity: ErrorSeverity;
  readonly category: ErrorCategory;
  readonly dismissed: boolean;
  readonly retryCount: number;
  readonly context?: Record<string, unknown>; // Additional context
  readonly statusCode?: number; // HTTP status codes
};

export type ErrorState = {
  readonly errors: ApplicationError[];
  readonly criticalErrors: ApplicationError[];
  readonly businessErrors: ApplicationError[]; // Login, register, etc.
  readonly networkStatus: 'online' | 'offline' | 'unstable';
  readonly lastErrorTime: string | null;
  readonly errorCount: number;
  readonly showErrorModal: boolean;
  readonly showToast: boolean;
  readonly batchReportQueue: ApplicationError[];
};

const initialState: ErrorState = {
  errors: [],
  criticalErrors: [],
  businessErrors: [],
  networkStatus: 'online',
  lastErrorTime: null,
  errorCount: 0,
  showErrorModal: false,
  showToast: false,
  batchReportQueue: [],
};

export const errorStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    /**
     * Add a system error (uncaught JS errors)
     */
    addSystemError(
      error: Omit<ApplicationError, 'id' | 'dismissed' | 'retryCount' | 'category'>,
    ): void {
      const newError: ApplicationError = {
        ...error,
        id: crypto.randomUUID(),
        dismissed: false,
        retryCount: 0,
        category: 'system',
      };

      patchState(store, (state) => ({
        errors: [newError, ...state.errors],
        criticalErrors:
          newError.severity === 'critical'
            ? [newError, ...state.criticalErrors]
            : state.criticalErrors,
        lastErrorTime: newError.timestamp,
        errorCount: state.errorCount + 1,
        showErrorModal: newError.severity === 'critical',
      }));
    },

    /**
     * Add a business logic error (login, register, API calls)
     */
    addBusinessError(
      message: string,
      context?: {
        action?: string;
        statusCode?: number;
        endpoint?: string;
        params?: Record<string, unknown>;
      },
    ): void {
      const newError: ApplicationError = {
        id: crypto.randomUUID(),
        message,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        errorType: 'Business Logic Error',
        severity: context?.statusCode === HTTP_401_ERROR_MESSAGES ? 'high' : 'medium',
        category: 'business',
        dismissed: false,
        retryCount: 0,
        context,
        statusCode: context?.statusCode,
      };

      patchState(store, (state) => ({
        errors: [newError, ...state.errors],
        businessErrors: [newError, ...state.businessErrors],
        lastErrorTime: newError.timestamp,
        errorCount: state.errorCount + 1,
        showToast: true,
      }));
    },

    /**
     * Add a user input error (validation, form errors)
     */
    addUserError(message: string, field?: string, formName?: string): void {
      const newError: ApplicationError = {
        id: crypto.randomUUID(),
        message,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        errorType: 'Validation Error',
        severity: 'low',
        category: 'user',
        dismissed: false,
        retryCount: 0,
        context: { field, formName },
      };

      patchState(store, (state) => ({
        errors: [newError, ...state.errors],
        lastErrorTime: newError.timestamp,
        errorCount: state.errorCount + 1,
      }));
    },

    /**
     * Clear business errors (useful after successful operations)
     */
    clearBusinessErrors(): void {
      patchState(store, (state) => ({
        businessErrors: [],
        errors: state.errors.filter((error) => error.category !== 'business'),
      }));
    },

    /**
     * Get errors by category
     */
    getErrorsByCategory(category: ErrorCategory): ApplicationError[] {
      return store.errors().filter((error) => error.category === category);
    },

    /**
     * Get errors by action (e.g., 'login', 'register')
     */
    getErrorsByAction(action: string): ApplicationError[] {
      return store
        .errors()
        .filter(
          (error) =>
            error.context &&
            typeof error.context === 'object' &&
            'action' in error.context &&
            error.context['action'] === action,
        );
    },

    /**
     * Add a new error to the store
     */
    addError(error: Omit<ApplicationError, 'id' | 'dismissed' | 'retryCount'>): void {
      const newError: ApplicationError = {
        ...error,
        id: crypto.randomUUID(),
        dismissed: false,
        retryCount: 0,
      };

      patchState(store, (state) => ({
        errors: [newError, ...state.errors],
        criticalErrors:
          newError.severity === 'critical'
            ? [newError, ...state.criticalErrors]
            : state.criticalErrors,
        lastErrorTime: newError.timestamp,
        errorCount: state.errorCount + 1,
        showErrorModal: newError.severity === 'critical',
        batchReportQueue:
          newError.severity !== 'critical'
            ? [...state.batchReportQueue, newError]
            : state.batchReportQueue,
      }));
    },

    /**
     * Clear all dismissed errors
     */
    clearDismissedErrors(): void {
      patchState(store, (state) => ({
        errors: state.errors.filter((error) => !error.dismissed),
      }));
    },

    /**
     * Update network status
     */
    setNetworkStatus(status: ErrorState['networkStatus']): void {
      patchState(store, { networkStatus: status });
    },

    /**
     * Increment retry count for an error
     */
    incrementRetryCount(errorId: string): void {
      patchState(store, (state) => ({
        errors: state.errors.map((error) =>
          error.id === errorId ? { ...error, retryCount: error.retryCount + 1 } : error,
        ),
      }));
    },

    /**
     * Clear the batch report queue
     */
    clearBatchQueue(): void {
      patchState(store, { batchReportQueue: [] });
    },

    /**
     * Close error modal
     */
    closeErrorModal(): void {
      patchState(store, { showErrorModal: false });
    },

    /**
     * Get errors by type
     */
    getErrorsByType(errorType: ErrorType): ApplicationError[] {
      return store.errors().filter((error) => error.errorType === errorType);
    },

    /**
     * Get recent errors (last hour)
     */
    getRecentErrors(): ApplicationError[] {
      const oneHourMilliseconds = 3600000;
      const oneHourAgo = new Date(Date.now() - oneHourMilliseconds).toISOString();
      return store.errors().filter((error) => error.timestamp > oneHourAgo);
    },

    /**
     * Clear all errors
     */
    clearAllErrors(): void {
      patchState(store, {
        errors: [],
        criticalErrors: [],
        errorCount: 0,
        batchReportQueue: [],
        showErrorModal: false,
      });
    },
    dismissError(errorId: string): void {
      patchState(store, (state) => ({
        errors: state.errors.map((error) =>
          error.id === errorId ? { ...error, dismissed: true } : error,
        ),
        businessErrors: state.businessErrors.filter((error) => error.id !== errorId),
        criticalErrors: state.criticalErrors.filter((error) => error.id !== errorId),
        showToast: false,
      }));
    },

    hideToast(): void {
      patchState(store, { showToast: false });
    },
  })),
);
