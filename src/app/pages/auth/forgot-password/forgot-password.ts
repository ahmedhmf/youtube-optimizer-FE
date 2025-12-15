import { Component, inject, signal } from '@angular/core';
import { type FormGroup, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import type { ApiError } from '../../../models/api-error.model';
import { ErrorMessage } from '../../../ui-components/error-message/error-message';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, ErrorMessage, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPasswordComponent {
  protected form: FormGroup;
  protected loading = signal<boolean>(false);
  protected error = signal<ApiError | null>(null);
  protected success = signal<boolean>(false);

  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  constructor() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  protected getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
    }
    return '';
  }

  protected hasFieldError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field?.errors && field.touched);
  }

  protected requestPasswordReset(): void {
    this.form.markAllAsTouched();
    this.error.set(null);
    this.success.set(false);

    if (this.form.invalid) {
      return;
    }

    this.loading.set(true);

    // const email = this.form.value.email;

    // this.authService.(email).subscribe({
    //   next: () => {
    //     this.loading.set(false);
    //     this.success.set(true);
    //     // Success - no console logging needed
    //   },
    //   error: (error) => {
    //     this.loading.set(false);
    //     this.error.set({
    //       message: error.error?.message ?? 'Failed to send password reset email. Please try again.',
    //       code: error.status ?? 500,
    //     });
    //   },
    // });
  }

  protected backToLogin(): void {
    void this.router.navigate(['/login']);
  }

  private getFieldDisplayName(fieldName: string): string {
    const names: Record<string, string> = {
      email: 'Email',
    };
    return names[fieldName] || fieldName;
  }
}
