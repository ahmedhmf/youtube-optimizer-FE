import type { SecurityResponse } from './security-response.type';

export type AuthResponse = {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  security: SecurityResponse;
  user: {
    createdAt: string;
    email: string;
    id: string;
    name: string;
    picture: string;
    provider: string;
    roles: string;
    updatedAt: string;
  };
};
