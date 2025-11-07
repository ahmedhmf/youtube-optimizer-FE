import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { User } from '@supabase/supabase-js';

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
        setPagesLinks(links: pagesLinks[]): void {
            patchState(store, { pagesLinks: links });
        },
        setMenuItems(items: pagesLinks[]): void {
            patchState(store, { menuItems: items });
        },
        setSidenav(isOpened: boolean): void {
            patchState(store, { sidenavOpened: isOpened });
        },
        setIsAuthenticated(isAuth: boolean): void {
            patchState(store, { isAuthenticated: isAuth });
        },
        setUser(user: User | null): void {
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