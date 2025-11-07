import { Component, EventEmitter, HostListener, inject, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../services/auth';
import { MatIcon } from '@angular/material/icon';
import { JsonPipe } from '@angular/common';
import { ApiService } from '../../../services/api';
import { VideoAnalysisStore } from '../../../stores/video-analysis.store';


@Component({
  selector: 'app-analyze',
  templateUrl: './analyze.html',
  styleUrls: ['./analyze.scss'],
  imports: [
    FormsModule,
    MatLabel,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatIcon,
    JsonPipe
  ]
})
export class AnalyzeComponent {
  protected store = inject(VideoAnalysisStore);
  private supabase = inject(AuthService);
  private api = inject(ApiService);

  // Inputs
  sourceUrl = signal<string>('');
  title = signal<string>('');

  constructor() { }

  canAnalyze() {
    return !!this.sourceUrl();
  }

  async analyze() {
    try {
      if (!this.canAnalyze()) return;

      this.store.setMessage('');
      const form = new FormData();
      if (this.sourceUrl()) form.append('sourceUrl', this.sourceUrl().trim());
      if (this.title()) form.append('title', this.title().trim());

      const userId = (await this.supabase.getUser())?.id;
      if (userId) form.append('userId', userId);

      this.api.analyzeVideo(this.sourceUrl());
    } catch (err: any) {
      this.store.setMessage(err?.message ?? 'Analysis failed');
    }
  }

  reset() {
    this.sourceUrl.set('');
    this.title.set('');
    this.store.setStatus('idle');
    this.store.setMessage('');
  }
}
