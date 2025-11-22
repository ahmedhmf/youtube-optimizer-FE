import { Injectable, inject } from '@angular/core';
import type { HttpErrorResponse } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  UserData,
  ActivityLog,
  VideoHistory,
  BillingInfo,
  Invoice,
  AdminNote,
  ErrorLog,
} from '../../models/admin/user.type';
import { userEditStore } from '../../stores/admin/user-edit.store';
import type { UserUsage } from '../../models/admin/user-usage.type';

@Injectable({
  providedIn: 'root',
})
export class AdminUserService {
  private readonly http = inject(HttpClient);
  private readonly store = inject(userEditStore);

  public getUser(userId: string): void {
    this.http.get<UserData>(`${environment.backendURL}/admin/users/${userId}`).subscribe({
      next: (data) => {
        this.store.setUserData(data);
        this.store.setIsLoading(false);
      },
      error: (error: HttpErrorResponse) => {
        this.store.setErrorMessage(error.error?.message ?? 'Failed to load user');
        this.store.setIsLoading(false);
      },
    });
  }

  public updateUser(
    userId: string,
    updates: Partial<UserData>,
  ): Observable<{ user: UserData; message: string }> {
    return this.http.put<{ user: UserData; message: string }>(
      `${environment.backendURL}/admin/users/${userId}`,
      updates,
    );
  }

  public getUserUsage(userId: string): Observable<{ data: UserUsage; message: string }> {
    return this.http.get<{ data: UserUsage; message: string }>(
      `${environment.backendURL}/admin/users/${userId}/usage-overview`,
    );
  }

  public getActivityLogs(userId: string): Observable<ActivityLog[]> {
    return this.http.get<ActivityLog[]>(`${environment.backendURL}/admin/users/${userId}/activity`);
  }

  public getVideoHistory(userId: string): Observable<VideoHistory[]> {
    return this.http.get<VideoHistory[]>(`${environment.backendURL}/admin/users/${userId}/videos`);
  }

  public resetLimits(userId: string): Observable<Record<string, never>> {
    return this.http.post<Record<string, never>>(
      `${environment.backendURL}/admin/users/${userId}/reset-limits`,
      {},
    );
  }

  public giveBonusCredits(userId: string, credits: number): Observable<Record<string, never>> {
    return this.http.post<Record<string, never>>(
      `${environment.backendURL}/admin/users/${userId}/bonus-credits`,
      { credits },
    );
  }

  public suspendUser(userId: string): Observable<Record<string, never>> {
    return this.http.post<Record<string, never>>(
      `${environment.backendURL}/admin/users/${userId}/suspend`,
      {},
    );
  }

  public activateUser(userId: string): Observable<Record<string, never>> {
    return this.http.post<Record<string, never>>(
      `${environment.backendURL}/admin/users/${userId}/activate`,
      {},
    );
  }

  public impersonateUser(userId: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(
      `${environment.backendURL}/admin/users/${userId}/impersonate`,
      {},
    );
  }

  public getBillingInfo(userId: string): Observable<BillingInfo & { invoices: Invoice[] }> {
    return this.http.get<BillingInfo & { invoices: Invoice[] }>(
      `${environment.backendURL}/admin/users/${userId}/billing`,
    );
  }

  public getAdminNotes(userId: string): Observable<AdminNote[]> {
    return this.http.get<AdminNote[]>(`${environment.backendURL}/admin/users/${userId}/notes`);
  }

  public addAdminNote(userId: string, note: string): Observable<AdminNote> {
    return this.http.post<AdminNote>(`${environment.backendURL}/admin/users/${userId}/notes`, {
      note,
    });
  }

  public getErrorLogs(userId: string): Observable<ErrorLog[]> {
    return this.http.get<ErrorLog[]>(`${environment.backendURL}/admin/users/${userId}/errors`);
  }

  public rerunAnalysis(videoId: string): Observable<Record<string, never>> {
    return this.http.post<Record<string, never>>(
      `${environment.backendURL}/admin/rerun-analysis/${videoId}`,
      {},
    );
  }

  public markErrorResolved(errorId: string): Observable<Record<string, never>> {
    return this.http.post<Record<string, never>>(
      `${environment.backendURL}/admin/errors/${errorId}/resolve`,
      {},
    );
  }
}
