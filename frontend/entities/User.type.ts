export interface User {
  id: string;
  email: string;
  role: "user" | "admin";
  verified?: boolean;
  password?: string;
}
