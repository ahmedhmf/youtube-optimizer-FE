import { analyzeStore } from '../../../../../stores/dashboard/analyze.store';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AnalyzeService } from '../analyze.service';
import { isValidYoutubeUrl } from '../../../../../shared/utils/video-url-validation';

@Component({
  selector: 'app-url',
  imports: [FormsModule],
  templateUrl: './url.html',
  styleUrl: './url.scss',
})
export class Url {
  constructor() {}

  protected videoUrl = '';
  protected loading = signal(false);
  protected readonly isValidYoutubeUrl = isValidYoutubeUrl;
  protected readonly analyzeStore = inject(analyzeStore);

  private readonly analyzeService = inject(AnalyzeService);

  protected analyzeVideoUrl(): void {
    if (!isValidYoutubeUrl(this.videoUrl)) return;
    this.analyzeStore.startLoading();
    this.analyzeStore.setVideoUrl(this.videoUrl);
    this.analyzeService.getAnalysisResults(this.videoUrl);
    this.analyzeStore.nextStep();
  }
}
