import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { UserJob } from '../models/jobs/user-job.model';
import { environment } from '../../environments/environment';
import type { RetryJobResponce } from '../models/jobs/retry-job-responce.model';
import type { CanceledJobResponse } from '../models/jobs/canceled-job-responce.model';

@Injectable({
  providedIn: 'root',
})
export class JobStatusService {
  private readonly http = inject(HttpClient);

  private readonly API_BASE = `${environment.backendURL}/analyze`;

  public getUserJobs(): Observable<UserJob[]> {
    return this.http.get<UserJob[]>(`${this.API_BASE}/jobs`);
  }

  public retryJob(jobId: string): Observable<RetryJobResponce> {
    return this.http.post<RetryJobResponce>(`${this.API_BASE}/job/${jobId}/retry`, {}, {});
  }

  public cancelJob(jobId: string): Observable<CanceledJobResponse> {
    return this.http.post<CanceledJobResponse>(`${this.API_BASE}/job/${jobId}/cancel`, {});
  }
}
