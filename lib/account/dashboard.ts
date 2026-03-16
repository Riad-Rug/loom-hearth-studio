import type { AuthenticatedUser } from "@/lib/auth";

export type AccountDashboardOverview = {
  greeting: string;
  statusLabel: string;
  accountEmail: string;
};

export type AccountOrderHistorySummary = {
  statusLabel: string;
  orderCountLabel: string;
  latestOrderLabel: string;
};

export type AccountProfileSummary = {
  fullName: string;
  email: string;
  phoneLabel: string;
};

export type AccountDashboardData = {
  overview: AccountDashboardOverview;
  orders: AccountOrderHistorySummary;
  profile: AccountProfileSummary;
};

export function getPlaceholderAccountDashboardData(
  user: AuthenticatedUser | null,
): AccountDashboardData | null {
  if (!user) {
    return null;
  }

  return {
    overview: {
      greeting: "Welcome back",
      statusLabel: "Placeholder signed-in account",
      accountEmail: user.email,
    },
    orders: {
      statusLabel: "No order history loaded",
      orderCountLabel: "0 placeholder orders",
      latestOrderLabel: "No live order retrieval",
    },
    profile: {
      fullName: "Customer name placeholder",
      email: user.email,
      phoneLabel: "Phone not available in placeholder data",
    },
  };
}

export const accountDashboardDataTodo =
  "TODO: Replace placeholder dashboard retrieval with real authenticated account data and order history once persistence is implemented.";
