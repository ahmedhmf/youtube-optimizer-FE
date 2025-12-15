/* eslint-disable @typescript-eslint/no-explicit-any */
export type UserUsage = {
  userId: string;
  email: string;
  name: string;
  subscriptionTier: string;
  videoAnalysis: VideoAnalysis;
  tokens: Tokens;
  apiCalls: ApiCall;
  recentActivities: any[];
  videoAnalysisHistory: VideoAnalysisHistory[];
  period: Period;
};

export type VideoAnalysis = {
  totalAnalyzed: number;
  monthlyAnalyzed: number;
  limit: number;
  remaining: number;
  percentageUsed: number;
};

export type Tokens = {
  totalUsed: number;
  monthlyUsed: number;
  limit: number;
  remaining: number;
  percentageUsed: number;
  breakdown: any[];
};

export type ApiCall = {
  totalCalls: number;
  monthlyCallsCount: number;
  limit: number;
  remaining: number;
  percentageUsed: number;
  byEndpoint: any[];
};

export type VideoAnalysisHistory = {
  id: string;
  videoTitle: string;
  videoUrl: string;
  analysisType: string;
  tokensUsed: number;
  status: string;
  createdAt: string;
};

export type Period = {
  startDate: string;
  endDate: string;
  daysRemaining: number;
};
