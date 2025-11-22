import { Component } from '@angular/core';
import { DashboardValueCard } from '../../../ui-components/dashboard-value-card/dashboard-value-card';

@Component({
  selector: 'app-dashboard',
  imports: [DashboardValueCard],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  totalUsers = 0;
  newUsersToday = 0;

  totalVideos = 0;
  videosToday = 0;

  totalTokens = 0;
  errors24h = 0;
}
