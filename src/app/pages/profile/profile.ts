import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-profile',
  imports: [
    MatCard,
    MatFormField,
    MatInput,
    MatButton,
    MatDivider,
    MatLabel,
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Profile {
  private fb=inject(FormBuilder);

  protected user = {
    name: 'John Doe',
    email: 'john@example.com',
    plan: 'Pro Plan',
  };
  protected planDescription = 'Unlimited video analyses, AI suggestions, and thumbnail prompts.';
  protected accountForm: FormGroup;

  constructor() {
    this.accountForm = this.fb.group({
      name: [this.user.name, [Validators.required]],
      email: [this.user.email, [Validators.required, Validators.email]],
    });
  }

  updateProfile(): void {
    if (this.accountForm.invalid) {return;}
    console.log('Updated profile:', this.accountForm.value);
  }

  changePassword(): void {
    console.log('Password change flow');
  }

  logout(): void {
    console.log('Logging out...');
    // Todo: integrate Supabase Auth logout
  }
}