import { Component, inject, signal } from '@angular/core';
import type { FormGroup } from '@angular/forms';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth';
import type { ApiError } from '../../../models/api-error.model';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  protected form: FormGroup;
  protected hidePassword = signal<boolean>(true);
  protected hideConfirm = signal<boolean>(true);
  protected loading = signal<boolean>(false);
  protected error = signal<ApiError | null>(null);

  private readonly supabase = inject(AuthService);
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
            name: this.form.value.name,
          },
        },
      });

      this.loading.set(false);

      if (error) {
        throw error;
      } else {
        this.form.reset();
        void this.router.navigate(['/login']);
      }
    } catch (error) {
      this.loading.set(false);
      throw error;
    }
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
}
