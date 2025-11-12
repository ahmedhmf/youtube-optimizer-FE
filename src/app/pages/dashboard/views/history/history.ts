import type { OnInit } from '@angular/core';
import { Component, computed, effect, inject } from '@angular/core';
import { ApiService } from '../../../../services/api';
import { videoAuditsStore } from '../../../../stores/video-audits.store';
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
  protected store = inject(videoAuditsStore);

  protected readonly audits = computed(() => this.store.audits());
  protected readonly loading = computed(() => this.store.loading());
  protected readonly pagination = computed(() => this.store.pagination());
  protected readonly needsPaginationRefresh = computed(
    () => this.store.needsPaginationRefresh() || false,
  );
  private readonly PAGE_SIZE = 5;

  constructor() {
    effect(() => {
      if (this.needsPaginationRefresh()) {
        const currentPagination = this.pagination();
        const currentAuditsCount = this.audits().length;

        if (currentAuditsCount === 0 && currentPagination.page > 1) {
          this.loadHistory(currentPagination.page - 1, true);
        } else if (currentAuditsCount < currentPagination.limit) {
          this.loadHistory(currentPagination.page, true);
        }

        this.store.clearPaginationRefreshFlag();
      }
    });
  }

  public ngOnInit(): void {
    this.loadHistory(1, true);
  }

  protected getShowingStart(): number {
    const pag = this.pagination();
    return (pag.page - 1) * pag.limit + 1;
  }

  protected getShowingEnd(): number {
    const pag = this.pagination();
    return Math.min(pag.page * pag.limit, pag.total);
  }

  protected loadHistory(page = 1, reset = false): void {
    this.api.getUserHistory(page, this.PAGE_SIZE, reset);
  }

  protected loadNextPage(): void {
    const currentPagination = this.pagination();
    if (currentPagination.hasNext) {
      this.loadHistory(currentPagination.page + 1, false);
    }
  }

  protected loadPreviousPage(): void {
    const currentPagination = this.pagination();
    if (currentPagination.hasPrev) {
      this.loadHistory(currentPagination.page - 1, true);
    }
  }

  protected goToPage(page: number): void {
    this.loadHistory(page, true);
  }

  protected deleteAudit(id: string): void {
    // eslint-disable-next-line no-alert
    if (confirm('Are you sure you want to delete this analysis?')) {
      this.api.deleteAudit(id);
    }
  }

  // Helper method to get page numbers for pagination
  protected getPageNumbers(): number[] {
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
