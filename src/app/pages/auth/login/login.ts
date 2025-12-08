import { Component, inject, signal } from '@angular/core';
import type { FormGroup } from '@angular/forms';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { take, filter } from 'rxjs/operators';
import type { ApiError } from '../../../models/api-error.model';
import { errorCodes } from '../../../error-handling/error-codes.constants';
import { AuthService } from '../../../services/auth/auth.service';
import { SocialAuthService } from '../../../services/auth/social-auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  standalone: true,
})
export class Login {
  protected form: FormGroup;
  protected hide = signal<boolean>(true);
  protected loading = signal<boolean>(false);
  protected socialLoginLoading = signal<boolean>(false);
  protected error = signal<ApiError | null>(null);

  private readonly authService = inject(AuthService);
  private readonly socialAuthService = inject(SocialAuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly MIN_PASSWORD_LENGTH = 6;

  constructor() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  protected socialLoginAvailable(): boolean {
    return this.socialAuthService.isSocialLoginAvailable();
  }

  protected availableProviders(): string[] {
    return this.socialAuthService.getAvailableProviders();
  }

  protected signInWithGoogle(): void {
    // Initiate server-side OAuth redirect
    this.socialLoginLoading.set(true);
    this.error.set(null);

    this.socialAuthService.initiateGoogleOAuth().catch((err) => {
      this.socialLoginLoading.set(false);
      this.error.set({
        message: 'Failed to start Google authentication. Please try again.',
        code: String(errorCodes.internalServerError),
      });
    });
  }

  protected signInWithGitHub(): void {
    this.socialLoginLoading.set(true);
    this.error.set(null);
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
    }
    return '';
  }

  protected hasFieldError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field?.errors && field.touched);
  }

  protected login(): void {
    this.form.markAllAsTouched();
    this.error.set(null);

    if (this.form.invalid) {
      return;
    }

    this.loading.set(true);

    const credentials = {
      email: this.form.value.email,
      password: this.form.value.password,
    };

    this.authService.login(credentials).subscribe({
      next: () => {
        this.loading.set(false);

        // Wait for auth state to be true, then navigate
        this.authService
          .getAuthenticationStatus()
          .pipe(
            filter((isAuthenticated) => isAuthenticated),
            take(1),
          )
          .subscribe(() => {
            void this.router.navigate(['/dashboard']);
          });
      },
      error: (error) => {
        this.loading.set(false);

        this.error.set({
          message: error.error?.message ?? 'Login failed. Please check your credentials.',
          code: String(error.status ?? errorCodes.internalServerError),
        });
      },
    });
  }

  private getFieldDisplayName(fieldName: string): string {
    const names: Record<string, string> = {
      email: 'Email',
      password: 'Password',
    };
    return names[fieldName] || fieldName;
  }
}
