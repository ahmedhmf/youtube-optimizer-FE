import { Component, input } from '@angular/core';

@Component({
  selector: 'app-dashboard-value-card',
  imports: [],
  templateUrl: './dashboard-value-card.html',
  styleUrl: './dashboard-value-card.scss',
})
export class DashboardValueCard {
  public mainValue = input<number | string>(0);
  public subValue = input<number | string>(0);
  public title = input<string>('');
  public iconName = input<string>('');
  public subValueColorClass = input<string>('text-green-600');
  public iconColorClass = input<string>('text-indigo-600');
}
