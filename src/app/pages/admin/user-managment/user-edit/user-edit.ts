import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import type { OnInit } from '@angular/core';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { userEditStore } from '../../../../stores/admin/user-edit.store';
import { AdminUserService } from '../../../../services/admin/admin-user.service';
import { CoreTab } from './core-tab/core-tab';
import { Monitoring } from './monitoring/monitoring';
import { Control } from './control/control';
import { Billing } from './billing/billing';
import { Support } from './support/support';

@Component({
  selector: 'app-user-edit',
  imports: [CommonModule, FormsModule, CoreTab, Monitoring, Control, Billing, Support],
  templateUrl: './user-edit.html',
  styleUrl: './user-edit.scss',
  standalone: true,
})
export class UserEdit implements OnInit {
  protected readonly store = inject(userEditStore);
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly adminUserService = inject(AdminUserService);
  private readonly SUCCESS_MESSAGE_TIMEOUT = 3000;

  public ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.loadAllData(userId);
    } else {
      this.store.setErrorMessage('Invalid user ID');
      this.store.setIsLoading(false);
    }
  }

  public loadAllData(userId: string): void {
    this.adminUserService.getUser(userId);
  }

  public switchTab(tab: 'core' | 'monitoring' | 'control' | 'billing' | 'support'): void {
    this.store.setActiveTab(tab);
    this.store.setErrorMessage('');
    this.store.setSuccessMessage('');
  }

  public formatDate(date: string): string {
    return new Date(date).toLocaleString();
  }

  public goBack(): void {
    void this.router.navigate(['/admin/users']);
  }

  private showSuccess(message: string): void {
    this.store.setSuccessMessage(message);
    setTimeout(() => {
      this.store.setSuccessMessage('');
    }, this.SUCCESS_MESSAGE_TIMEOUT);
  }
}
