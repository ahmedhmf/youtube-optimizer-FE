import { analyzeStore } from './../../../../../stores/dashboard/analyze.store';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AnalyzeService } from '../analyze.service';

@Component({
  selector: 'app-generation',
  imports: [FormsModule],
  templateUrl: './generation.html',
  styleUrl: './generation.scss',
})
export class Generation {
  protected analyzeStore = inject(analyzeStore);
  private readonly analyzeService = inject(AnalyzeService);
  private readonly router = inject(Router);

  protected next(): void {
    this.analyzeService.generateContent(
      this.analyzeStore.videoUrl(),
      this.analyzeStore.enabledGenerations(),
    );
    void this.router.navigate(['/dashboard/analyze/thumbnail-style']);
  }
}
