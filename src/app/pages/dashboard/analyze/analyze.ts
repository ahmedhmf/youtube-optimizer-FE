import { ChangeDetectionStrategy, Component, EventEmitter, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../services/auth';
import { MatIcon } from '@angular/material/icon';
import { JsonPipe } from '@angular/common';
import { ApiService } from '../../../services/api';
import { VideoAuditsStore } from '../../../stores/video-audits.store';


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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalyzeComponent {
  protected store = inject(VideoAuditsStore);
  private supabase = inject(AuthService);
  private api = inject(ApiService);

  // Inputs
  readonly sourceUrl = signal<string>('');
  readonly title = signal<string>('');

  canAnalyze(): boolean {
    return !!this.sourceUrl();
  }

  async analyze(): Promise<void> {
    try {
      if (!this.canAnalyze()) {return;}

      this.store.setMessage('');
      const form = new FormData();
      if (this.sourceUrl()) {form.append('sourceUrl', this.sourceUrl().trim());}
      if (this.title()) {form.append('title', this.title().trim());}

      const userId = (await this.supabase.getUser())?.id;
      if (userId) {form.append('userId', userId);}

      this.api.analyzeVideo(this.sourceUrl());
    } catch (err: any) {
      this.store.setMessage((err?.message as string) ?? 'Audits failed');
    }
  }

  reset(): void {
    this.sourceUrl.set('');
    this.title.set('');
    this.store.setStatus('idle');
    this.store.setMessage('');
  }
}
