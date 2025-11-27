import { Component, inject } from '@angular/core';
import { AdminUserService } from '../../../../../services/admin/admin-user.service';
import { userEditStore } from '../../../../../stores/admin/user-edit.store';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-billing',
  imports: [DatePipe],
  templateUrl: './billing.html',
  styleUrl: './billing.scss',
})
export class Billing {
  protected readonly store = inject(userEditStore);
  private readonly adminUserService = inject(AdminUserService);

  // public loadBillingInfo(userId: string): void {
  //   this.http
  //     .get<BillingInfo>(`${environment.backendURL}/api/v1/admin/users/${userId}/billing`)
  //     .subscribe({
  //       next: (data) => {
  //         this.billingInfo = data;
  //       },
  //       error: () => {
  //         // Mock data
  //         this.billingInfo = {
  //           plan: 'Premium',
  //           planPrice: 29.99,
  //           billingCycle: 'monthly',
  //           nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  //           paymentMethod: 'Visa ending in 1234',
  //         };
  //       },
  //     });
  //   this.http.get<Invoice[]>(`${environment.backendURL}/api/v1/admin/users/${userId}/invoices`).subscribe({
  //     next: (data) => {
  //       this.invoices = data;
  //     },
  //     error: () => {
  //       // Mock data
  //       this.invoices = [
  //         {
  //           id: '1',
  //           amount: 29.99,
  //           date: new Date().toISOString(),
  //           status: 'paid',
  //           downloadUrl: '#',
  //         },
  //         {
  //           id: '2',
  //           amount: 29.99,
  //           date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  //           status: 'paid',
  //           downloadUrl: '#',
  //         },
  //       ];
  //     },
  //   });
  // }
}
