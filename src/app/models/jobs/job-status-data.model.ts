import type { AiSettings } from '../ai-settings.model';

export type JobStatusData = {
  type: string;
  email: string;
  jobId: string;
  userId: string;
  video_title: string;
  transcript?: string;
  configuration?: AiSettings;
  fileData?: {
    buffer: string;
    mimetype: string;
    originalName: string;
  };
  accessToken?: string;
};
