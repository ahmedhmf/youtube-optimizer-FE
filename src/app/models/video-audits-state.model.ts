import type { Audits } from './audits.model';
import type { PaginationInfo } from './pagination-info.model';

export type VideoAuditsState = {
  audits: Audits[];
  pagination: PaginationInfo;
  loading: boolean;
  status: 'idle' | 'analyzing' | 'done' | 'error';
  needsPaginationRefresh: boolean;
};
