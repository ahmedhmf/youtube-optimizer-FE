import {
  analyzeStore,
  type ThumbnailTemplateType,
} from './../../../../../stores/dashboard/analyze.store';
import { Component, inject, signal, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThumbnailConfigForm } from './thumbnail-config-form/thumbnail-config-form';
import { AnalyzeService } from '../analyze.service';

@Component({
  selector: 'app-thumbnail-style',
  imports: [CommonModule, ThumbnailConfigForm],
  templateUrl: './thumbnail-style.html',
  styleUrl: './thumbnail-style.scss',
})
export class ThumbnailStyle implements OnInit {
  protected readonly showConfigForm = signal(false);
  protected readonly showTemplateSelector = signal(false);
  protected readonly selectedTemplate = signal<ThumbnailTemplateType | null>(null);
  protected readonly templateLibrary: Array<{
    id: ThumbnailTemplateType;
    name: string;
    preview: string;
    description: string;
    bestFor: string[];
  }> = [
    {
      id: 'big_bold_text',
      name: 'Big Bold Text',
      preview: 'thumbnail_templates/big_bold_text.png',
      description: 'Large, attention-grabbing text overlay',
      bestFor: ['Announcements', 'Clickbait', 'News'],
    },
    {
      id: 'face_left_text_right',
      name: 'Face + Text',
      preview: 'thumbnail_templates/face_left_text_right.png',
      description: 'Person on left, headline on right',
      bestFor: ['Vlogs', 'Reactions', 'Interviews'],
    },
    {
      id: 'documentary_story',
      name: 'Documentary / Story',
      preview: 'thumbnail_templates/documentary_story.png',
      description: 'Cinematic look for serious content',
      bestFor: ['History', 'Documentaries', 'Educational'],
    },
    {
      id: 'before_after',
      name: 'Before & After',
      preview: 'thumbnail_templates/before_after.png',
      description: 'Split comparison design',
      bestFor: ['Transformations', 'Tutorials', 'Reviews'],
    },
    {
      id: 'center_object_minimal',
      name: 'Center Object',
      preview: 'thumbnail_templates/center_object_minimal.png',
      description: 'Clean, minimal with centered focus',
      bestFor: ['Product Reviews', 'Tech', 'Minimalist'],
    },
    {
      id: 'neon_tech',
      name: 'Neon Tech',
      preview: 'thumbnail_templates/neon_tech.png',
      description: 'Futuristic cyberpunk aesthetic',
      bestFor: ['Gaming', 'Tech', 'Sci-Fi'],
    },
    {
      id: 'reaction_object',
      name: 'Reaction',
      preview: 'thumbnail_templates/reaction_object.png',
      description: 'Person reacting to something',
      bestFor: ['Reactions', 'Unboxing', 'Surprises'],
    },
    {
      id: 'two_tone',
      name: 'Two Tone',
      preview: 'thumbnail_templates/two_tone.png',
      description: 'Split background with contrasting colors',
      bestFor: ['Versus', 'Comparisons', 'Debates'],
    },
    {
      id: 'blur_background_text',
      name: 'Blur Background',
      preview: 'thumbnail_templates/blur_background_text.png',
      description: 'Text over blurred video frame',
      bestFor: ['Storytelling', 'Cinematic', 'Drama'],
    },
    {
      id: 'magazine_style',
      name: 'Magazine Cover',
      preview: 'thumbnail_templates/magazine_style.png',
      description: 'Professional magazine layout',
      bestFor: ['Lifestyle', 'Fashion', 'Professional'],
    },
  ];

  protected readonly analyzeStore = inject(analyzeStore);
  private readonly analyzeService = inject(AnalyzeService);
  private readonly router = inject(Router);

  public ngOnInit(): void {
    // Check if we have a recommended template from backend
    const recommended = this.analyzeStore.generatedContent()?.thumbnail?.template;
    if (recommended) {
      this.selectedTemplate.set(recommended as ThumbnailTemplateType);
    }
  }

  protected get recommendedTemplate(): string | undefined {
    return this.analyzeStore.generatedContent()?.thumbnail?.template;
  }

  protected get videoCategory(): string {
    return this.analyzeStore.analysisResults()?.category ?? 'General';
  }

  protected selectTemplate(templateId: ThumbnailTemplateType): void {
    this.selectedTemplate.set(templateId);
    this.showConfigForm.set(true);
  }

  protected useRecommendedTemplate(): void {
    const recommended = this.recommendedTemplate;
    if (recommended) {
      this.selectTemplate(recommended as ThumbnailTemplateType);
    }
  }

  protected backToRecommendation(): void {
    this.showConfigForm.set(false);
  }

  protected openTemplateSelector(): void {
    this.showTemplateSelector.set(true);
  }

  protected closeTemplateSelector(): void {
    this.showTemplateSelector.set(false);
  }

  protected selectDifferentTemplate(templateId: ThumbnailTemplateType): void {
    this.selectedTemplate.set(templateId);
    this.showTemplateSelector.set(false);
    this.showConfigForm.set(true);
  }

  protected getTemplateInfo(templateId: string):
    | {
        id: ThumbnailTemplateType;
        name: string;
        preview: string;
        description: string;
        bestFor: string[];
      }
    | undefined {
    return this.templateLibrary.find((t) => t.id === templateId);
  }

  protected nextStep(): void {
    // Ensure configuration is saved before proceeding
    const selectedTemplate = this.selectedTemplate();
    const thumbnailConfig = this.analyzeStore.thumbnailConfig();

    if (selectedTemplate && thumbnailConfig) {
      this.analyzeService.generateThumbnail({
        videoUrl: this.analyzeStore.videoUrl(),
        template: selectedTemplate,
        templateData: thumbnailConfig,
      });
      void this.router.navigate(['/dashboard/analyze/results']);
    }
  }

  protected prevStep(): void {
    void this.router.navigate([this.analyzeStore.prevStep()]);
  }
}
