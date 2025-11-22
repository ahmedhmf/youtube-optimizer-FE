import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import type {
  ActivityLog,
  AdminNote,
  BillingInfo,
  ErrorLog,
  Invoice,
  UserData,
  VideoHistory,
} from '../../models/admin/user.type';
import type { UserUsage } from '../../models/admin/user-usage.type';

type UserState = {
  user: UserData;
  usage: UserUsage | null;
  activityLogs: ActivityLog[];
  videoHistory: VideoHistory[];
  billingInfo: BillingInfo;
  invoices: Invoice[];
  adminNotes: AdminNote[];
  errorLogs: ErrorLog[];
  activeTab: string;
  isLoading: boolean;
  isSaving: boolean;
  errorMessage: string;
  successMessage: string;
  editMode: Record<string, boolean>;
  editValues: Partial<UserData>;
  bonusCredits: number;
  newNote: string;
  availableRoles: string[];
  availableStatuses: string[];
};

const initialState: UserState = {
  user: {} as UserData,
  usage: null,
  activityLogs: [],
  videoHistory: [],
  billingInfo: {
    plan: 'Free',
    planPrice: 0,
    billingCycle: 'N/A',
    paymentMethod: 'N/A',
    nextBillingDate: '',
  },
  invoices: [],
  adminNotes: [],
  errorLogs: [],
  activeTab: 'core',
  isLoading: true,
  isSaving: false,
  errorMessage: '',
  successMessage: '',
  editMode: {},
  editValues: {},
  bonusCredits: 0,
  newNote: '',
  availableRoles: ['user', 'admin', 'moderator', 'premium'],
  availableStatuses: ['active', 'suspended', 'inactive'],
};

export const userEditStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    setErrorMessage(errorMessage: string): void {
      patchState(store, { errorMessage });
    },
    setSuccessMessage(successMessage: string): void {
      patchState(store, { successMessage });
    },
    setIsLoading(isLoading: boolean): void {
      patchState(store, { isLoading });
    },
    setUserData(user: UserData): void {
      patchState(store, { user });
    },
    setIsSaving(isSaving: boolean): void {
      patchState(store, { isSaving });
    },
    setEditModeForField(field: string, isEditing: boolean): void {
      const currentEditMode = store.editMode();
      patchState(store, {
        editMode: {
          ...currentEditMode,
          [field]: isEditing,
        },
      });
    },
    setEditValueForField(field: string, value: UserData[keyof UserData]): void {
      const currentEditValues = store.editValues();
      patchState(store, {
        editValues: {
          ...currentEditValues,
          [field]: value,
        },
      });
    },
    setActiveTab(tab: string): void {
      patchState(store, { activeTab: tab });
    },
    setUserUsage(usage: UserUsage): void {
      patchState(store, { usage });
    },
  })),
);
