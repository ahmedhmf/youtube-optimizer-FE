import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, Subject, take, takeUntil, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Audits, VideoAnalysisStore } from '../stores/video-analysis.store';



@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private store = inject(VideoAnalysisStore);

  private baseUrl = environment.backendURL;
  private destroy$ = new Subject<void>();

  constructor(private http: HttpClient) { }

  analyzeVideo(url: string) {
    this.store.setStatus('analyzing');
    this.http.post<Audits>(`${this.baseUrl}/analyze/video`, { url }).pipe(
      tap(response => {
        this.store.addAnalysis(response);
        this.store.setStatus('done');
      }),
      catchError(err => {
        // Todo: set error message
        this.store.setStatus('error');
        this.store.setMessage(err?.message || 'Analysis failed');
        return err;
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  getUserHistory() {
    this.store.setLoading(true);
    this.http.get<Audits[]>(`${this.baseUrl}/analyze/history`).pipe(
      tap(response => {
        this.store.setAnalysis(response);
        this.store.setLoading(false);
      }),
      catchError(err => {
        this.store.setLoading(false);
        // Todo: handle error appropriately
        return throwError(err);
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
