export type UserData = {
  id: string;
  email: string;
  name: string;
  role: string;
  provider: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'suspended' | 'inactive';
  lastActivity?: string;
};

export type UserListResponse = {
  users: UserData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PaginationParams = {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type ActivityLog = {
  id: string;
  action: string;
  timestamp: string;
  ipAddress: string;
  details: string;
};

export type VideoHistory = {
  id: string;
  videoId: string;
  title: string;
  analyzedAt: string;
  status: 'completed' | 'failed' | 'pending';
  tokensUsed: number;
};

export type BillingInfo = {
  plan: string;
  planPrice: number;
  billingCycle: 'monthly' | 'yearly' | 'N/A';
  nextBillingDate: string;
  paymentMethod: string;
};

export type Invoice = {
  id: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'failed';
  downloadUrl: string;
};

export type AdminNote = {
  id: string;
  note: string;
  createdBy: string;
  createdAt: string;
};

export type ErrorLog = {
  id: string;
  errorType: string;
  message: string;
  timestamp: string;
  videoId?: string;
  resolved: boolean;
};
