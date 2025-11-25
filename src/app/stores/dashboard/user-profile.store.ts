import { signalStore, withState, withMethods, patchState, withComputed } from '@ngrx/signals';
import type { UserProfile } from '../../models/user-profile.model';

export type UserProfileState = {
  profile: UserProfile | null;
};

const initialState: UserProfileState = {
  profile: null,
};

export const userProfileStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    hasActiveSubscription: (): boolean => store.profile()?.subscription?.status === 'active',
    getSubscriptionPlan: (): string | null => store.profile()?.subscription?.tier ?? null,
    userInitials: (): string | null => {
      const profile = store.profile();
      if (!profile) {
        return '??';
      }

      // Try to get initials from name first
      if (profile.name) {
        const nameParts = profile.name.trim().split(' ');
        if (nameParts.length >= 2) {
          return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
        }
        return profile.name.substring(0, 2).toUpperCase();
      }

      // Fallback to email
      if (profile.email) {
        return profile.email.substring(0, 2).toUpperCase();
      }

      return '??';
    },
  })),
  withMethods((store) => ({
    setProfile(profile: UserProfile | null): void {
      patchState(store, { profile });
    },
  })),
);
