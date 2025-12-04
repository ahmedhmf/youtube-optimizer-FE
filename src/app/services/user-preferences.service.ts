import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import type {
  CreateUserPreferencesRequest,
  UserPreferences,
  UserPreferencesResponse,
} from '../models/user-preferences.model';

@Injectable({
  providedIn: 'root',
})
export class UserPreferencesService {
  private readonly http = inject(HttpClient);

  /**
   * Get current user preferences
   */
  public getUserPreferences(): Observable<UserPreferences> {
    return this.http.get<UserPreferences>(`${environment.backendURL}/api/v1/user-preferences`, {
      withCredentials: true,
    });
  }

  /**
   * Save user preferences (create or update - backend decides)
   */
  public savePreferences(
    preferences: CreateUserPreferencesRequest,
  ): Observable<UserPreferencesResponse> {
    return this.http.post<UserPreferencesResponse>(
      `${environment.backendURL}/api/v1/user-preferences`,
      preferences,
      { withCredentials: true },
    );
  }
}
