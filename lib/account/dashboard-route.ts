import type { AccountAccessDecision, SignOutRequestState } from "@/lib/auth";
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
      title: "Your account",
      body: "Review order history and update the contact details tied to this account.",
      emptyStateTitle: input.dashboardData?.overview.greeting ?? "Welcome back",
      emptyStateLines: input.dashboardData
        ? [
            input.dashboardData.overview.statusLabel,
            input.dashboardData.overview.accountEmail,
          ]
        : ["No orders are linked to this account yet."],
    },
    session: {
      title: "Signed-in account",
      statusLine: "You are signed in and can review the details linked to this account below.",
      accessLine: input.dashboardData?.overview.accountEmail ?? "",
      redirectTargetLine: "",
      modeLine: "",
      todoLines: [],
    },
    gate: {
      title: "Sign in required",
      body: "Please sign in to view your account.",
      redirectTargetLine: "",
    },
    signOut: {
      actionLabel: "Sign out",
      stateLine: "",
      message: input.signOutState.message,
      redirectTargetLine: null,
    },
    profileUpdate: {
      title: "Profile details",
      stateLine:
        input.profileUpdateState.status === "submitting"
          ? "Saving your details..."
          : input.profileUpdateState.status === "idle"
            ? "Update your contact details for future orders and inquiries."
            : "",
      message: input.profileUpdateState.message,
      payloadLine: null,
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