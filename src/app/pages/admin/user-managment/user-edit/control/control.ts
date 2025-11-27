import { Component, inject } from '@angular/core';
import { AdminUserService } from '../../../../../services/admin/admin-user.service';
import { userEditStore } from '../../../../../stores/admin/user-edit.store';

@Component({
  selector: 'app-control',
  imports: [],
  templateUrl: './control.html',
  styleUrl: './control.scss',
})
export class Control {
  protected readonly store = inject(userEditStore);
  private readonly adminUserService = inject(AdminUserService);

  public resetLimits(): void {
    // TODO: Add confirmation UI in template instead of inline confirmation
    // this.http
    //   .post(`${environment.backendURL}/api/v1/admin/users/${this.store.user().id}/reset-limits`, {})
    //   .subscribe({
    //     next: () => {
    //       this.showSuccess('Limits reset successfully');
    //       this.loadUsageData(this.store.user().id);
    //     },
    //     error: (error: HttpErrorResponse) => {
    //       this.store.setErrorMessage(error.error?.message ?? 'Failed to reset limits');
    //     },
    //   });
  }

  public giveBonusCredits(): void {
    // if (this.store.bonusCredits() <= 0) {
    //   return;
    // }
    //   this.http
    //     .post(`${environment.backendURL}/api/v1/admin/users/${this.store.user().id}/bonus-credits`, {
    //       credits: this.bonusCredits,
    //     })
    //     .subscribe({
    //       next: () => {
    //         this.showSuccess(`Gave ${this.bonusCredits} bonus credits`);
    //         this.bonusCredits = 0;
    //         this.loadUsageData(this.store.user().id);
    //       },
    //       error: (error: HttpErrorResponse) => {
    //         this.store.setErrorMessage(error.error?.message ?? 'Failed to give bonus credits');
    //       },
    //     });
  }

  public suspendUser(): void {
    // if (!this.store.user()) {
    //   return;
    // }
    // // TODO: Add confirmation modal
    // this.http
    //   .post(`${environment.backendURL}/api/v1/admin/users/${this.store.user().id}/suspend`, {})
    //   .subscribe({
    //     next: () => {
    //       this.showSuccess('User suspended successfully');
    //       if (this.store.user()) {
    //         this.store.setUserData({ ...this.store.user(), status: 'suspended' });
    //       }
    //     },
    //     error: (error: HttpErrorResponse) => {
    //       this.store.setErrorMessage(error.error?.message ?? 'Failed to suspend user');
    //     },
    //   });
  }

  public activateUser(): void {
    // if (!this.store.user()) {
    //   return;
    // }
    // this.http
    //   .post(`${environment.backendURL}/api/v1/admin/users/${this.store.user().id}/activate`, {})
    //   .subscribe({
    //     next: () => {
    //       this.showSuccess('User activated successfully');
    //       if (this.store.user()) {
    //         this.store.setUserData({ ...this.store.user(), status: 'active' });
    //       }
    //     },
    //     error: (error: HttpErrorResponse) => {
    //       this.store.setErrorMessage(error.error?.message ?? 'Failed to activate user');
    //     },
    //   });
  }

  public impersonateUser(): void {
    // TODO: Add confirmation modal
    // this.http
    //   .post<{
    //     token: string;
    //   }>(`${environment.backendURL}/api/v1/admin/users/${this.store.user().id}/impersonate`, {})
    //   .subscribe({
    //     next: (response) => {
    //       // Store impersonation token and redirect
    //       localStorage.setItem('impersonation_token', response.token);
    //       void this.router.navigate(['/dashboard']);
    //     },
    //     error: (error: HttpErrorResponse) => {
    //       this.store.setErrorMessage(error.error?.message ?? 'Failed to impersonate user');
    //     },
    //   });
  }
}
