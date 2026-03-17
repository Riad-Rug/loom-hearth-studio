import type { AccountAccessDecision } from "@/lib/auth";
import type { SignOutRequestState } from "@/lib/auth";
import type {
  AccountDashboardData,
  AccountProfileSummaryView,
} from "@/lib/account/dashboard-shared";
import type { AccountProfileUpdateState } from "@/lib/account/profile-update";

export type AccountDashboardSectionView = {
  id: "overview" | "orders" | "profile";
  summaryBody: string | null;
  summaryMeta: string | null;
};

export type AccountDashboardRouteViewModel = {
  hero: {
    title: string;
    body: string;
    emptyStateTitle: string;
    emptyStateLines: string[];
  };
  session: {
    title: string;
    statusLine: string;
    accessLine: string;
    redirectTargetLine: string;
    modeLine: string;
    todoLines: string[];
  };
  gate: {
    title: string;
    body: string;
    redirectTargetLine: string;
  };
  signOut: {
    actionLabel: string;
    stateLine: string;
    message: string | null;
    redirectTargetLine: string | null;
  };
  profileUpdate: {
    title: string;
    stateLine: string;
    message: string | null;
    payloadLine: string | null;
  };
  sections: AccountDashboardSectionView[];
  profileSummaryView: AccountProfileSummaryView | null;
};

export function createAccountDashboardRouteViewModel(input: {
  accessDecision: AccountAccessDecision;
  dashboardData: AccountDashboardData | null;
  profileSummaryView: AccountProfileSummaryView | null;
  signOutState: SignOutRequestState;
  profileUpdateState: AccountProfileUpdateState;
  accountGuardTodo: string;
  accountDashboardDataTodo: string;
  signOutRequestTodo: string;
  accountProfileUpdateTodo: string;
}): AccountDashboardRouteViewModel {
  return {
    hero: {
      title: "Customer dashboard shell",
      body:
        "This dashboard reads persisted launch order history for the signed-in account email while profile persistence remains out of scope.",
      emptyStateTitle: input.dashboardData?.overview.greeting ?? "No live account data yet",
      emptyStateLines: input.dashboardData
        ? [
            input.dashboardData.overview.statusLabel,
            input.dashboardData.overview.accountEmail,
          ]
        : [
            "Empty-state presentation only. No persisted orders were found for the current placeholder account email.",
          ],
    },
    session: {
      title: "Account auth/session",
      statusLine: `Status: ${input.accessDecision.sessionSummary.status}. Authenticated: ${
        input.accessDecision.sessionSummary.isAuthenticated ? "yes" : "no"
      }.`,
      accessLine: `Access: ${input.accessDecision.status}`,
      redirectTargetLine: `Redirect target: ${input.accessDecision.redirectTarget}`,
      modeLine: `Mode: ${input.accessDecision.sessionSummary.roleLabel}`,
      todoLines: [
        input.accessDecision.sessionSummary.todo,
        input.accountGuardTodo,
        input.accountDashboardDataTodo,
      ],
    },
    gate: {
      title: "Account gate",
      body: "This route is reserved for authenticated customer sessions only.",
      redirectTargetLine: `Boundary redirect target: ${input.accessDecision.redirectTarget}`,
    },
    signOut: {
      actionLabel: "Sign out",
      stateLine: `Sign-out request state: ${input.signOutState.status}`,
      message: input.signOutState.message,
      redirectTargetLine: input.signOutState.redirectTarget
        ? `Sign-out redirect target: ${input.signOutState.redirectTarget}`
        : null,
    },
    profileUpdate: {
      title: "Profile update boundary",
      stateLine: `Request state: ${input.profileUpdateState.status}`,
      message: input.profileUpdateState.message,
      payloadLine: input.profileUpdateState.payload
        ? `Payload ready: ${input.profileUpdateState.payload.fullName}, ${input.profileUpdateState.payload.email}${
            input.profileUpdateState.payload.phone
              ? `, ${input.profileUpdateState.payload.phone}`
              : ""
          }`
        : null,
    },
    sections: [
      {
        id: "overview",
        summaryBody: input.dashboardData?.overview.statusLabel ?? null,
        summaryMeta: input.dashboardData?.overview.accountEmail ?? null,
      },
      {
        id: "orders",
        summaryBody: input.dashboardData?.orders.orderCountLabel ?? null,
        summaryMeta: input.dashboardData?.orders.latestOrderLabel ?? null,
      },
      {
        id: "profile",
        summaryBody: input.dashboardData?.profile.email ?? null,
        summaryMeta: null,
      },
    ],
    profileSummaryView: input.profileSummaryView,
  };
}
