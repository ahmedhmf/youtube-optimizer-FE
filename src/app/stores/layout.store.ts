import { computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { User } from '@supabase/supabase-js';
import { interval } from 'rxjs';

type pagesLinks = {
    label: string;
    action: () => void;
}

const initialState = {
    sidenavOpened: false,
    isAuthenticated: false,
    user: null as User | null,
    pagesLinks: [] as pagesLinks[],
    menuItems: [] as pagesLinks[],
};

export const LayoutStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withMethods((store) => ({
        setPagesLinks(links: pagesLinks[]) {
            patchState(store, { pagesLinks: links });
        },
        setMenuItems(items: pagesLinks[]) {
            patchState(store, { menuItems: items });
        },
        setSidenav(isOpened: boolean) {
            patchState(store, { sidenavOpened: isOpened });
        },
        setIsAuthenticated(isAuth: boolean) {
            patchState(store, { isAuthenticated: isAuth });
        },
        setUser(user: User | null) {
            patchState(store, { user });
        }
    })),
    withComputed(store => ({
        displayName: computed(() => store.user()?.user_metadata['name'] || ''),
        userInitials: computed(() => {
            if (store.user()?.user_metadata['name']) {
                const names = store.user()?.user_metadata['name'].trim().split(' ');
                if (names.length >= 2) {
                    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
                }
                return names[0].substring(0, 2).toUpperCase();
            }
            if (store.user()?.email) {
                const emailUsername = store.user()?.email?.split('@')[0];
                return emailUsername?.substring(0, 2).toUpperCase();
            }
            return 'US';
        })
    })),
);