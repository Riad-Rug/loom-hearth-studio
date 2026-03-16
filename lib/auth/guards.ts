import type { AdminModuleKey } from "@/features/admin/admin-data";
import type { AccountAuthMode } from "@/features/account/account-data";
import { supportedAdminRoles } from "@/lib/auth/config";
import { createAuthSessionState, createSessionSummary } from "@/lib/auth/helpers";
import type { AuthenticatedUser } from "@/lib/auth/types";
import type { AdminRole } from "@/types/domain";

export type AdminAccessDecision = {
  status: "allowed" | "requires-auth" | "requires-role";
  allowedRoles: readonly AdminRole[];
  currentRole?: AdminRole;
  redirectTarget: "/admin" | "/admin/login" | "/";
  sessionSummary: ReturnType<typeof createSessionSummary>;
};

export type AccountAccessDecision = {
  status: "allowed" | "requires-auth" | "guest-only";
  routeKind: "dashboard" | AccountAuthMode;
  redirectTarget: "/account" | "/account/login";
  sessionSummary: ReturnType<typeof createSessionSummary>;
};

const adminModuleAllowedRoles: Record<AdminModuleKey, readonly AdminRole[]> = {
  dashboard: supportedAdminRoles,
  products: supportedAdminRoles,
  orders: supportedAdminRoles,
  customers: supportedAdminRoles,
  blog: supportedAdminRoles,
  newsletter: supportedAdminRoles,
  promos: supportedAdminRoles,
  seo: supportedAdminRoles,
  analytics: supportedAdminRoles,
};

export function getAdminAccessDecision(input: {
  user: AuthenticatedUser | null;
  moduleKey: AdminModuleKey;
}): AdminAccessDecision {
  const sessionSummary = createSessionSummary(createAuthSessionState(input.user, "admin"));
  const allowedRoles = adminModuleAllowedRoles[input.moduleKey];

  if (!input.user) {
    return {
      status: "requires-auth",
      allowedRoles,
      redirectTarget: "/admin/login",
      sessionSummary,
    };
  }

  if (!input.user.role || !allowedRoles.includes(input.user.role)) {
    return {
      status: "requires-role",
      allowedRoles,
      currentRole: input.user.role,
      redirectTarget: "/",
      sessionSummary,
    };
  }

  return {
    status: "allowed",
    allowedRoles,
    currentRole: input.user.role,
    redirectTarget: "/admin",
    sessionSummary,
  };
}

export const adminGuardTodo =
  "TODO: Replace placeholder admin access decisions with real session checks and route protection when auth is implemented.";

export function getAccountAccessDecision(input: {
  user: AuthenticatedUser | null;
  routeKind: "dashboard" | AccountAuthMode;
}): AccountAccessDecision {
  const sessionSummary = createSessionSummary(createAuthSessionState(input.user, "account"));

  if (input.routeKind === "dashboard") {
    return {
      status: input.user ? "allowed" : "requires-auth",
      routeKind: input.routeKind,
      redirectTarget: input.user ? "/account" : "/account/login",
      sessionSummary,
    };
  }

  return {
    status: input.user ? "guest-only" : "allowed",
    routeKind: input.routeKind,
    redirectTarget: input.user ? "/account" : "/account/login",
    sessionSummary,
  };
}

export const accountGuardTodo =
  "TODO: Replace placeholder account access decisions with real customer session checks and route redirects when auth is implemented.";
