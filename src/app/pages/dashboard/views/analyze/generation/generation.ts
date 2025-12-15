import { analyzeStore } from './../../../../../stores/dashboard/analyze.store';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AnalyzeService } from '../analyze.service';
import { NgClass } from '@angular/common';
import { AnalyzeVideoResultComponent } from '../../../../../shared/components/analyze-skeleton/analyze-video-result.component';

@Component({
  selector: 'app-generation',
  imports: [FormsModule, NgClass, AnalyzeVideoResultComponent],
  templateUrl: './generation.html',
  styleUrl: './generation.scss',
})
export class Generation {
  protected analyzeStore = inject(analyzeStore);
  private readonly analyzeService = inject(AnalyzeService);

  protected next(): void {
    this.analyzeService.generateContent(
      this.analyzeStore.videoUrl(),
      this.analyzeStore.enabledGenerations(),
    );
    this.analyzeStore.nextStep();
  }
}
