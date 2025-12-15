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

  private readonly API_BASE = `${environment.backendURL}/api/v1/analyze`;

  /**
   * Get user jobs with retry logic - jobs list should load reliably
   */
  public getUserJobs(): Observable<UserJob[]> {
    const operation = (): Observable<UserJob[]> =>
      this.http.get<UserJob[]>(`${this.API_BASE}/jobs`, { withCredentials: true });

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
      this.http.post<RetryJobResponce>(
        `${this.API_BASE}/job/${jobId}/restart`,
        {},
        { withCredentials: true },
      );

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
      this.http.post<CanceledJobResponse>(
        `${this.API_BASE}/job/${jobId}/cancel`,
        {},
        { withCredentials: true },
      );

    return this.retryService.retryWithCategory(operation, 'critical', {
      operation: 'cancelJob',
      metadata: { jobId },
    });
  }
}
