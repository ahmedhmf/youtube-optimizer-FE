import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  imports: [
    CommonModule,
    MatCard,
    MatButton,
    MatInput,
    MatFormField,
    MatIcon,
    MatLabel,
    MatError,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Register {
  private supabase = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  protected hidePassword = true;
  protected hideConfirm = true;
  protected loading = false;
  protected form: FormGroup;
  protected message = '';

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: this.passwordMatchValidator });
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
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

  // Helper methods to get error messages
  getFieldError(fieldName: string): string {
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
    }
    return '';
  }

  getFieldDisplayName(fieldName: string): string {
    const names: { [key: string]: string } = {
      'name': 'Name',
      'email': 'Email',
      'password': 'Password',
      'confirmPassword': 'Confirm Password'
    };
    return names[fieldName] || fieldName;
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.errors && field.touched);
  }

  async signUp(): Promise<void> {
    // Mark all fields as touched to show validation errors
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.snackBar.open('Please fix the errors below and try again', 'Close', {
        duration: 4000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.loading = true;
    this.message = '';

    try {
      const { error } = await this.supabase.client.auth.signUp({
        email: this.form.value.email,
        password: this.form.value.password,
        options: {
          data: {
            name: this.form.value.name
          }
        }
      });

      this.loading = false;

      if (error) {
        this.message = error.message;
        this.snackBar.open(`Registration failed: ${error.message}`, 'Close', {
          duration: 6000,
          panelClass: ['error-snackbar']
        });
      } else {
        // Show success notification
        this.snackBar.open(
          '🎉 Registration successful! Please check your email to verify your account.',
          'Close',
          {
            duration: 8000,
            panelClass: ['success-snackbar']
          }
        );

        this.form.reset();
        this.router.navigate(['/login']);
      }
    } catch (error: any) {
      this.loading = false;
      this.snackBar.open(`An unexpected error occurred: ${error.message}`, 'Close', {
        duration: 6000,
        panelClass: ['error-snackbar']
      });
    }
  }
}
