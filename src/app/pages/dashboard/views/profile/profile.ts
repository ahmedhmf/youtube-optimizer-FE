import { Component, inject, signal } from '@angular/core';
import { userProfileStore } from '../../../../stores/dashboard/user-profile.store';
import { DatePipe } from '@angular/common';
import { ResetPasswordModal } from './reset-password-modal/reset-password-modal';
import { AiPreferencesComponent } from './ai-preferences/ai-preferences';

@Component({
  selector: 'app-profile',
  imports: [DatePipe, ResetPasswordModal, AiPreferencesComponent],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  protected readonly store = inject(userProfileStore);
  protected readonly showResetPasswordModal = signal(false);

  protected openResetPasswordModal(): void {
    this.showResetPasswordModal.set(true);
  }

  protected closeResetPasswordModal(): void {
    this.showResetPasswordModal.set(false);
  }
}
