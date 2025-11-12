import type { OnDestroy } from '@angular/core';
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import type { Observable } from 'rxjs';
import { catchError, Subject, takeUntil, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { videoAuditsStore } from '../stores/video-audits.store';
import type { AiMessageConfiguration } from '../models/ai-message-configuration.model';
import type { AiSettings } from '../models/ai-settings.model';
import type { Audits } from '../models/audits.model';
import type { HistoryResponse } from '../models/history-response.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService implements OnDestroy {
  private readonly store = inject(videoAuditsStore);
  private readonly http = inject(HttpClient);

  private readonly baseUrl = environment.backendURL;
  private readonly destroy$ = new Subject<void>();

  private readonly PAGE_LIMIT = 10;

  public analyzeVideoUrl(configuration: AiMessageConfiguration): Observable<Audits> {
    return this.http.post<Audits>(`${this.baseUrl}/analyze/video`, { configuration });
  }

  public analyzeVideoUpload(file: File, configuration: AiSettings): Observable<Audits> {
    const formData = new FormData();
    formData.append('video', file);
    formData.append('configuration', JSON.stringify(configuration));

    return this.http.post<Audits>(`${this.baseUrl}/analyze/upload`, formData);
  }

  public analyzeText(text: string, configuration: AiSettings): Observable<Audits> {
    const payload = {
      transcript: text, // Changed from 'text' to 'transcript'
      configuration: configuration,
    };
    return this.http.post<Audits>(`${this.baseUrl}/analyze/transcript`, payload);
  }

  public getUserHistory(page = 1, limit = this.PAGE_LIMIT, reset = false): void {
    this.store.setLoading(true);

    if (reset) {
      this.store.resetPagination();
    }

    const params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());

    this.http
      .get<HistoryResponse>(`${this.baseUrl}/analyze/history`, { params })
      .pipe(
        tap((response) => {
          if (page === 1 || reset) {
            this.store.setAudits(response);
          } else {
            this.store.appendAudits(response);
          }
        }),
        catchError((err) => {
          this.store.setLoading(false);
          return err;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  public deleteAudit(id: string): void {
    this.store.setLoading(true);
    this.http
      .delete(`${this.baseUrl}/analyze/delete/${id}`)
      .pipe(
        tap(() => {
          this.store.removeAudits(id);
          this.store.setLoading(false);
        }),
        catchError((err) => {
          this.store.setLoading(false);
          throw err;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
