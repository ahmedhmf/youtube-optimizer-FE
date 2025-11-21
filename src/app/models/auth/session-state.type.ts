export type SessionState = {
  isActive: boolean;
  userId: string | null;
  email: string | null;
  roles: string[];
  lastActivity: number;
  expiresAt: number | null;
};
