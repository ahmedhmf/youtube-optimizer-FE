import { Component, inject, signal } from '@angular/core';
import { userProfileStore } from '../../../../stores/dashboard/user-profile.store';
import { DatePipe } from '@angular/common';
import { ResetPasswordModal } from '../../../../ui-components/reset-password-modal/reset-password-modal';

@Component({
  selector: 'app-profile',
  imports: [DatePipe, ResetPasswordModal],
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
