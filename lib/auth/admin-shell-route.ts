import type { AdminAccessDecision } from "@/lib/auth/guards";

export type AdminShellNavItemView = {
  key: string;
  label: string;
  href: string;
  isActive: boolean;
};

export type AdminShellRouteViewModel = {
  intro: {
    eyebrow: string;
    title: string;
    body: string;
  };
  session: {
    title: string;
    lines: string[];
  };
  navigation: {
    ariaLabel: string;
    items: AdminShellNavItemView[];
  };
  gate: {
    title: string;
    body: string;
    redirectTargetLine: string;
  };
};

function isAdminNavItemActive(href: string, pathname: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function createAdminShellRouteViewModel(input: {
  pathname: string;
  accessDecision: AdminAccessDecision;
  adminGuardTodo: string;
  adminNav: ReadonlyArray<{
    key: string;
    label: string;
    href: string;
  }>;
}): AdminShellRouteViewModel {
  return {
    intro: {
      eyebrow: "Admin",
      title: "Back office shell",
      body:
        "Protected admin shell with server-side session checks and persisted admin roles.",
    },
    session: {
      title: "Session boundary",
      lines: [
        `Status: ${input.accessDecision.sessionSummary.status}`,
        `Role: ${input.accessDecision.sessionSummary.roleLabel}`,
        `Access: ${input.accessDecision.status}`,
        `Redirect target: ${input.accessDecision.redirectTarget}`,
        input.accessDecision.sessionSummary.todo,
        input.adminGuardTodo,
      ],
    },
    navigation: {
      ariaLabel: "Admin navigation",
      items: input.adminNav.map((item) => ({
        ...item,
        isActive: isAdminNavItemActive(item.href, input.pathname),
      })),
    },
    gate: {
      title: "Admin access placeholder gate",
      body:
        "Admin routes require an authenticated admin surface session with a supported persisted role.",
      redirectTargetLine: `Boundary redirect target: ${input.accessDecision.redirectTarget}`,
    },
  };
}
