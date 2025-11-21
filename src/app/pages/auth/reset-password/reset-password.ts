import { Component, inject, signal, type OnInit } from '@angular/core';
import { type FormGroup, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import type { ApiError } from '../../../models/api-error.model';
import { ErrorMessage } from '../../../ui-components/error-message/error-message';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, ErrorMessage, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPasswordComponent implements OnInit {
  protected form: FormGroup;
  protected loading = signal<boolean>(false);
  protected error = signal<ApiError | null>(null);
  protected success = signal<boolean>(false);
  protected hidePassword = signal<boolean>(true);
  protected hideConfirmPassword = signal<boolean>(true);
  protected token = signal<string>('');

  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly MIN_PASSWORD_LENGTH = 6;
  private readonly DEFAULT_ERROR_CODE = 500;

  constructor() {
    this.form = this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(this.MIN_PASSWORD_LENGTH)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  public ngOnInit(): void {
    // Get the reset token from query parameters
    this.route.queryParams.subscribe((params) => {
      const token = params['token'];
      if (!token) {
        this.error.set({
          message: 'Invalid or missing reset token. Please request a new password reset.',
          code: '400',
        });
      } else {
        this.token.set(token);
      }
    });
  }

  protected passwordMatchValidator(form: FormGroup): { passwordMismatch: boolean } | null {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  protected getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field?.errors || !field.touched) {
      return this.getPasswordMismatchError(fieldName, field);
    }

    if (field.errors['required']) {
      return `${this.getFieldDisplayName(fieldName)} is required`;
    }
    if (field.errors['minlength']) {
      return `${this.getFieldDisplayName(fieldName)} must be at least ${this.MIN_PASSWORD_LENGTH} characters long`;
    }

    return this.getPasswordMismatchError(fieldName, field);
  }

  protected hasFieldError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    const hasFieldError = !!(field?.errors && field.touched);

    // Check form-level password match error for confirmPassword field
    if (
      fieldName === 'confirmPassword' &&
      this.form.errors?.['passwordMismatch'] &&
      field?.touched
    ) {
      return true;
    }

    return hasFieldError;
  }

  protected togglePasswordVisibility(): void {
    this.hidePassword.set(!this.hidePassword());
  }

  protected toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword.set(!this.hideConfirmPassword());
  }

  protected resetPassword(): void {
    this.form.markAllAsTouched();
    this.error.set(null);
    this.success.set(false);

    if (this.form.invalid || !this.token()) {
      return;
    }

    this.loading.set(true);

    const newPassword = this.form.value.password;
    const resetToken = this.token();

    // this.authService.resetPassword(resetToken, newPassword).subscribe({
    //   next: () => {
    //     this.loading.set(false);
    //     this.success.set(true);
    //   },
    //   error: (error) => {
    //     this.loading.set(false);
    //     this.error.set({
    //       message:
    //         error.error?.message ??
    //         'Failed to reset password. The token may be expired or invalid.',
    //       code: error.status ?? this.DEFAULT_ERROR_CODE,
    //     });
    //   },
    // });
  }

  protected backToLogin(): void {
    void this.router.navigate(['/login']);
  }

  private getPasswordMismatchError(fieldName: string, field: unknown): string {
    if (fieldName === 'confirmPassword' && this.form.errors?.['passwordMismatch'] && field) {
      return 'Passwords do not match';
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const names: Record<string, string> = {
      password: 'Password',
      confirmPassword: 'Confirm Password',
    };
    return names[fieldName] ?? fieldName;
  }
}
