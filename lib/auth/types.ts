import type { AdminRole } from "@/types/domain";

export type AuthenticatedUser = {
  id: string;
  email: string;
  role?: AdminRole;
};

export type AuthSessionState = {
  status: "placeholder-authenticated" | "placeholder-unauthenticated";
  user: AuthenticatedUser | null;
  surface: "account" | "admin";
};

export type SessionSummary = {
  surface: "account" | "admin";
  status: AuthSessionState["status"];
  roleLabel: AdminRole | "customer-account";
  isAuthenticated: boolean;
  todo: string;
};

export interface AuthService {
  getSession(): Promise<AuthenticatedUser | null>;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
}

export const authServiceTodo =
  "TODO: Select and implement the auth provider. Customer auth and admin role handling depend on that decision.";
