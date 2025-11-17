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
import { RetryService } from '../error-handling/retry.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService implements OnDestroy {
  private readonly store = inject(videoAuditsStore);
  private readonly http = inject(HttpClient);
  private readonly retryService = inject(RetryService);

  private readonly baseUrl = environment.backendURL;
  private readonly destroy$ = new Subject<void>();

  private readonly PAGE_LIMIT = 10;

  public analyzeVideoUrl(configuration: AiMessageConfiguration): Observable<Audits> {
    const operation = (): Observable<Audits> =>
      this.http.post<Audits>(
        `${this.baseUrl}/analyze/video`,
        { configuration },
        { withCredentials: true },
      );
    return this.retryService.retryWithCategory(operation, 'analysis', {
      operation: 'analyzeVideoUrl',
      metadata: { videoUrl: configuration.url },
    });
  }

  public analyzeVideoUpload(file: File, configuration: AiSettings): Observable<Audits> {
    const operation = (): Observable<Audits> => {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('configuration', JSON.stringify(configuration));
      return this.http.post<Audits>(`${this.baseUrl}/analyze/upload`, formData, {
        withCredentials: true,
      });
    };

    return this.retryService.retryWithCategory(operation, 'upload', {
      operation: 'analyzeVideoUpload',
      metadata: { fileName: file.name, fileSize: file.size },
    });
  }

  public analyzeText(text: string, configuration: AiSettings): Observable<Audits> {
    const operation = (): Observable<Audits> => {
      const payload = {
        transcript: text,
        configuration: configuration,
      };
      return this.http.post<Audits>(`${this.baseUrl}/analyze/transcript`, payload, {
        withCredentials: true,
      });
    };

    return this.retryService.retryWithCategory(operation, 'analysis', {
      operation: 'analyzeText',
      metadata: { textLength: text.length },
    });
  }

  public getUserHistory(page = 1, limit = this.PAGE_LIMIT, reset = false): void {
    this.store.setLoading(true);

    if (reset) {
      this.store.resetPagination();
    }

    const operation = (): Observable<HistoryResponse> => {
      const params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());
      return this.http.get<HistoryResponse>(`${this.baseUrl}/analyze/history`, {
        params,
        withCredentials: true,
      });
    };

    this.retryService
      .retryWithCategory(operation, 'listing', {
        operation: 'getUserHistory',
        metadata: { page, limit, reset },
      })
      .pipe(
        tap((response) => {
          if (page === 1 || reset) {
            this.store.setAudits(response);
          } else {
            this.store.appendAudits(response);
          }
        }),
        catchError((error) => {
          this.store.setLoading(false);
          this.store.setStatus('error');
          throw error;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        error: (error) => {
          console.error('getUserHistory final error:', error);
        },
      });
  }

  public deleteAudit(id: string): void {
    this.store.setLoading(true);

    const operation = (): Observable<object> =>
      this.http.delete(`${this.baseUrl}/analyze/delete/${id}`, { withCredentials: true });

    this.retryService
      .retryWithCategory(operation, 'crud', {
        operation: 'deleteAudit',
        metadata: { auditId: id },
      })
      .pipe(
        tap(() => {
          this.store.removeAudits(id);
          this.store.setLoading(false);
        }),
        catchError((error) => {
          this.store.setLoading(false);
          throw error;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        error: (error) => {
          console.error('deleteAudit final error:', error);
        },
      });
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
