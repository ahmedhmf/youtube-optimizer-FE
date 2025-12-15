  import { computed } from '@angular/core';
  import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

  export type AnalyzeSteps = {
    step: number;
    label: string;
    path: string;
  };

  export type Generations = {
    label: string;
    enabled: boolean;
    value: string;
  };

  export type VideoData = {
    title: string;
    description: string;
    category: string;
    thumbnailUrl: string;
    videoId: string;
  };

  export type ThumbnailTemplateType =
    | 'big_bold_text'
    | 'face_left_text_right'
    | 'documentary_story'
    | 'before_after'
    | 'center_object_minimal'
    | 'neon_tech'
    | 'reaction_object'
    | 'two_tone'
    | 'blur_background_text'
    | 'magazine_style';

  export type CommonThumbnailFields = {
    brandLogo?: string;
    logoSize?: 'small' | 'medium' | 'large';
    logoPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    watermark?: string;
    outputSize?: '1280x720' | 'custom';
  };

  export type BigBoldTextConfig = CommonThumbnailFields & {
    mainText: string;
    textColor: string;
    textOutlineColor: string;
    fontWeight: 'bold' | 'extra-bold';
    textShadow: { color: string; intensity: number };
  };

  export type FaceLeftTextRightConfig = CommonThumbnailFields & {
    personImage: string;
    mainText: string;
    textColor: string;
    textBackground: string;
    personPosition?: string;
    arrowPointer?: boolean;
  };

  export type DocumentaryStoryConfig = CommonThumbnailFields & {
    mainTitle: string;
    subtitle: string;
    titleColor: string;
    subtitleColor: string;
    textBackgroundOpacity: number;
    mood: 'cinematic' | 'serious' | 'dramatic';
  };

  export type BeforeAfterConfig = CommonThumbnailFields & {
    beforeImage: string;
    afterImage: string;
    beforeLabel: { text: string; color: string };
    afterLabel: { text: string; color: string };
    dividerStyle: 'arrow' | 'line' | 'vs';
    labelBackground: string;
  };

  export type CenterObjectMinimalConfig = CommonThumbnailFields & {
    centerObjectImage: string;
    topText?: string;
    bottomText?: string;
    textColor: string;
    shadowGlow?: { type: 'shadow' | 'glow'; intensity: number };
    backgroundBlur: number;
  };

  export type NeonTechConfig = CommonThumbnailFields & {
    mainText: string;
    neonColor: string;
    secondaryNeonColor: string;
    textGlowIntensity: number;
    gridOverlay: boolean;
    scanlines: boolean;
  };

  export type ReactionObjectConfig = CommonThumbnailFields & {
    personImage: string;
    objectImage: string;
    mainText?: string;
    personPosition: 'left' | 'right';
    objectPosition: 'left' | 'right';
    emotionEmphasis: 'surprised' | 'shocked' | 'excited' | 'happy' | 'angry';
    speechBubbleArrow?: boolean;
  };

  export type TwoToneConfig = CommonThumbnailFields & {
    leftColor: string;
    rightColor: string;
    mainText: string;
    textColor: string;
    textOutline: string;
    dividerStyle: 'hard-split' | 'gradient-blend' | 'diagonal';
  };

  export type BlurBackgroundTextConfig = CommonThumbnailFields & {
    mainText: string;
    textColor: string;
    textStyle: 'clean' | 'outlined';
    blurIntensity: number;
    textBackgroundBox?: boolean;
    boxColor?: string;
  };

  export type MagazineStyleConfig = CommonThumbnailFields & {
    mainHeadline: string;
    subtitleTagline: string;
    accentColor: string;
    coverImage?: string;
    textColors: { primary: string; secondary: string; accent: string };
    logoBadge?: string;
    layoutStyle: 'traditional' | 'modern-minimal' | 'bold-graphic';
  };

  export type ThumbnailConfig =
    | { type: 'big_bold_text'; config: BigBoldTextConfig }
    | { type: 'face_left_text_right'; config: FaceLeftTextRightConfig }
    | { type: 'documentary_story'; config: DocumentaryStoryConfig }
    | { type: 'before_after'; config: BeforeAfterConfig }
    | { type: 'center_object_minimal'; config: CenterObjectMinimalConfig }
    | { type: 'neon_tech'; config: NeonTechConfig }
    | { type: 'reaction_object'; config: ReactionObjectConfig }
    | { type: 'two_tone'; config: TwoToneConfig }
    | { type: 'blur_background_text'; config: BlurBackgroundTextConfig }
    | { type: 'magazine_style'; config: MagazineStyleConfig };
  export type GeneratedContent = {
    title?: string[];
    description?: string;
    tags?: string[];
    keywords?: {
      primaryKeywords: string[];
      longTailKeywords: string[];
      trendingKeywords: string[];
      competitorKeywords: string[];
    };
    thumbnail?: {
      template: string;
    };
  };

  export type GeneratedThumbnail = {
    thumbnailUrl: string;
    template: string;
    message: string;
  };

  export type AnalyzeStore = {
    videoUrl: string;
    currentStep: number;
    steps: AnalyzeSteps[];
    generations: Generations[];
    analysisResults: VideoData | null;
    generatedContent: GeneratedContent | null;
    thumbnailConfig: ThumbnailConfig | null;
    generatedThumbnail: GeneratedThumbnail | null;
    isLoading: boolean | null;
  };

  const initialState: AnalyzeStore = {
    videoUrl: '',
    currentStep: 1,
    steps: [
      { step: 1, label: 'Analyze URL', path: '/dashboard/analyze' },
      { step: 2, label: 'Generation', path: '/dashboard/analyze/generation' },
      { step: 3, label: 'Optimize', path: '/dashboard/analyze/thumbnail-style' },
      { step: 4, label: 'Result', path: '/dashboard/analyze/result' },
    ],
      generations: [
        { label: 'Title', enabled: false, value: 'title' },
        { label: 'Description', enabled: false, value: 'description' },
        { label: 'Tags', enabled: false, value: 'tags' },
        { label: 'Thumbnail', enabled: false, value: 'thumbnail' },
        { label: 'SEO Keywords', enabled: false, value: 'keywords' },
      ],
    analysisResults: null,
    generatedContent: null,
    thumbnailConfig: null,
    generatedThumbnail: null,
    isLoading: false,
  };

  export const analyzeStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withComputed((store) => ({
      nextStep: computed(() =>
        store.currentStep() < store.steps().length
          ? store.steps()[store.currentStep() + 1 - 1].path
          : null,
      ),
      prevStep: computed(() =>
        store.currentStep() > 1 ? store.steps()[store.currentStep() - 1 - 1].path : null,
      ),
      enabledGenerations: computed(
        (): Array<'title' | 'description' | 'tags' | 'keywords' | 'thumbnail' > =>
          store
            .generations()
            .filter((gen) => gen.enabled)
            .map((gen) => gen.value as 'title' | 'description' | 'tags' | 'keywords' | 'thumbnail'),
      ),
    })),
    withMethods((store) => ({
      setVideoUrl(url: string): void {
        patchState(store, { videoUrl: url });
      },
      nextStep(): void {
        patchState(store, { currentStep: store.currentStep() + 1 });
      },
      prevStep(): void {
        patchState(store, { currentStep: store.currentStep() - 1 });
      },
      setAnalysisResults(results: VideoData): void {
        patchState(store, { analysisResults: results });
      },
      setGeneratedContent(content: GeneratedContent): void {
        patchState(store, { generatedContent: content });
      },
      setThumbnailConfig(config: ThumbnailConfig): void {
        patchState(store, { thumbnailConfig: config });
      },
      setGeneratedThumbnail(thumbnail: GeneratedThumbnail): void {
        patchState(store, { generatedThumbnail: thumbnail });
      },
      setLoading(isLoading: boolean): void {
        patchState(store, { isLoading });
      },
      startLoading(): void {
        patchState(store, { isLoading: true });
      },
      stopLoading(): void {
        patchState(store, { isLoading: false });
      },
    })),
  );
