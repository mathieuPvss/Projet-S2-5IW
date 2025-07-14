export interface DecodedToken {
  sub: string;
  email: string;
  role: 'user' | 'admin';
  exp: number; // expiration time in seconds since epoch
  iat: number; // issued at time in seconds since epoch
}
