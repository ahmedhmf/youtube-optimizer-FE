export type UserProfile = {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  role: string;
  provider: string;
  subscription?: UserProfileSubscription;
  usage: UserProfileUsage;
  features: UserProfileFeatures;
  createdAt: string;
  updatedAt: string;
};

export type UserProfileSubscription = {
  tier: 'free' | 'pro' | 'premium' | 'enterprise';
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd: string | null;
};

export type UserProfileUsage = {
  analysesUsed: number;
  analysesAllowed: number;
  usagePercentage: number;
};

export type UserProfileFeatures = {
  maxAnalysesPerMonth: number;
  maxChannelsPerUser: number;
  advancedAnalytics: boolean;
  prioritySupport: boolean;
  customBranding: boolean;
  apiAccess: boolean;
  bulkOperations: boolean;
  aiSuggestionsLimit: number;
  exportFeatures: boolean;
  integrations: string[];
};
