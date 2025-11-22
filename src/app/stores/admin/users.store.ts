import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import type { UserData } from '../../models/admin/user.type';

type UserState = {
  users: UserData[];
  isLoading: boolean;
  totalUsers: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  searchTerm: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  pageSizeOptions: number[];
};

const initialState: UserState = {
  users: [],
  isLoading: false,
  totalUsers: 0,
  currentPage: 1,
  totalPages: 0,
  pageSize: 10,
  searchTerm: '',
  sortBy: 'created_at',
  sortOrder: 'asc',
  // eslint-disable-next-line no-magic-numbers
  pageSizeOptions: [5, 10, 25, 50, 100],
};

export const userStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    setLoading(isLoading: boolean): void {
      patchState(store, { isLoading });
    },
    setUsers(users: UserData[]): void {
      patchState(store, { users });
    },
    setTotalUsers(totalUsers: number): void {
      patchState(store, { totalUsers });
    },
    setCurrentPage(currentPage: number): void {
      patchState(store, { currentPage });
    },
    setTotalPages(totalPages: number): void {
      patchState(store, { totalPages });
    },
    setPageSize(pageSize: number): void {
      patchState(store, { pageSize });
    },
    setSearchTerm(searchTerm: string): void {
      patchState(store, { searchTerm });
    },
    setSortBy(sortBy: string): void {
      patchState(store, { sortBy });
    },
    setSortOrder(sortOrder: 'asc' | 'desc'): void {
      patchState(store, { sortOrder });
    },
  })),
);
