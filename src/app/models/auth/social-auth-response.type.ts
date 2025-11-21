export type SocialAuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    picture?: string;
    provider: 'google' | 'github';
  };
};
