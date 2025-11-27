import { Component, inject } from '@angular/core';
import { userEditStore } from '../../../../../stores/admin/user-edit.store';
import { AdminUserService } from '../../../../../services/admin/admin-user.service';
import type { UserData } from '../../../../../models/admin/user.type';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-core-tab',
  imports: [DatePipe],
  templateUrl: './core-tab.html',
  styleUrl: './core-tab.scss',
})
export class CoreTab {
  protected readonly store = inject(userEditStore);
  private readonly adminUserService = inject(AdminUserService);

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

  public updateField(field: string, value: string): void {
    const key = field as keyof UserData;
    this.store.setEditValueForField(key, value as never);
  }

  public saveField(field: string): void {
    // const value = this.store.editValues()[field as keyof UserData];
    this.store.setIsSaving(true);
    this.adminUserService
      .updateUser(this.store.user().id, {
        [field]: this.store.editValues()[field as keyof UserData],
      })
      .subscribe({
        next: (updated) => {
          this.store.setUserData(updated.user);
          this.store.setEditModeForField(field, false);
          this.store.setSuccessMessage(`${updated.message}`);
          this.store.setIsSaving(false);
        },
        error: (error) => {
          this.store.setErrorMessage(error.error?.message ?? `Failed to update ${field}`);
          this.store.setIsSaving(false);
        },
      });

    // this.http
    //   .patch<UserData>(`${environment.backendURL}/api/v1/admin/users/${this.store.user().id}`, {
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
}
