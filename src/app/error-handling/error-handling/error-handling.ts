import { Component, inject } from '@angular/core';
import type { ApplicationError } from '../global-error-handling.store';
import { errorStore } from '../global-error-handling.store';

@Component({
  selector: 'app-error-handling',
  imports: [],
  templateUrl: './error-handling.html',
  styleUrl: './error-handling.scss',
})
export class ErrorHandling {
  public readonly errorStore = inject(errorStore);

  public recentErrors = this.errorStore.getRecentErrors;

  public dismissError(errorId: string): void {
    this.errorStore.dismissError(errorId);
  }

  public dismissModal(): void {
    this.errorStore.closeErrorModal();
  }

  public refreshPage(): void {
    window.location.reload();
  }

  public getUserFriendlyMessage(error: ApplicationError): string {
    const messages = {
      'Network Error': 'Connection issue detected',
      'Permission Error': 'Access denied',
      'Validation Error': 'Please check your input',
      'JavaScript Error': 'Something went wrong',
      'Unknown Error': 'Unexpected error occurred',
    };
    return messages[error.errorType as keyof typeof messages] || 'An error occurred';
  }

  public getNetworkStatusMessage(): string {
    const status = this.errorStore.networkStatus();
    return status === 'offline' ? 'You are offline' : 'Connection unstable';
  }
}
