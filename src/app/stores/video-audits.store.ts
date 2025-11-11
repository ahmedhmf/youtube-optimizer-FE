import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { ApiError } from '../models/api-error.model';

export type Audits = {
  id: string;
  user_id: string;
  video_url: string;
  video_title: string;
  ai_titles: string[];
  ai_description: string;
  ai_tags: string[];
  ai_thumbnail_prompts: string[];
  created_at: string;
  thumbnail_url: string;
};

type AnalyzeState = 'idle' | 'analyzing' | 'done' | 'error';

export type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type HistoryResponse = {
  data: Audits[];
  pagination: PaginationInfo;
};

export type VideoAuditsState = {
  audits: Audits[];
  pagination: PaginationInfo;
  loading: boolean;
  error: any;
  status: 'idle' | 'analyzing' | 'done' | 'error';
  needsPaginationRefresh: boolean;
};

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
  error: null,
  status: 'idle',
  needsPaginationRefresh: false,
};

export const VideoAuditsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    setAudits(response: HistoryResponse) {
      patchState(store, {
        audits: response.data,
        pagination: response.pagination,
        loading: false,
        error: null,
      });
    },

    addAudits(audit: Audits) {
      patchState(store, (state) => ({
        audits: [audit, ...state.audits],
      }));
    },

    appendAudits(response: HistoryResponse) {
      patchState(store, (state) => ({
        audits: [...state.audits, ...response.data],
        pagination: response.pagination,
        loading: false,
      }));
    },

    removeAudits(id: string) {
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

    clearPaginationRefreshFlag() {
      patchState(store, { needsPaginationRefresh: false });
    },
    setLoading(loading: boolean) {
      patchState(store, { loading });
    },

    setError(error: any) {
      patchState(store, { error, loading: false });
    },

    setStatus(status: VideoAuditsState['status']) {
      patchState(store, { status });
    },

    clearError() {
      patchState(store, { error: null });
    },

    resetPagination() {
      patchState(store, {
        audits: [],
        pagination: initialState.pagination,
      });
    },
  })),
);
