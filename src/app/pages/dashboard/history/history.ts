import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { ApiService } from '../../../services/api';
import { MatIcon } from '@angular/material/icon';
import { DatePipe } from '@angular/common';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { VideoAuditsStore } from '../../../stores/video-audits.store';

@Component({
  selector: 'app-history',
  imports: [
    MatCard,
    MatIcon,
    DatePipe,
    MatFormField,
    FormsModule,
    MatLabel,
    MatInput
  ],
  templateUrl: './history.html',
  styleUrl: './history.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class History implements OnInit {
  protected store = inject(VideoAuditsStore);
  private api = inject(ApiService);

  loading = false;
  error?: string;
  searchTerm = '';

  constructor() {
    this.api.getUserHistory()

  }

  ngOnInit(): void {
    this.fetchHistory();
  }

  fetchHistory(): void {
  }

  filteredVideos(): void {
    // const term = this.searchTerm.toLowerCase();
    // return this.audits.filter(
    //   (v) =>
    //     v.video_title?.toLowerCase().includes(term)
    // );
  }

  delete(videoId: string): void {
    this.api.deleteAudit(videoId);
  }
}