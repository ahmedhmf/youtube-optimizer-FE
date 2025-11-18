import type { ElementRef, AfterViewInit } from '@angular/core';
import { Component, inject, signal, ViewChild } from '@angular/core';
import type { FormGroup } from '@angular/forms';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { JwtAuthService } from '../../../services/jwt-auth.service';
import type { ApiError } from '../../../models/api-error.model';
import { ErrorMessage } from '../../../ui-components/error-message/error-message';
import { errorCodes } from '../../../error-handling/error-codes.constants';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, ErrorMessage, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements AfterViewInit {
  @ViewChild('googleButtonContainer', { static: false })
  protected googleButtonContainer?: ElementRef<HTMLElement>;

  protected form: FormGroup;
  protected hide = signal<boolean>(true);
  protected loading = signal<boolean>(false);
  protected socialLoginLoading = signal<boolean>(false);
  protected error = signal<ApiError | null>(null);

  private readonly jwtAuthService = inject(JwtAuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly MIN_PASSWORD_LENGTH = 6;

  constructor() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(this.MIN_PASSWORD_LENGTH)]],
    });
  }

  public ngAfterViewInit(): void {
    if (
      this.socialLoginAvailable() &&
      this.availableProviders().includes('google') &&
      this.googleButtonContainer
    ) {
      void this.jwtAuthService.renderGoogleButton(this.googleButtonContainer.nativeElement);
    }
  }

  protected socialLoginAvailable(): boolean {
    return this.jwtAuthService.isSocialLoginAvailable();
  }

  protected availableProviders(): string[] {
    return this.jwtAuthService.getAvailableProviders();
  }

  protected signInWithGoogle(): void {
    // Google sign-in is handled by the rendered button
    // This method can be used for manual Google sign-in if needed
  }

  protected signInWithGitHub(): void {
    this.socialLoginLoading.set(true);
    this.error.set(null);

    this.jwtAuthService.signInWithGitHub().subscribe({
      next: (user) => {
        this.socialLoginLoading.set(false);
        console.log('GitHub sign-in successful:', user);
        void this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.socialLoginLoading.set(false);
        this.error.set({
          message: error.error?.message ?? 'GitHub sign-in failed. Please try again.',
          code: error.status ?? errorCodes.internalServerError,
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

    // 🔍 Debug what we're sending
    console.log('🔍 Sending login request:', {
      email: credentials.email,
      password: credentials.password ? '[PROVIDED]' : '[MISSING]',
      formValid: this.form.valid,
    });

    this.jwtAuthService.login(credentials).subscribe({
      next: (response) => {
        this.loading.set(false);
        console.log('✅ Login successful:', response.user);
        void this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.loading.set(false);

        // 🔍 Debug the actual error
        console.error('❌ Login failed details:', {
          status: error.status,
          statusText: error.statusText,
          errorBody: error.error,
          message: error.error?.message,
          headers: error.headers,
        });

        this.error.set({
          message: error.error?.message ?? 'Login failed. Please check your credentials.',
          code: error.status ?? errorCodes.internalServerError,
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
