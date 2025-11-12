import type { JobStatusData } from './job-status-data.model';

export type JobStatus = {
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'not_found';
  progress: number;
  data: JobStatusData;
  error?: string;
  createdAt: Date;
  processedAt?: Date;
  finishedAt?: Date;
  id: number;
};
