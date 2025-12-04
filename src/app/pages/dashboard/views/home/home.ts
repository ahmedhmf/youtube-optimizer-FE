import type { OnDestroy, OnInit } from '@angular/core';
import { Component, inject } from '@angular/core';
import { JobStatusService } from '../../../../services/job-status.service';
import { Subject, takeUntil } from 'rxjs';
import type { UserJob } from '../../../../models/jobs/user-job.model';
import { JobQueueService } from '../../../../services/job-queue.service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, OnDestroy {
  protected jobs: UserJob[] = [];
  protected isLoading = false;
  private readonly cancellingJobs = new Set<string>();
  private readonly retryingJobs = new Set<string>();
  private readonly destroy$ = new Subject<void>();
  private readonly jobStatusService = inject(JobStatusService);
  private readonly jobQueue = inject(JobQueueService);

  private readonly DAYS_IN_YEAR = 365;
  private readonly DAYS_IN_MONTH = 30;
  private readonly HOURES_IN_DAY = 24;
  private readonly MINUTES_PER_HOUR_SECONDS_PER_MIN = 60;
  private readonly MS_IN_SECONT = 1000;

  public ngOnInit(): void {
    this.loadJobs();
    this.jobQueue.connect();
    this.setupJobEventListeners();
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.jobQueue.disconnect();
  }

  protected loadJobs(): void {
    this.isLoading = true;
    this.jobStatusService
      .getUserJobs()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (jobs) => {
          this.jobs = jobs;
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          throw error;
        },
      });
  }

  protected refreshJobs(): void {
    this.loadJobs();
  }

  protected cancelJob(jobId: string): void {
    this.cancellingJobs.add(jobId);
    this.jobStatusService
      .cancelJob(jobId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.cancellingJobs.delete(jobId);
          this.refreshJobs(); // Refresh to get updated status
        },
        error: (error) => {
          this.cancellingJobs.delete(jobId);
          throw error;
        },
      });
  }

  protected getTimeDifference(completedAt: string): string {
    const completed = new Date(completedAt);
    const now = new Date();
    const diffMs = now.getTime() - completed.getTime();
    const units = [
      {
        label: 'year',
        ms:
          this.DAYS_IN_YEAR *
          this.HOURES_IN_DAY *
          this.MINUTES_PER_HOUR_SECONDS_PER_MIN *
          this.MINUTES_PER_HOUR_SECONDS_PER_MIN *
          this.MS_IN_SECONT,
      },
      {
        label: 'month',
        ms:
          this.DAYS_IN_MONTH *
          this.HOURES_IN_DAY *
          this.MINUTES_PER_HOUR_SECONDS_PER_MIN *
          this.MINUTES_PER_HOUR_SECONDS_PER_MIN *
          this.MS_IN_SECONT,
      },
      {
        label: 'day',
        ms:
          this.HOURES_IN_DAY *
          this.MINUTES_PER_HOUR_SECONDS_PER_MIN *
          this.MINUTES_PER_HOUR_SECONDS_PER_MIN *
          this.MS_IN_SECONT,
      },
      {
        label: 'hour',
        ms:
          this.MINUTES_PER_HOUR_SECONDS_PER_MIN *
          this.MINUTES_PER_HOUR_SECONDS_PER_MIN *
          this.MS_IN_SECONT,
      },
      { label: 'minute', ms: this.MINUTES_PER_HOUR_SECONDS_PER_MIN * this.MS_IN_SECONT },
    ];

    for (const unit of units) {
      const count = Math.floor(diffMs / unit.ms);
      if (count > 0) {
        return `${count} ${unit.label}${count !== 1 ? 's' : ''} ago`;
      }
    }

    return 'Just now';
  }

  protected retryJob(jobId: string): void {
    this.retryingJobs.add(jobId);
    this.jobStatusService
      .retryJob(jobId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.retryingJobs.delete(jobId);
          this.refreshJobs();
        },
        error: (error) => {
          this.retryingJobs.delete(jobId);
          throw error;
        },
      });
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  protected viewJobDetails(_jobId: string): void {
    // Implement navigation to job details page if needed
  }

  private setupJobEventListeners(): void {
    // Listen for updates on all active jobs
    this.jobs.forEach((job) => {
      if (this.isActiveJob(job)) {
        this.jobQueue.onJobEvent(job.id, (data) => {
          this.updateJobInList(data);
        });
      }
    });
  }

  private updateJobInList(eventData: {
    jobId: string;
    status: string;
    progress: number;
    data?: UserJob;
  }): void {
    const jobIndex = this.jobs.findIndex((j) => j.id === eventData.jobId);
    if (jobIndex !== -1) {
      // Update existing job
      this.jobs[jobIndex] = {
        ...this.jobs[jobIndex],
        status: eventData.status,
        progress: eventData.progress,
        ...(eventData.data && { data: eventData.data.data }),
      };
    } else if (eventData.data) {
      // Add new job if not in list
      this.jobs.unshift(eventData.data);
    }
  }

  private isActiveJob(job: UserJob): boolean {
    return job.status === 'pending' || job.status === 'processing';
  }
}
