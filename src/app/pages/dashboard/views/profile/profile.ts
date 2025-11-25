import { Component, inject } from '@angular/core';
import { userProfileStore } from '../../../../stores/dashboard/user-profile.store';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-profile',
  imports: [DatePipe],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  protected readonly store = inject(userProfileStore);
}
