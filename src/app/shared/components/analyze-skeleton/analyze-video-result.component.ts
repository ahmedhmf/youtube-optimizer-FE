import { Component, inject } from '@angular/core';
import { analyzeStore } from '../../../stores/dashboard/analyze.store';

@Component({
  selector: 'app-analyze-skeleton',
  imports: [],
  templateUrl: './analyze-video-result.component.html',
  styleUrl: './analyze-video-result.component.scss',
})
export class AnalyzeVideoResultComponent {
  protected analyzeStore = inject(analyzeStore);

}
