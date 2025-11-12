import type { JobStatusData } from './job-status-data.model';

export type UserJob = {
  id: string;
  status: string;
  type: 'youtube' | 'upload' | 'transcript';
  createdAt: string;
  progress: number;
  completedAt?: Date;
  data: JobStatusData;
};
