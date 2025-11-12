import { Component, inject, signal } from '@angular/core';
import type { FormGroup } from '@angular/forms';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth';
import type { ApiError } from '../../../models/api-error.model';
import { ErrorMessage } from '../../../ui-components/error-message/error-message';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, ErrorMessage],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  protected form: FormGroup;
  protected hide = signal<boolean>(true);
  protected loading = signal<boolean>(false);
  protected error = signal<ApiError | null>(null);

  private readonly supabase = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly MIN_PASSWORD_LENGTH = 6;

  constructor() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(this.MIN_PASSWORD_LENGTH)]],
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
        throw error;
      } else {
        await this.router.navigate(['/dashboard/']);
      }
    } catch (error) {
      this.loading.set(false);
      throw error;
    }
  }

  private getFieldDisplayName(fieldName: string): string {
    const names: Record<string, string> = {
      email: 'Email',
      password: 'Password',
    };
    return names[fieldName] || fieldName;
  }
}
