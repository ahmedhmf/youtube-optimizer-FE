import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import { RetryService } from '../error-handling/retry.service';
import type { UserJob } from '../models/jobs/user-job.model';
import { environment } from '../../environments/environment';
import type { RetryJobResponce } from '../models/jobs/retry-job-responce.model';
import type { CanceledJobResponse } from '../models/jobs/canceled-job-responce.model';

@Injectable({
  providedIn: 'root',
})
export class JobStatusService {
  private readonly http = inject(HttpClient);
  private readonly retryService = inject(RetryService);

  private readonly API_BASE = `${environment.backendURL}/analyze`;

  /**
   * Get user jobs with retry logic - jobs list should load reliably
   */
  public getUserJobs(): Observable<UserJob[]> {
    const operation = (): Observable<UserJob[]> =>
      this.http.get<UserJob[]>(`${this.API_BASE}/jobs`);

    return this.retryService.retryWithCategory(operation, 'listing', {
      operation: 'getUserJobs',
      metadata: { endpoint: 'jobs' },
    });
  }

  /**
   * Retry a failed job - this should be very reliable since user is trying to recover
   */
  public retryJob(jobId: string): Observable<RetryJobResponce> {
    const operation = (): Observable<RetryJobResponce> =>
      this.http.post<RetryJobResponce>(`${this.API_BASE}/job/${jobId}/retry`, {});

    return this.retryService.retryWithCategory(operation, 'critical', {
      operation: 'retryJob',
      metadata: { jobId },
    });
  }

  /**
   * Cancel a job - should be reliable since user wants to stop something
   */
  public cancelJob(jobId: string): Observable<CanceledJobResponse> {
    const operation = (): Observable<CanceledJobResponse> =>
      this.http.post<CanceledJobResponse>(`${this.API_BASE}/job/${jobId}/cancel`, {});

    return this.retryService.retryWithCategory(operation, 'critical', {
      operation: 'cancelJob',
      metadata: { jobId },
    });
  }

  /**
   * Get single job status - useful for polling job progress
   */
  public getJobStatus(jobId: string): Observable<UserJob> {
    const operation = (): Observable<UserJob> =>
      this.http.get<UserJob>(`${this.API_BASE}/job/${jobId}`);

    return this.retryService.retryWithCategory(operation, 'listing', {
      operation: 'getJobStatus',
      metadata: { jobId },
    });
  }

  /**
   * Poll job status until completion (if you need this feature)
   */
  public pollJobStatus(jobId: string): Observable<UserJob> {
    const operation = (): Observable<UserJob> =>
      this.http.get<UserJob>(`${this.API_BASE}/job/${jobId}/status`);

    // Use background category with more aggressive retry for polling
    return this.retryService.retryWithOverrides(
      operation,
      'background',
      {
        maxRetries: 8,
        initialDelay: 2000,
        maxDelay: 15000,
      },
      {
        operation: 'pollJobStatus',
        metadata: { jobId, polling: true },
      },
    );
  }
}
