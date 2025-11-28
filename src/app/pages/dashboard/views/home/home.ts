import type { OnDestroy, OnInit } from '@angular/core';
import { Component, inject } from '@angular/core';
import { JobStatusService } from '../../../../services/job-status.service';
import { interval, Subject, switchMap, takeUntil } from 'rxjs';
import type { UserJob } from '../../../../models/jobs/user-job.model';

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
  private readonly autoRefresh = true;
  private readonly destroy$ = new Subject<void>();
  private readonly jobStatusService = inject(JobStatusService);

  private readonly DAYS_IN_YEAR = 365;
  private readonly DAYS_IN_MONTH = 30;
  private readonly HOURES_IN_DAY = 24;
  private readonly MINUTES_PER_HOUR_SECONDS_PER_MIN = 60;
  private readonly MS_IN_SECONT = 1000;
  private readonly FIVE_SECONDS = 5000;

  public ngOnInit(): void {
    this.loadJobs();
    this.startAutoRefresh();
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  protected startAutoRefresh(): void {
    interval(this.FIVE_SECONDS)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => {
          const hasActiveJobs = this.jobs.some((job) => this.isActiveJob(job));
          return hasActiveJobs ? this.jobStatusService.getUserJobs() : [];
        }),
      )
      .subscribe({
        next: (jobs) => {
          if (jobs.length > 0) {
            this.jobs = jobs;
          }
        },
        error: (error) => {
          throw error;
        },
      });
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

  private isActiveJob(job: UserJob): boolean {
    return job.status === 'pending' || job.status === 'processing';
  }
}
