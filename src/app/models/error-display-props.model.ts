import { ApiError } from "./api-error.model";

export type ErrorDisplayProps = {
  error: ApiError;
  onRetry?: () => void;
  onUpgrade?: () => void;
}