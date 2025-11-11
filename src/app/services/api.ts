import { inject, Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, Subject, takeUntil, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Audits, HistoryResponse, VideoAuditsStore } from '../stores/video-audits.store';
import { AiMessageConfiguration } from '../models/ai-message-configuration.model';
import { ErrorHandlerService } from '../util/error-handler.service';
import { AiSettings } from '../models/ai-settings.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService implements OnDestroy {
  private store = inject(VideoAuditsStore);
  private http = inject(HttpClient);
  private errorHandler = inject(ErrorHandlerService);

  private baseUrl = environment.backendURL;
  private destroy$ = new Subject<void>();

  analyzeVideoUrl(configuration: AiMessageConfiguration): Observable<Audits> {
    return this.http.post<Audits>(`${this.baseUrl}/analyze/video`, { configuration });
  }

  analyzeVideoUpload(file: File, configuration: AiSettings): Observable<Audits> {
    const formData = new FormData();
    formData.append('video', file);
    formData.append('configuration', JSON.stringify(configuration));

    return this.http.post<Audits>(`${this.baseUrl}/analyze/upload`, formData);
  }

  analyzeText(text: string, configuration: AiSettings): Observable<Audits> {
    const payload = {
      transcript: text, // Changed from 'text' to 'transcript'
      configuration: configuration,
    };
    return this.http.post<Audits>(`${this.baseUrl}/analyze/transcript`, payload);
  }

  getUserHistory(page = 1, limit = 10, reset = false): void {
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
          const handledError = this.errorHandler.handle(err);
          this.store.setLoading(false);
          this.store.setError(handledError);
          return throwError(() => handledError);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  deleteAudit(id: string): void {
    this.store.setLoading(true);
    this.http
      .delete(`${this.baseUrl}/analyze/delete/${id}`)
      .pipe(
        tap(() => {
          this.store.removeAudits(id);
          this.store.setLoading(false);
        }),
        catchError((err) => {
          const handledError = this.errorHandler.handle(err);
          this.store.setLoading(false);
          this.store.setError(handledError);
          return throwError(() => handledError);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
