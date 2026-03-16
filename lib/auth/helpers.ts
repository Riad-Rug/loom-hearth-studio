import { authConfig, authConfigTodo } from "@/lib/auth/config";
import type {
  AuthenticatedUser,
  AuthSessionState,
  SessionSummary,
} from "@/lib/auth/types";

export function createAuthSessionState(
  user: AuthenticatedUser | null,
  surface: "account" | "admin",
): AuthSessionState {
  return {
    status: user ? "placeholder-authenticated" : "placeholder-unauthenticated",
    user,
    surface,
  };
}

export function createSessionSummary(session: AuthSessionState): SessionSummary {
  return {
    surface: session.surface,
    status: session.status,
    roleLabel:
      session.surface === "admin"
        ? session.user?.role ?? "viewer"
        : authConfig.customer.mode,
    isAuthenticated: Boolean(session.user),
    todo: authConfigTodo,
  };
}
