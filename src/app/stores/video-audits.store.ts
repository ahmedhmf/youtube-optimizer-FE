import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import type { VideoAuditsState } from '../models/video-audits-state.model';
import type { Audits } from '../models/audits.model';
import type { HistoryResponse } from '../models/history-response.model';

const initialState: VideoAuditsState = {
  audits: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  },
  loading: false,
  status: 'idle',
  needsPaginationRefresh: false,
};

export const videoAuditsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    setAudits(response: HistoryResponse): void {
      patchState(store, {
        audits: response.data,
        pagination: response.pagination,
        loading: false,
      });
    },

    addAudits(audit: Audits): void {
      patchState(store, (state) => ({
        audits: [audit, ...state.audits],
      }));
    },

    appendAudits(response: HistoryResponse): void {
      patchState(store, (state) => ({
        audits: [...state.audits, ...response.data],
        pagination: response.pagination,
        loading: false,
      }));
    },

    removeAudits(id: string): void {
      patchState(store, (state) => {
        const updatedAudits = state.audits.filter((audit) => audit.id !== id);
        const newTotalPages = Math.ceil((state.pagination.total - 1) / state.pagination.limit);

        return {
          audits: updatedAudits,
          pagination: {
            ...state.pagination,
            total: state.pagination.total - 1,
            totalPages: newTotalPages,
            hasNext: state.pagination.page < newTotalPages,
            hasPrev: state.pagination.page > 1,
          },
          // Add a flag to indicate pagination refresh is needed
          needsPaginationRefresh: true,
        };
      });
    },

    clearPaginationRefreshFlag(): void {
      patchState(store, { needsPaginationRefresh: false });
    },
    setLoading(loading: boolean): void {
      patchState(store, { loading });
    },

    setStatus(status: VideoAuditsState['status']): void {
      patchState(store, { status });
    },

    resetPagination(): void {
      patchState(store, {
        audits: [],
        pagination: initialState.pagination,
      });
    },
  })),
);
