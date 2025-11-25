import type { OnInit } from '@angular/core';
import { Component, inject } from '@angular/core';
import type { UserData } from '../../../../../models/admin/user.type';
import { AdminUserService } from '../../../../../services/admin/admin-user.service';
import { userEditStore } from '../../../../../stores/admin/user-edit.store';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-monitoring',
  imports: [DecimalPipe, DatePipe],
  templateUrl: './monitoring.html',
  styleUrl: './monitoring.scss',
})
export class Monitoring implements OnInit {
  protected readonly store = inject(userEditStore);
  private readonly adminUserService = inject(AdminUserService);

  public ngOnInit(): void {
    this.adminUserService.getUserUsage(this.store.user().id).subscribe({
      next: (usage) => {
        this.store.setUserUsage(usage.data);
        this.store.setSuccessMessage(usage.message);
      },
      error: (error) => {
        this.store.setErrorMessage(error.error?.message ?? 'Failed to load user usage');
      },
    });
  }

  public startEdit(field: string): void {
    this.store.setEditModeForField(field, true);
    const key = field as keyof UserData;
    const value = this.store.user()[key];
    this.store.setEditValueForField(key, value as never);
  }

  public cancelEdit(field: string): void {
    this.store.setEditModeForField(field, false);
    const key = field as keyof UserData;
    this.store.setEditValueForField(key, undefined as never);
  }

  public saveField(field: string): void {
    // const value = this.store.editValues()[field as keyof UserData];
    this.store.setIsSaving(true);

    // this.http
    //   .patch<UserData>(`${environment.backendURL}/admin/users/${this.store.user().id}`, {
    //     [field]: value,
    //   })
    //   .subscribe({
    //     next: (updated) => {
    //       this.store.setUserData(updated);
    //       this.editMode[field] = false;
    //       this.showSuccess(`${field} updated successfully`);
    //       this.store.setIsSaving(false);
    //     },
    //     error: (error: HttpErrorResponse) => {
    //       this.store.setErrorMessage(error.error?.message ?? `Failed to update ${field}`);
    //       this.store.setIsSaving(false);
    //     },
    //   });
  }

  public rerunAnalysis(videoId: string): void {
    if (!this.store.user()) {
    }

    // this.http
    //   .post(`${environment.backendURL}/admin/users/${this.store.user().id}/rerun/${videoId}`, {})
    //   .subscribe({
    //     next: () => {
    //       this.showSuccess('Video analysis rerun successfully');
    //       this.loadVideoHistory(this.store.user().id);
    //     },
    //     error: (error: HttpErrorResponse) => {
    //       this.store.setErrorMessage(error.error?.message ?? 'Failed to rerun analysis');
    //     },
    //   });
  }
}
