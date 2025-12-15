import { Component } from '@angular/core';
import { DashboardValueCard } from '../../../ui-components/dashboard-value-card/dashboard-value-card';
import { AdminSendNotificationComponent } from '../../../ui-components/admin-send-notification/admin-send-notification';

@Component({
  selector: 'app-dashboard',
  imports: [DashboardValueCard, AdminSendNotificationComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  protected totalUsers = 0;
  protected newUsersToday = 0;
  protected totalVideos = 0;
  protected videosToday = 0;
  protected totalTokens = 0;
  protected errors24h = 0;
}
