import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Dashboard {
    readonly historyVisible = signal(true);
  toggleHistory(): void {
    this.historyVisible.update((v) => !v);
  }

  refreshHistory(): void {
  }

}
