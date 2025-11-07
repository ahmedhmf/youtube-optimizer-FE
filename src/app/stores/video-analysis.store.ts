import { S } from "@angular/cdk/keycodes";
import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";

export type AnalyzeResponse = {
  video: {
    id: string;
    title: string;
    description: string;
    tags: string[];
    thumbnail: string;
    views: number;
  };
  suggestions: {
    titles: string[];
    description: string;
    tags: string[];
    thumbnailPrompts: string[];
  };
}

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
}

type AnalyzeState = 'idle' | 'analyzing' | 'done' | 'error';

const initialState = {
  analysis: [] as Audits[] | null,
  loading: false,
  status: 'idle' as AnalyzeState,
  message: ''
};

export const VideoAnalysisStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    setLoading: (loading: boolean) => {
      patchState(store, { loading });
    },
    setAnalysis: (analysis: Audits[]) => {
      patchState(store, { analysis });
    },
    addAnalysis: (analysis: Audits) => {
      const current = store.analysis() || [];
      patchState(store, { analysis: [analysis, ...current] });
    },
    setStatus(status: AnalyzeState) {
      patchState(store, { status });
    },
    setMessage(message: string) {
      patchState(store, { message });
    }
  })),
);