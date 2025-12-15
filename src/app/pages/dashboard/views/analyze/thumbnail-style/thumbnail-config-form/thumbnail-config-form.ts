import {
  Component,
  inject,
  Input,
  signal,
  type OnInit,
  type OnChanges,
  type SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  analyzeStore,
  type ThumbnailTemplateType,
  type ThumbnailConfig,
  type BigBoldTextConfig,
  type FaceLeftTextRightConfig,
  type DocumentaryStoryConfig,
  type BeforeAfterConfig,
  type CenterObjectMinimalConfig,
  type NeonTechConfig,
  type ReactionObjectConfig,
  type TwoToneConfig,
  type BlurBackgroundTextConfig,
  type MagazineStyleConfig,
} from '../../../../../../stores/dashboard/analyze.store';

@Component({
  selector: 'app-thumbnail-config-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './thumbnail-config-form.html',
  styleUrl: './thumbnail-config-form.scss',
})
export class ThumbnailConfigForm implements OnInit, OnChanges {
  @Input() templateType!: ThumbnailTemplateType;

  protected readonly analyzeStore = inject(analyzeStore);

  // Form signals
  protected readonly formData = signal<Record<string, unknown>>({});
  protected readonly isValid = signal(false);

  public ngOnInit(): void {
    this.initializeFormData();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['templateType'] && !changes['templateType'].firstChange) {
      this.initializeFormData();
    }
  }

  private initializeFormData(): void {
    const defaultData = this.getDefaultFormData();
    this.formData.set(defaultData);
  }

  private getDefaultFormData(): Record<string, unknown> {
    const commonDefaults = {
      logoSize: 'medium',
      logoPosition: 'top-right',
      outputSize: '1280x720',
    };

    switch (this.templateType) {
      case 'big_bold_text':
        return {
          ...commonDefaults,
          mainText: '',
          textColor: '#FFFFFF',
          textOutlineColor: '#000000',
          fontWeight: 'extra-bold',
          textShadow: { color: '#000000', intensity: 50 },
        };
      case 'face_left_text_right':
        return {
          ...commonDefaults,
          personImage: '',
          mainText: '',
          textColor: '#FFFFFF',
          textBackground: 'rgba(0, 0, 0, 0.5)',
          arrowPointer: true,
        };
      case 'documentary_story':
        return {
          ...commonDefaults,
          mainTitle: '',
          subtitle: '',
          titleColor: '#FFFFFF',
          subtitleColor: '#CCCCCC',
          textBackgroundOpacity: 0.7,
          mood: 'cinematic',
        };
      case 'before_after':
        return {
          ...commonDefaults,
          beforeImage: '',
          afterImage: '',
          beforeLabel: { text: 'Before', color: '#FF0000' },
          afterLabel: { text: 'After', color: '#00FF00' },
          dividerStyle: 'arrow',
          labelBackground: 'rgba(0, 0, 0, 0.8)',
        };
      case 'center_object_minimal':
        return {
          ...commonDefaults,
          centerObjectImage: '',
          topText: '',
          bottomText: '',
          textColor: '#FFFFFF',
          shadowGlow: { type: 'glow', intensity: 50 },
          backgroundBlur: 10,
        };
      case 'neon_tech':
        return {
          ...commonDefaults,
          mainText: '',
          neonColor: '#00FFFF',
          secondaryNeonColor: '#FF00FF',
          textGlowIntensity: 80,
          gridOverlay: true,
          scanlines: true,
        };
      case 'reaction_object':
        return {
          ...commonDefaults,
          personImage: '',
          objectImage: '',
          mainText: '',
          personPosition: 'left',
          objectPosition: 'right',
          emotionEmphasis: 'surprised',
          speechBubbleArrow: true,
        };
      case 'two_tone':
        return {
          ...commonDefaults,
          leftColor: '#FF0000',
          rightColor: '#0000FF',
          mainText: '',
          textColor: '#FFFFFF',
          textOutline: '#000000',
          dividerStyle: 'hard-split',
        };
      case 'blur_background_text':
        return {
          ...commonDefaults,
          mainText: '',
          textColor: '#FFFFFF',
          textStyle: 'outlined',
          blurIntensity: 15,
          textBackgroundBox: false,
          boxColor: 'rgba(0, 0, 0, 0.5)',
        };
      case 'magazine_style':
        return {
          ...commonDefaults,
          mainHeadline: '',
          subtitleTagline: '',
          accentColor: '#FF0000',
          coverImage: '',
          textColors: { primary: '#000000', secondary: '#666666', accent: '#FF0000' },
          layoutStyle: 'modern-minimal',
        };
      default:
        return commonDefaults;
    }
  }

  protected updateField(field: string, value: unknown): void {
    const currentData = this.formData();
    this.formData.set({ ...currentData, [field]: value });
    this.validateForm();
  }

  protected updateNestedField(parent: string, child: string, value: unknown): void {
    const currentData = this.formData();
    const parentData = (currentData[parent] as Record<string, unknown>) || {};
    this.formData.set({
      ...currentData,
      [parent]: { ...parentData, [child]: value },
    });
    this.validateForm();
  }

  private validateForm(): void {
    const data = this.formData();
    let valid = true;

    switch (this.templateType) {
      case 'big_bold_text':
        valid = !!data['mainText'];
        break;
      case 'face_left_text_right':
        valid = !!data['personImage'] && !!data['mainText'];
        break;
      case 'documentary_story':
        valid = !!data['mainTitle'] && !!data['subtitle'];
        break;
      case 'before_after':
        valid = !!data['beforeImage'] && !!data['afterImage'];
        break;
      case 'center_object_minimal':
        valid = !!data['centerObjectImage'];
        break;
      case 'neon_tech':
        valid = !!data['mainText'];
        break;
      case 'reaction_object':
        valid = !!data['personImage'] && !!data['objectImage'];
        break;
      case 'two_tone':
        valid = !!data['mainText'];
        break;
      case 'blur_background_text':
        valid = !!data['mainText'];
        break;
      case 'magazine_style':
        valid = !!data['mainHeadline'];
        break;
    }

    this.isValid.set(valid);
  }

  protected handleImageUpload(field: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        this.updateField(field, result);
      };
      reader.readAsDataURL(file);
    }
  }

  protected saveConfiguration(): void {
    if (!this.isValid()) {
      return;
    }

    const config: ThumbnailConfig = {
      type: this.templateType,
      config: this.formData() as never,
    };

    this.analyzeStore.setThumbnailConfig(config);
  }

  protected getRequiredFields(): string[] {
    switch (this.templateType) {
      case 'big_bold_text':
        return ['mainText'];
      case 'face_left_text_right':
        return ['personImage', 'mainText'];
      case 'documentary_story':
        return ['mainTitle', 'subtitle'];
      case 'before_after':
        return ['beforeImage', 'afterImage'];
      case 'center_object_minimal':
        return ['centerObjectImage'];
      case 'neon_tech':
        return ['mainText'];
      case 'reaction_object':
        return ['personImage', 'objectImage'];
      case 'two_tone':
        return ['mainText'];
      case 'blur_background_text':
        return ['mainText'];
      case 'magazine_style':
        return ['mainHeadline'];
      default:
        return [];
    }
  }
}
