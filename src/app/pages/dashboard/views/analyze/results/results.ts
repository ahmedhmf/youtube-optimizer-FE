import { analyzeStore } from './../../../../../stores/dashboard/analyze.store';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-results',
  imports: [FormsModule],
  templateUrl: './results.html',
  styleUrl: './results.scss',
})
export class Results {
  protected readonly analyzeStore = inject(analyzeStore);
  protected readonly copiedId = signal<string | null>(null);

  protected generated = {
    title: 'The Ultimate Guide to Boosting Your YouTube Channel Growth',
    description: 'Learn the best strategies and tips to grow your YouTube channel effectively.',
    tags: ['YouTube', 'Growth', 'Marketing', 'Video'],
    thumbnail: '/assets/thumbnails/ultimate-guide.png',
  };

  protected copy(text: string, id?: string): void {
    navigator.clipboard.writeText(text).then(() => {
      if (id) {
        this.copiedId.set(id);
        setTimeout(() => {
          this.copiedId.set(null);
        }, 2000);
      }
    });
  }

  protected regenerateThumbnail(): void {
    throw new Error('Method not implemented.');
  }

  protected changeTemplate(): void {
    throw new Error('Method not implemented.');
  }
}
