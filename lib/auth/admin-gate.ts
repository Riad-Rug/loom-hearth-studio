import type { AdminAccessDecision } from "@/lib/auth/guards";

export type AdminGatePresentation = {
  roleNoteTitle: string;
  roleNoteBody: string;
  supportedRolesLabel: string;
  currentRoleLabel: string;
  accessStateLabel: string;
  allowedRolesLabel: string;
  redirectTargetLabel: string;
  gateTitle: string;
  gateBody: string;
  gateRedirectLabel: string;
};

export function createAdminGatePresentation(
  accessDecision: AdminAccessDecision,
): AdminGatePresentation {
  return {
    roleNoteTitle: "Role note",
    roleNoteBody:
      "Admin, Editor, and Viewer are PRD-defined roles. This slice shows that as presentation only, without auth or route protection.",
    supportedRolesLabel: `Supported boundary roles: ${accessDecision.allowedRoles.join(", ")}`,
    currentRoleLabel: `Current role: ${accessDecision.currentRole ?? "none"}`,
    accessStateLabel: `Route access state: ${accessDecision.status}`,
    allowedRolesLabel: `Allowed on this route: ${accessDecision.allowedRoles.join(", ")}`,
    redirectTargetLabel: `Boundary redirect target: ${accessDecision.redirectTarget}`,
    gateTitle: "Route gate placeholder",
    gateBody:
      "This admin route is reserved for authenticated back-office users whose role is allowed by the boundary configuration.",
    gateRedirectLabel: `Boundary redirect target: ${accessDecision.redirectTarget}`,
  };
}
