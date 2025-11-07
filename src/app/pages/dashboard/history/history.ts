import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth';
import { MatCard, MatCardActions, MatCardContent, MatCardSubtitle, MatCardTitle } from '@angular/material/card';
import { ApiService } from '../../../services/api';
import { MatIcon } from '@angular/material/icon';
import { CommonModule, DatePipe } from '@angular/common';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { VideoAnalysisStore } from '../../../stores/video-analysis.store';

@Component({
  selector: 'app-history',
  imports: [
    MatCard,
    MatCardContent,
    MatCardTitle,
    MatCardSubtitle,
    MatCardActions,
    MatIcon,
    DatePipe,
    MatFormField,
    FormsModule,
    MatLabel,
    MatInput
  ],
  templateUrl: './history.html',
  styleUrl: './history.scss',
})
export class History implements OnInit {
  protected store = inject(VideoAnalysisStore);
  private api = inject(ApiService);

  loading = false;
  audits: any[] = [];
  error?: string;
  searchTerm = '';

  constructor() {
    this.api.getUserHistory()

  }

  ngOnInit() {
    this.fetchHistory();
  }

  fetchHistory() {
  }

  filteredVideos() {
    const term = this.searchTerm.toLowerCase();
    return this.audits.filter(
      (v) =>
        v.video_title?.toLowerCase().includes(term)
    );
  }

  delete(video: any) {

  }

  regenerate(video: any) {

  }

  view(video: any) { }
}