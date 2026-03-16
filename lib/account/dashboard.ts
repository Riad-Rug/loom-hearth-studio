import type { AuthenticatedUser } from "@/lib/auth";
import type { OrderStatus } from "@/types/domain/order";

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

export type AccountOrderHistoryItem = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  statusLabel: string;
  placedAtLabel: string;
  totalLabel: string;
};

export type AccountOrderHistoryData = AccountOrderHistorySummary & {
  items: AccountOrderHistoryItem[];
};

export type AccountProfileSummary = {
  fullName: string;
  email: string;
  phoneLabel: string;
};

export type AccountDashboardData = {
  overview: AccountDashboardOverview;
  orders: AccountOrderHistoryData;
  profile: AccountProfileSummary;
};

function formatPlaceholderOrderTotal(totalUsd: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(totalUsd);
}

function getPlaceholderAccountOrderHistoryData(
  user: AuthenticatedUser,
): AccountOrderHistoryData {
  const items: AccountOrderHistoryItem[] = [
    {
      id: `${user.id}-order-1001`,
      orderNumber: "LH-1001",
      status: "delivered",
      statusLabel: "Delivered",
      placedAtLabel: "Placed February 18, 2026",
      totalLabel: formatPlaceholderOrderTotal(248),
    },
    {
      id: `${user.id}-order-1002`,
      orderNumber: "LH-1002",
      status: "processing",
      statusLabel: "Processing",
      placedAtLabel: "Placed March 2, 2026",
      totalLabel: formatPlaceholderOrderTotal(132),
    },
  ];

  return {
    statusLabel: "Placeholder order history loaded",
    orderCountLabel: `${items.length} placeholder orders`,
    latestOrderLabel: items[items.length - 1]?.orderNumber ?? "No placeholder orders",
    items,
  };
}

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
    orders: getPlaceholderAccountOrderHistoryData(user),
    profile: {
      fullName: "Customer name placeholder",
      email: user.email,
      phoneLabel: "Phone not available in placeholder data",
    },
  };
}

export const accountDashboardDataTodo =
  "TODO: Replace placeholder dashboard retrieval with real authenticated account data and order history once persistence is implemented.";
