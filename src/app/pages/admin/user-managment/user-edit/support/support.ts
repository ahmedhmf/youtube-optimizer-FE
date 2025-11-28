import { Component, inject } from '@angular/core';
import { AdminUserService } from '../../../../../services/admin/admin-user.service';
import { userEditStore } from '../../../../../stores/admin/user-edit.store';
import { DatePipe } from '@angular/common';
import type { HttpErrorResponse } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';
import type { AdminNote, ErrorLog } from '../../../../../models/admin/user.type';

@Component({
  selector: 'app-support',
  imports: [DatePipe],
  templateUrl: './support.html',
  styleUrl: './support.scss',
})
export class Support {
  protected adminNotes: AdminNote[] = [];
  protected errorLogs: ErrorLog[] = [];
  protected newNote = '';
  protected readonly store = inject(userEditStore);
  private readonly adminUserService = inject(AdminUserService);
  private readonly http = inject(HttpClient);

  public loadAdminNotes(userId: string): void {
    this.http
      .get<AdminNote[]>(`${environment.backendURL}/api/v1/admin/users/${userId}/notes`)
      .subscribe({
        next: (data) => {
          this.adminNotes = data;
        },
        error: () => {
          // Mock data
          this.adminNotes = [
            {
              id: '1',
              note: 'User requested additional credits',
              createdBy: 'Admin',
              createdAt: new Date().toISOString(),
            },
          ];
        },
      });
  }

  public addAdminNote(): void {
    if (!this.newNote.trim()) {
      return;
    }
    this.http
      .post<AdminNote>(
        `${environment.backendURL}/api/v1/admin/users/${this.store.user().id}/notes`,
        {
          note: this.newNote,
        },
      )
      .subscribe({
        next: (note) => {
          this.adminNotes.unshift(note);
          this.newNote = '';
          // this.showSuccess('Note added successfully');
        },
        error: (error: HttpErrorResponse) => {
          this.store.setErrorMessage(error.error?.message ?? 'Failed to add note');
        },
      });
  }

  public loadErrorLogs(userId: string): void {
    this.http
      .get<ErrorLog[]>(`${environment.backendURL}/api/v1/admin/users/${userId}/errors`)
      .subscribe({
        next: (data) => {
          this.errorLogs = data;
        },
        error: () => {
          // Mock data
          this.errorLogs = [
            {
              id: '1',
              errorType: 'API Error',
              message: 'Failed to fetch video data',
              timestamp: new Date().toISOString(),
              videoId: 'abc123',
              resolved: false,
            },
          ];
        },
      });
  }

  public rerunAnalysis(videoId: string): void {
    this.http
      .post(
        `${environment.backendURL}/api/v1/admin/users/${this.store.user().id}/rerun/${videoId}`,
        {},
      )
      .subscribe({
        next: () => {
          // this.showSuccess('Video analysis rerun successfully');
          // this.loadVideoHistory(this.store.user().id);
        },
        error: (error: HttpErrorResponse) => {
          this.store.setErrorMessage(error.error?.message ?? 'Failed to rerun analysis');
        },
      });
  }

  public markErrorResolved(errorId: string): void {
    const errorLog = this.errorLogs.find((e) => e.id === errorId);
    if (errorLog) {
      errorLog.resolved = true;
      // this.showSuccess('Error marked as resolved');
    }
  }
}
