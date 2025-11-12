import type { Audits } from './audits.model';
import type { PaginationInfo } from './pagination-info.model';

export type HistoryResponse = {
  data: Audits[];
  pagination: PaginationInfo;
};
