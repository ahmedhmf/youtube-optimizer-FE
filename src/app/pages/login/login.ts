import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class LoginPageComponent {
  private supabase = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  protected hide = true;
  protected message = '';
  protected loading = false;
  protected form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
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
    }
    return '';
  }

  getFieldDisplayName(fieldName: string): string {
    const names: { [key: string]: string } = {
      'email': 'Email',
      'password': 'Password'
    };
    return names[fieldName] || fieldName;
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.errors && field.touched);
  }

  async login() {
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
      const { data, error } = await this.supabase.client.auth.signInWithPassword({
        email: this.form.value.email,
        password: this.form.value.password,
      });

      this.loading = false;

      if (error) {
        this.message = error.message;
        this.snackBar.open(`Login failed: ${error.message}`, 'Close', {
          duration: 6000,
          panelClass: ['error-snackbar']
        });
      } else {
        // Show success notification
        this.snackBar.open(
          '🎉 Welcome back! You have successfully logged in.',
          'Close',
          {
            duration: 4000,
            panelClass: ['success-snackbar']
          }
        );
        this.router.navigate(['/']);
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
