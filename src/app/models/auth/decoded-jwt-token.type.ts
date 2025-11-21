export type DecodedJwtToken = {
  sub: string;
  email: string;
  roles: string[];
  exp: number;
  iat: number;
  [key: string]: unknown;
};
