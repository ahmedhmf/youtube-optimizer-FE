import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import type { UserProfile } from '../../models/user-profile.model';
import { userProfileStore } from '../../stores/dashboard/user-profile.store';

@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  private readonly http = inject(HttpClient);
  private readonly store = inject(userProfileStore);
  /**
   * Fetch user profile from backend
   */
  public fetchProfile(): Observable<UserProfile> {
    return this.http
      .get<UserProfile>(`${environment.backendURL}/auth/profile/subscription`, {
        withCredentials: true,
      })
      .pipe(
        tap((profile) => {
          this.store.setProfile(profile);
        }),
        catchError((error) => {
          this.store.setProfile(null);
          throw error;
        }),
      );
  }

  /**
   * Clear profile data
   */
  public clearProfile(): void {
    this.store.setProfile(null);
  }
}
