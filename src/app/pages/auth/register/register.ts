import { Component, inject, signal } from '@angular/core';
import type { FormGroup } from '@angular/forms';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import type { ApiError } from '../../../models/api-error.model';
import { AuthService } from '../../../services/auth/auth.service';
import type { RegisterRequest } from '../../../models/auth/register-request.type';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
  standalone: true,
})
export class Register {
  protected form: FormGroup;
  protected loading = signal<boolean>(false);
  protected error = signal<ApiError | null>(null);
  protected socialLoginLoading = signal<boolean>(false);

  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly MIN_PASSWORD_LENGTH = 6;
  private readonly MIN_NAME_LENGTH = 2;

  constructor() {
    this.form = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(this.MIN_NAME_LENGTH)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(this.MIN_PASSWORD_LENGTH)]],
        confirmPassword: ['', [Validators.required]],
        terms: [false, [Validators.requiredTrue]],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  protected hasFieldError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field?.errors && field.touched);
  }

  protected signUp(): void {
    // Mark all fields as touched to show validation errors
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    this.loading.set(true);

    const userData: RegisterRequest = {
      email: this.form.value.email,
      password: this.form.value.password,
      firstName: this.form.value.name,
      lastName: this.form.value.name,
    };

    this.authService.register(userData).subscribe({
      next: () => {
        this.loading.set(false);
        this.form.reset();
        void this.router.navigate(['/dashboard']); // Login automatically after registration
      },
      error: (error: unknown) => {
        this.loading.set(false);
        const errorResponse = error as { error?: { message?: string }; status?: number };
        const DEFAULT_ERROR_CODE = 500;
        this.error.set({
          message: errorResponse.error?.message ?? 'Registration failed. Please try again.',
          code: (errorResponse.status ?? DEFAULT_ERROR_CODE).toString(),
        });
      },
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
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `${this.getFieldDisplayName(fieldName)} must be at least ${requiredLength} characters`;
      }
      if (field.errors['passwordMismatch']) {
        return 'Passwords do not match';
      }
      if (field.errors['required'] && fieldName === 'terms') {
        return 'You must agree to the Terms of Service and Privacy Policy';
      }
    }
    return '';
  }

  protected socialLoginAvailable(): boolean {
    // return this.authService.isSocialLoginAvailable();
    return false;
  }

  protected availableProviders(): string[] {
    // return this.authService.getAvailableProviders();
    return [];
  }

  protected signInWithGoogle(): void {
    // Google sign-in is handled by the rendered button
    // This method can be used for manual Google sign-in if needed
  }

  protected signInWithGitHub(): void {
    this.socialLoginLoading.set(true);
    this.error.set(null);

    // this.jwtAuthService.signInWithGitHub().subscribe({
    //   next: (user) => {
    //     this.socialLoginLoading.set(false);
    //     console.log('GitHub sign-in successful:', user);
    //     void this.router.navigate(['/dashboard']);
    //   },
    //   error: (error) => {
    //     this.socialLoginLoading.set(false);
    //     this.error.set({
    //       message: error.error?.message || 'GitHub sign-in failed. Please try again.',
    //       code: error.status || 500,
    //     });
    //   },
    // });
  }

  private getFieldDisplayName(fieldName: string): string {
    const names: Record<string, string> = {
      name: 'Name',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      terms: 'Terms and Conditions',
    };
    return names[fieldName] || fieldName;
  }

  private passwordMatchValidator(form: FormGroup): Record<string, boolean> | null {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      // Clear the passwordMismatch error if passwords now match
      if (confirmPassword?.hasError('passwordMismatch')) {
        const errors = confirmPassword.errors;
        if (errors) {
          delete errors['passwordMismatch'];
          confirmPassword.setErrors(Object.keys(errors).length ? errors : null);
        }
      }
    }
    return null;
  }

  // Social login methods
}
