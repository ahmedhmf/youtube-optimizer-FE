import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Validators, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-profile',
  imports: [
    MatCard,
    MatFormField,
    MatInput,
    MatButton,
    MatIcon,
    MatDivider,
    MatLabel,
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  user = {
    name: 'John Doe',
    email: 'john@example.com',
    plan: 'Pro Plan',
  };

  planDescription = 'Unlimited video analyses, AI suggestions, and thumbnail prompts.';

  accountForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.accountForm = this.fb.group({
      name: [this.user.name, [Validators.required]],
      email: [this.user.email, [Validators.required, Validators.email]],
    });
  }

  updateProfile() {
    if (this.accountForm.invalid) return;
    console.log('Updated profile:', this.accountForm.value);
  }

  changePassword() {
    console.log('Password change flow');
  }

  logout() {
    console.log('Logging out...');
    // Later integrate Supabase Auth logout
  }
}