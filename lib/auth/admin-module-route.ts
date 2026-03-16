import type { AdminModuleKey } from "@/features/admin/admin-data";
import { createAdminModuleCardViewModels } from "@/features/admin/admin-card-view-model";
import type { AdminAccessDecision } from "@/lib/auth/guards";
import type { AdminGatePresentation } from "@/lib/auth/admin-gate";

export type AdminModuleRouteCardView = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
};

export type AdminModuleRouteViewModel = {
  header: {
    eyebrow: string;
    title: string;
    description: string;
  };
  roleNote: {
    title: string;
    lines: string[];
  };
  gate: {
    title: string;
    body: string;
    redirectLabel: string;
  };
  cards: AdminModuleRouteCardView[];
  accessStatus: AdminAccessDecision["status"];
  moduleKey: AdminModuleKey;
};

export function createAdminModuleRouteViewModel(input: {
  moduleKey: AdminModuleKey;
  module: {
    eyebrow: string;
    title: string;
    description: string;
    cards: { title: string; body: string }[];
  };
  accessDecision: AdminAccessDecision;
  gatePresentation: AdminGatePresentation;
  adminGuardTodo: string;
}): AdminModuleRouteViewModel {
  return {
    moduleKey: input.moduleKey,
    header: {
      eyebrow: input.module.eyebrow,
      title: input.module.title,
      description: input.module.description,
    },
    roleNote: {
      title: input.gatePresentation.roleNoteTitle,
      lines: [
        input.gatePresentation.roleNoteBody,
        input.gatePresentation.supportedRolesLabel,
        input.gatePresentation.currentRoleLabel,
        input.gatePresentation.accessStateLabel,
        input.gatePresentation.allowedRolesLabel,
        input.gatePresentation.redirectTargetLabel,
        input.adminGuardTodo,
      ],
    },
    gate: {
      title: input.gatePresentation.gateTitle,
      body: input.gatePresentation.gateBody,
      redirectLabel: input.gatePresentation.gateRedirectLabel,
    },
    cards: createAdminModuleCardViewModels({
      moduleKey: input.moduleKey,
      cards: input.module.cards,
    }),
    accessStatus: input.accessDecision.status,
  };
}
