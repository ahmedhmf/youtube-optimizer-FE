import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { ErrorHandlerService } from '../../../util/error-handler.service';
import { ApiError } from '../../../models/api-error.model';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private supabase = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  protected form: FormGroup;
  protected hide = signal<boolean>(true);
  protected loading = signal<boolean>(false);
  protected error = signal<ApiError | null>(null);

  constructor() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
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
    }
    return '';
  }

  protected hasFieldError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.errors && field.touched);
  }

  protected async login(): Promise<void> {
    this.form.markAllAsTouched();
    this.error.set(null);

    this.loading.set(true);

    try {
      const { error } = await this.supabase.client.auth.signInWithPassword({
        email: this.form.value.email,
        password: this.form.value.password,
      });

      this.loading.set(false);

      if (error) {
        const handledError = this.handleAuthError(error);
        this.error.set(handledError);
      } else {
        this.router.navigate(['/dashboard/']);
      }
    } catch (error: any) {
      this.loading.set(false);
    }
  }

  private getFieldDisplayName(fieldName: string): string {
    const names: { [key: string]: string } = {
      'email': 'Email',
      'password': 'Password'
    };
    return names[fieldName] || fieldName;
  }

  private handleAuthError(error: any): ApiError {
    // Handle specific Supabase auth error messages
    const message = error.message?.toLowerCase() || '';

    if (message.includes('invalid login credentials') || message.includes('invalid_credentials')) {
      return {
        message: 'Invalid email or password. Please check your credentials and try again.',
        code: 'INVALID_CREDENTIALS'
      };
    }

    if (message.includes('email not confirmed')) {
      return {
        message: 'Please check your email and click the confirmation link before signing in.',
        code: 'EMAIL_NOT_CONFIRMED'
      };
    }

    if (message.includes('user not found')) {
      return {
        message: 'No account found with this email address. Please sign up first.',
        code: 'USER_NOT_FOUND'
      };
    }

    if (message.includes('too many requests')) {
      return {
        message: 'Too many login attempts. Please wait a few minutes before trying again.',
        code: 'RATE_LIMIT_EXCEEDED'
      };
    }

    if (message.includes('network') || message.includes('fetch')) {
      return {
        message: 'Network error. Please check your internet connection and try again.',
        code: 'NETWORK_ERROR'
      };
    }

    // Default error handling
    return {
      message: error.message || 'Login failed. Please try again.',
      code: 'AUTH_ERROR'
    };
  }
}
