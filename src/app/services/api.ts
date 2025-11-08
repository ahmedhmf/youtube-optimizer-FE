import { inject, Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Subject, takeUntil, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Audits, VideoAuditsStore } from '../stores/video-audits.store';
import { AiMessageConfiguration } from '../models/ai-message-configuration.model';



@Injectable({
  providedIn: 'root'
})
export class ApiService implements OnDestroy {
  private store = inject(VideoAuditsStore);
  private http = inject(HttpClient);

  private baseUrl = environment.backendURL;
  private destroy$ = new Subject<void>();

  constructor() { }

  analyzeVideo(configuration: AiMessageConfiguration): void {
    this.store.setStatus('analyzing');
    this.http.post<Audits>(`${this.baseUrl}/analyze/video`, { configuration }).pipe(
      tap(response => {
        this.store.addAudits(response);
        this.store.setStatus('done');
      }),
      catchError(err => {
        // Todo: set error message
        this.store.setStatus('error');
        this.store.setMessage(err?.message || 'Audits failed');
        return err;
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  analyzeVideoFile(file: File, config?: any): void {
    this.store.setStatus('analyzing');

    const formData = new FormData();
    formData.append('video', file);
    formData.append('configuration', JSON.stringify({
      language: config?.language || 'en',
      aiModel: config?.aiModel || 'gpt-4',
      tone: config?.tone || 'professional',
      title: config?.title || '',
      userId: config?.userId || null,
      timestamp: new Date().toISOString()
    }));

    this.http.post<Audits>(`${this.baseUrl}/analyze/upload`, formData).pipe(
      tap(response => {
        this.store.addAudits(response);
        this.store.setStatus('done');
      }),
      catchError(err => {
        this.store.setStatus('error');
        this.store.setMessage(err?.error?.message || err?.message || 'File analysis failed');
        return throwError(() => err);
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  analyzeTranscript(transcript: string, config?: any): void {
    this.store.setStatus('analyzing');

    const payload = {
      transcript,
      configuration: {
        language: config?.language || 'en',
        aiModel: config?.aiModel || 'gpt-4',
        tone: config?.tone || 'professional',
        title: config?.title || '',
        userId: config?.userId || null,
        cleanTranscript: config?.cleanTranscript || true,
        includeSentimentAnalysis: config?.includeSentimentAnalysis || true,
        extractKeywords: config?.extractKeywords || true,
        timestamp: new Date().toISOString()
      }
    };

    this.http.post<Audits>(`${this.baseUrl}/analyze/transcript`, payload).pipe(
      tap(response => {
        this.store.addAudits(response);
        this.store.setStatus('done');
      }),
      catchError(err => {
        this.store.setStatus('error');
        this.store.setMessage(err?.error?.message || err?.message || 'Transcript analysis failed');
        return throwError(() => err);
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  getUserHistory(): void {
    this.store.setLoading(true);
    this.http.get<Audits[]>(`${this.baseUrl}/analyze/history`).pipe(
      tap(response => {
        this.store.setAudits(response);
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

  deleteAudit(id: string): void {
    this.store.setLoading(true);
    this.http.delete(`${this.baseUrl}/analyze/delete/${id}`).pipe(
      tap(() => {
        this.store.removeAudits(id);
        this.store.setLoading(false);
      }),
      catchError(err => {
        this.store.setLoading(false);
        this.store.setMessage(err?.message || 'Failed to delete audit');
        return throwError(err);
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
