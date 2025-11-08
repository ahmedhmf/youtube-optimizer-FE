import { computed } from "@angular/core";
import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";

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
}

type AnalyzeState = 'idle' | 'analyzing' | 'done' | 'error';

const initialState = {
  audits: [] as Audits[] | null,
  loading: false,
  status: 'idle' as AnalyzeState,
  message: '',
  filterText: '',
  newestAudit: null as Audits | null,
};

export const VideoAuditsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    setLoading: (loading: boolean): void => {
      patchState(store, { loading });
    },
    setAudits: (audits: Audits[]): void => {
      patchState(store, { audits });
    },
    addAudits: (audits: Audits): void => {
      const current = store.audits() || [];
      patchState(store, { audits: [audits, ...current], newestAudit: audits });
    },
    removeAudits: (id: string): void => {
      const current = store.audits() || [];
      const updated = current.filter(a => a.id !== id);
      patchState(store, { audits: updated });
    },
    setStatus(status: AnalyzeState): void {
      patchState(store, { status });
    },
    setMessage(message: string): void {
      patchState(store, { message });
    },
    setFilterText(filterText: string): void {
      patchState(store, { filterText });
    },
    clearFilter(): void {
      patchState(store, { filterText: '' });
    },
  })),
  withComputed((store) => ({
    // Computed signal for filtered audits
    filteredAudits: computed(() => {
      const audits = store.audits();
      const filter = store.filterText().toLowerCase().trim();

      if (!filter) {
        return audits;
      }

      return audits?.filter(audit =>
        audit.video_title?.toLowerCase().includes(filter) ||
        JSON.stringify(audit).toLowerCase().includes(filter) ||
        new Date(audit.created_at).toLocaleDateString().includes(filter)
      );
    }),
    isFilterActive: computed(() => store.filterText().trim().length > 0)
  })),
);