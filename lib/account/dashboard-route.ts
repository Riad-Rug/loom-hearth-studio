import type { AccountAccessDecision, SignOutRequestState } from "@/lib/auth";
import type {
  AccountDashboardData,
  AccountProfileSummaryView,
} from "@/lib/account/dashboard-shared";

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
  sections: AccountDashboardSectionView[];
  profileSummaryView: AccountProfileSummaryView | null;
};

export function createAccountDashboardRouteViewModel(input: {
  accessDecision: AccountAccessDecision;
  dashboardData: AccountDashboardData | null;
  profileSummaryView: AccountProfileSummaryView | null;
  signOutState: SignOutRequestState;
  accountGuardTodo: string;
  accountDashboardDataTodo: string;
  signOutRequestTodo: string;
}): AccountDashboardRouteViewModel {
  return {
    hero: {
      title: "Your orders and details.",
      body: "Review order history, see the contact details tied to your account, and return to the collection from one place.",
      emptyStateTitle: input.dashboardData?.overview.greeting ?? "Welcome back",
      emptyStateLines: input.dashboardData
        ? [`Signed in as ${input.dashboardData.overview.accountEmail}.`, input.dashboardData.overview.statusLabel]
        : ["No orders are linked to this account yet."],
    },
    session: {
      title: "Signed-in account",
      statusLine: "You are signed in. Your orders are saved to this account and will appear below when they are placed.",
      accessLine: "",
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
    sections: [
      {
        id: "overview",
        summaryBody: input.dashboardData?.overview.recentOrder
          ? `Most recent order: ${input.dashboardData.overview.recentOrder.orderNumber} — ${input.dashboardData.overview.recentOrder.statusLabel}`
          : null,
        summaryMeta: null,
      },
      {
        id: "orders",
        summaryBody: input.dashboardData?.orders.orderCountLabel ?? null,
        summaryMeta: input.dashboardData?.orders.latestOrderLabel ?? null,
      },
      {
        id: "profile",
        summaryBody: null,
        summaryMeta: null,
      },
    ],
    profileSummaryView: input.profileSummaryView,
  };
}
