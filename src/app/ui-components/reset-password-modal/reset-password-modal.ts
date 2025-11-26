import { Component, EventEmitter, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { catchError, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { CsrfService } from '../../services/auth/csrf.service';
import type { ResetPasswordResponse } from '../../models/auth/reset-password-request.type';

@Component({
  selector: 'app-reset-password-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password-modal.html',
  styleUrl: './reset-password-modal.scss',
})
export class ResetPasswordModal {
  private static readonly MIN_PASSWORD_LENGTH = 8;
  private static readonly SUCCESS_CLOSE_DELAY = 2000;

  @Output() public readonly closeModal = new EventEmitter<void>();

  protected readonly currentPassword = signal('');
  protected readonly newPassword = signal('');
  protected readonly confirmPassword = signal('');
  protected readonly showCurrentPassword = signal(false);
  protected readonly showNewPassword = signal(false);
  protected readonly showConfirmPassword = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');

  private readonly http = inject(HttpClient);
  private readonly csrfService = inject(CsrfService);

  protected onClose(): void {
    this.closeModal.emit();
  }

  protected toggleCurrentPasswordVisibility(): void {
    this.showCurrentPassword.set(!this.showCurrentPassword());
  }

  protected toggleNewPasswordVisibility(): void {
    this.showNewPassword.set(!this.showNewPassword());
  }

  protected toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  protected onSubmit(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    // Validation
    if (!this.currentPassword() || !this.newPassword() || !this.confirmPassword()) {
      this.errorMessage.set('All fields are required');
      return;
    }

    if (this.newPassword().length < ResetPasswordModal.MIN_PASSWORD_LENGTH) {
      this.errorMessage.set('New password must be at least 8 characters long');
      return;
    }

    if (this.newPassword() !== this.confirmPassword()) {
      this.errorMessage.set('New passwords do not match');
      return;
    }

    if (this.currentPassword() === this.newPassword()) {
      this.errorMessage.set('New password must be different from current password');
      return;
    }

    this.isLoading.set(true);

    this.csrfService
      .getToken()
      .pipe(
        switchMap((csrfToken) => {
          const headers = {
            'X-CSRF-Token': csrfToken,
          };

          return this.http.post<ResetPasswordResponse>(
            `${environment.backendURL}/auth/reset-password`,
            {
              currentPassword: this.currentPassword(),
              newPassword: this.newPassword(),
            },
            {
              headers,
              withCredentials: true,
            },
          );
        }),
        catchError((error) => {
          this.isLoading.set(false);
          const errorMsg = error.error?.message ?? 'Failed to reset password';
          this.errorMessage.set(errorMsg);
          return of(null);
        }),
      )
      .subscribe((response) => {
        if (response) {
          this.isLoading.set(false);
          this.successMessage.set('Password reset successfully!');
          this.currentPassword.set('');
          this.newPassword.set('');
          this.confirmPassword.set('');

          // Close modal after success
          setTimeout(() => {
            this.onClose();
          }, ResetPasswordModal.SUCCESS_CLOSE_DELAY);
        }
      });
  }
}
