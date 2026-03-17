import type { AdminRole } from "@/types/domain";

export type AuthenticatedUser = {
  id: string;
  email: string;
  role?: AdminRole;
};

export type AuthSessionState = {
  status: "authenticated" | "unauthenticated";
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
  "TODO: Keep launch auth limited to email/password credentials plus protected account and admin sessions until broader auth requirements are validated.";
