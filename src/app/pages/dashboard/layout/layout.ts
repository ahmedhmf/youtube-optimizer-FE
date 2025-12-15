import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { userProfileStore } from '../../../stores/dashboard/user-profile.store';
import { Nav } from './nav/nav';
import { Notifications } from './notifications/notifications';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, Nav, Notifications],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
  protected readonly store = inject(userProfileStore);
}
