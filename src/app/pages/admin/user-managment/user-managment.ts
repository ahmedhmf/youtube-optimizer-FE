import type { OnInit } from '@angular/core';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import type { UserData } from '../../../models/admin/user.type';
import { userStore } from '../../../stores/admin/users.store';
import { AdminApi } from '../../../services/admin/admin-api';

@Component({
  selector: 'app-user-managment',
  imports: [CommonModule, FormsModule],
  templateUrl: './user-managment.html',
  styleUrl: './user-managment.scss',
})
export class UserManagment implements OnInit {
  protected readonly store = inject(userStore);
  private readonly adminApi = inject(AdminApi);
  private readonly router = inject(Router);

  public ngOnInit(): void {
    this.adminApi.loadAllUsers();
  }

  protected onReloadButtonClick(): void {
    this.adminApi.loadAllUsers();
  }

  protected onPageChange(page: number): void {
    this.store.setCurrentPage(page);
    this.adminApi.loadAllUsers();
  }

  protected onPageSizeChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const newSize = Number(selectElement.value);
    this.store.setPageSize(newSize);
    this.store.setCurrentPage(1);
    this.adminApi.loadAllUsers();
  }

  protected onSearch(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const term = inputElement.value;
    this.store.setSearchTerm(term);
    this.store.setCurrentPage(1);
    this.adminApi.loadAllUsers();
  }

  protected onSort(column: string): void {
    if (this.store.sortBy() === column) {
      this.store.setSortOrder(this.store.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.store.setSortBy(column);
      this.store.setSortOrder('asc');
    }
    this.store.setCurrentPage(1);
    this.adminApi.loadAllUsers();
  }

  protected getSortIcon(column: string): string {
    if (this.store.sortBy() !== column) {
      return '↕️';
    }
    return this.store.sortOrder() === 'asc' ? '↗️' : '↘️';
  }

  protected getDisplayName(user: UserData): string {
    return `${user.name}`;
  }

  protected getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.store.currentPage() - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(this.store.totalPages(), startPage + maxVisiblePages - 1);

    // Adjust start if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  protected getStartRecord(): number {
    return (this.store.currentPage() - 1) * this.store.pageSize() + 1;
  }

  protected getEndRecord(): number {
    return Math.min(this.store.currentPage() * this.store.pageSize(), this.store.totalUsers());
  }

  protected trackByUserId(index: number, user: UserData): string {
    return user.id;
  }

  protected onEditUser(userId: string): void {
    void this.router.navigate(['/admin/users', userId]);
  }
}
