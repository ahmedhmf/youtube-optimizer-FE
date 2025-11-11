import { Component, computed, effect, inject, OnInit } from '@angular/core';
import { ApiService } from '../../../../services/api';
import { VideoAuditsStore } from '../../../../stores/video-audits.store';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-history',
  imports: [DatePipe, FormsModule],
  templateUrl: './history.html',
  styleUrl: './history.scss',
})
export class History implements OnInit {
  protected api = inject(ApiService);
  protected store = inject(VideoAuditsStore);

  readonly audits = computed(() => this.store.audits());
  readonly loading = computed(() => this.store.loading());
  readonly error = computed(() => this.store.error());
  readonly pagination = computed(() => this.store.pagination());
  readonly needsPaginationRefresh = computed(() => this.store.needsPaginationRefresh?.() || false);

  constructor() {
    effect(() => {
      if (this.needsPaginationRefresh()) {
        const currentPagination = this.pagination();
        const currentAuditsCount = this.audits().length;

        // If current page is empty and we're not on page 1, go to previous page
        if (currentAuditsCount === 0 && currentPagination.page > 1) {
          this.loadHistory(currentPagination.page - 1, true);
        } else if (currentAuditsCount < currentPagination.limit) {
          // Reload current page to fill gaps
          this.loadHistory(currentPagination.page, true);
        }

        // Clear the flag
        this.store.clearPaginationRefreshFlag();
      }
    });
  }

  ngOnInit(): void {
    this.loadHistory(1, true);
  }

  getShowingStart(): number {
    const pag = this.pagination();
    return (pag.page - 1) * pag.limit + 1;
  }

  getShowingEnd(): number {
    const pag = this.pagination();
    return Math.min(pag.page * pag.limit, pag.total);
  }

  loadHistory(page = 1, reset = false): void {
    this.api.getUserHistory(page, 5, reset);
  }

  loadNextPage(): void {
    const currentPagination = this.pagination();
    if (currentPagination.hasNext) {
      this.loadHistory(currentPagination.page + 1, false);
    }
  }

  loadPreviousPage(): void {
    const currentPagination = this.pagination();
    if (currentPagination.hasPrev) {
      this.loadHistory(currentPagination.page - 1, true);
    }
  }

  goToPage(page: number): void {
    this.loadHistory(page, true);
  }

  onRetryLoad(): void {
    this.store.clearError();
    this.loadHistory(1, true);
  }

  deleteAudit(id: string): void {
    if (confirm('Are you sure you want to delete this analysis?')) {
      this.api.deleteAudit(id);
    }
  }

  // Helper method to get page numbers for pagination
  getPageNumbers(): number[] {
    const currentPage = this.pagination().page;
    const totalPages = this.pagination().totalPages;
    const pages: number[] = [];

    // Show max 5 page numbers
    const maxPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    const endPage = Math.min(totalPages, startPage + maxPages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }
}
