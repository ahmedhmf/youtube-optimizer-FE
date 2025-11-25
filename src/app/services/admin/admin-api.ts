import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { userStore } from '../../stores/admin/users.store';
import type { UserListResponse } from '../../models/admin/user.type';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminApi {
  private readonly httpClient = inject(HttpClient);
  private readonly userStore = inject(userStore);
  private readonly baseUrl = environment.backendURL;

  public loadAllUsers(): void {
    this.userStore.setLoading(true);

    const requestParams: Record<string, string> = {
      page: this.userStore.currentPage().toString(),
      limit: this.userStore.pageSize().toString(),
      sortBy: this.userStore.sortBy(),
      sortOrder: this.userStore.sortOrder(),
    };

    if (this.userStore.searchTerm()) {
      requestParams['search'] = this.userStore.searchTerm();
    }

    this.httpClient
      .get<UserListResponse>(`${this.baseUrl}/admin/users`, {
        params: requestParams,
        withCredentials: true,
      })
      .subscribe({
        next: (response) => {
          this.userStore.setUsers(response.users);
          this.userStore.setTotalUsers(response.total);
          this.userStore.setCurrentPage(response.page);
          this.userStore.setTotalPages(response.totalPages);
          this.userStore.setLoading(false);
        },
        error: () => {
          this.userStore.setLoading(false);
        },
      });
  }
}
