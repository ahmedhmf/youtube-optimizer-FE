import { analyzeStore } from './../../../../../stores/dashboard/analyze.store';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-results',
  imports: [FormsModule],
  templateUrl: './results.html',
  styleUrl: './results.scss',
})
export class Results {
  protected readonly analyzeStore = inject(analyzeStore);
  protected generated = {
    title: 'The Ultimate Guide to Boosting Your YouTube Channel Growth',
    description: 'Learn the best strategies and tips to grow your YouTube channel effectively.',
    tags: ['YouTube', 'Growth', 'Marketing', 'Video'],
    thumbnail: '/assets/thumbnails/ultimate-guide.png',
  };

  protected copy(arg0: string): void {
    throw new Error('Method not implemented.');
  }
  protected regenerateThumbnail(): void {
    throw new Error('Method not implemented.');
  }
  protected changeTemplate(): void {
    throw new Error('Method not implemented.');
  }
}
