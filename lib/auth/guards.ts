import type { AdminModuleKey } from "@/features/admin/admin-data";
import { supportedAdminRoles } from "@/lib/auth/config";
import { createAuthSessionState, createSessionSummary } from "@/lib/auth/helpers";
import type { AuthenticatedUser } from "@/lib/auth/types";
import type { AdminRole } from "@/types/domain";

export type AdminAccessDecision = {
  status: "allowed" | "requires-auth" | "requires-role";
  allowedRoles: readonly AdminRole[];
  currentRole?: AdminRole;
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
      sessionSummary,
    };
  }

  if (!input.user.role || !allowedRoles.includes(input.user.role)) {
    return {
      status: "requires-role",
      allowedRoles,
      currentRole: input.user.role,
      sessionSummary,
    };
  }

  return {
    status: "allowed",
    allowedRoles,
    currentRole: input.user.role,
    sessionSummary,
  };
}

export const adminGuardTodo =
  "TODO: Replace placeholder admin access decisions with real session checks and route protection when auth is implemented.";
