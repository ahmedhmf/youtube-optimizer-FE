import { Injectable, signal } from '@angular/core';
import { io, type Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import type { UserJob } from '../models/jobs/user-job.model';

export type JobQueueEvent =
  | 'JOB_QUEUED'
  | 'JOB_STARTED'
  | 'JOB_PROGRESS'
  | 'JOB_COMPLETED'
  | 'JOB_FAILED'
  | 'JOB_CANCELLED';

export type JobEventData = {
  jobId: string;
  status: string;
  progress: number;
  stage?: string;
  message?: string;
  error?: string;
  data?: UserJob;
};

const UPDATE_CHECK_INTERVAL = 100;

@Injectable({
  providedIn: 'root',
})
export class JobQueueService {
  private socket: Socket | null = null;
  private readonly jobUpdates = signal<Map<string, JobEventData>>(new Map());

  public connect(): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(`${environment.backendURL}/queue`, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    this.setupEventListeners();
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public onJobEvent(jobId: string, callback: (data: JobEventData) => void): void {
    const checkForUpdates = (): void => {
      const update = this.jobUpdates().get(jobId);
      if (update) {
        callback(update);
      }
    };

    // Check immediately
    checkForUpdates();

    // Set up interval to check for updates
    const interval = setInterval(checkForUpdates, UPDATE_CHECK_INTERVAL);

    // Clean up on disconnect
    if (this.socket) {
      this.socket.once('disconnect', () => {
        clearInterval(interval);
      });
    }
  }

  public getJobUpdate(jobId: string): JobEventData | undefined {
    return this.jobUpdates().get(jobId);
  }

  private setupEventListeners(): void {
    if (!this.socket) {
      return;
    }

    this.socket.on('JOB_QUEUED', (data: JobEventData) => {
      this.updateJobState(data);
    });

    this.socket.on('JOB_STARTED', (data: JobEventData) => {
      this.updateJobState(data);
    });

    this.socket.on('JOB_PROGRESS', (data: JobEventData) => {
      this.updateJobState(data);
    });

    this.socket.on('JOB_COMPLETED', (data: JobEventData) => {
      this.updateJobState(data);
    });

    this.socket.on('JOB_FAILED', (data: JobEventData) => {
      this.updateJobState(data);
    });

    this.socket.on('JOB_CANCELLED', (data: JobEventData) => {
      this.updateJobState(data);
    });

    this.socket.on('connect', () => {
      // Connected to job queue WebSocket
    });

    this.socket.on('disconnect', () => {
      // Disconnected from job queue WebSocket
    });

    this.socket.on('error', (error: Error) => {
      console.error('[JobQueue] WebSocket error:', error);
    });
  }

  private updateJobState(data: JobEventData): void {
    const updates = new Map(this.jobUpdates());
    updates.set(data.jobId, data);
    this.jobUpdates.set(updates);
  }
}
