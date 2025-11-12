export type ApiError = {
  message: string;
  code?: string;
  status?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details?: any;
};
