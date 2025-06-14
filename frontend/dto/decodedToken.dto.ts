export interface DecodedToken {
  id: string;
  firstname: string;
  email: string;
  isAdmin?: boolean;
  exp: number; // expiration time in seconds since epoch
  iat: number; // issued at time in seconds since epoch
}
