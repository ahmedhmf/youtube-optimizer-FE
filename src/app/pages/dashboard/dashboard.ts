import { Component, signal } from '@angular/core';
import { AnalyzeComponent } from './analyze/analyze';
import { History } from './history/history';
import { MatToolbar } from '@angular/material/toolbar';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard',
  imports: [
    AnalyzeComponent,
    History,
    MatToolbar,
    MatCard,
    MatIcon,
    MatCardContent,
    MatCardTitle,
    MatCardHeader
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
    historyVisible = signal(true);
  toggleHistory() {
    this.historyVisible.update((v) => !v);
  }

  refreshHistory() {
  }

}
