import { analyzeStore } from './../../../../../stores/dashboard/analyze.store';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AnalyzeService } from '../analyze.service';

@Component({
  selector: 'app-url',
  imports: [FormsModule],
  templateUrl: './url.html',
  styleUrl: './url.scss',
})
export class Url {
  protected videoUrl = '';
  private readonly analyzeStore = inject(analyzeStore);
  private readonly analyzeService = inject(AnalyzeService);
  private readonly router = inject(Router);

  protected nextStep(): void {
    this.analyzeStore.setVideoUrl(this.videoUrl);
    this.analyzeService.getAnalysisResults(this.videoUrl);
    void this.router.navigate(['/dashboard/analyze/generation']);
    this.analyzeStore.nextStep();
  }
}
