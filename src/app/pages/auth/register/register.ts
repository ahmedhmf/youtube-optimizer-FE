import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { ApiError } from '../../../models/api-error.model';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private supabase = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  protected form: FormGroup;
  protected hidePassword = signal<boolean>(true);
  protected hideConfirm = signal<boolean>(true);
  protected loading = signal<boolean>(false);
  protected error = signal<ApiError | null>(null);

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      terms: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      // Clear the passwordMismatch error if passwords now match
      if (confirmPassword?.hasError('passwordMismatch')) {
        const errors = confirmPassword.errors;
        delete errors!['passwordMismatch'];
        confirmPassword.setErrors(Object.keys(errors!).length ? errors : null);
      }
    }
    return null;
  }

  protected hasFieldError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.errors && field.touched);
  }

  protected async signUp(): Promise<void> {
    // Mark all fields as touched to show validation errors
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    this.loading.set(true);

    try {
      const { error } = await this.supabase.client.auth.signUp({
        email: this.form.value.email,
        password: this.form.value.password,
        options: {
          data: {
            display_name: this.form.value.name,
            name: this.form.value.name
          }
        }
      });

      this.loading.set(false);

      if (error) {
        const handledError = this.handleAuthError(error);
        this.error.set(handledError);
      } else {
        this.form.reset();
        this.router.navigate(['/login']);
      }
    } catch (error: any) {
      this.loading.set(false);
    }
  }

  protected getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field && field.errors && field.touched) {
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

  private getFieldDisplayName(fieldName: string): string {
    const names: { [key: string]: string } = {
      'name': 'Name',
      'email': 'Email',
      'password': 'Password',
      'confirmPassword': 'Confirm Password',
      'terms': 'Terms and Conditions'
    };
    return names[fieldName] || fieldName;
  }

  private handleAuthError(error: any): ApiError {
    const message = error.message?.toLowerCase() || '';

    if (message.includes('user already registered') || message.includes('email already exists')) {
      return {
        message: 'An account with this email already exists. Please use a different email or sign in instead.',
        code: 'EMAIL_ALREADY_EXISTS'
      };
    }

    if (message.includes('invalid email')) {
      return {
        message: 'Please enter a valid email address.',
        code: 'INVALID_EMAIL'
      };
    }

    if (message.includes('password') && message.includes('weak')) {
      return {
        message: 'Password is too weak. Please use at least 6 characters with a mix of letters, numbers, and symbols.',
        code: 'WEAK_PASSWORD'
      };
    }

    if (message.includes('too many requests')) {
      return {
        message: 'Too many registration attempts. Please wait a few minutes before trying again.',
        code: 'RATE_LIMIT_EXCEEDED'
      };
    }

    if (message.includes('network') || message.includes('fetch')) {
      return {
        message: 'Network error. Please check your internet connection and try again.',
        code: 'NETWORK_ERROR'
      };
    }

    if (message.includes('signup disabled')) {
      return {
        message: 'Account registration is currently disabled. Please contact support for assistance.',
        code: 'SIGNUP_DISABLED'
      };
    }
    return {
      message: error.message || 'Registration failed. Please try again.',
      code: 'REGISTRATION_ERROR'
    };
  }

}
