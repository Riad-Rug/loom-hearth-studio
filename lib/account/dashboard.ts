import type { AuthenticatedUser } from "@/lib/auth";
import { createOrderRepository } from "@/lib/db/repositories/order-repository";
import type { Order } from "@/types/domain";
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
  phone: string | null;
};

export type AccountProfileContactRow = {
  id: "email" | "phone";
  label: string;
  value: string;
  tone: "default" | "muted";
};

export type AccountProfileSummaryView = {
  fullNameLabel: string;
  contactRows: AccountProfileContactRow[];
};

export type AccountDashboardData = {
  overview: AccountDashboardOverview;
  orders: AccountOrderHistoryData;
  profile: AccountProfileSummary;
};

export function createAccountProfileSummaryView(
  profile: AccountProfileSummary | null,
): AccountProfileSummaryView | null {
  if (!profile) {
    return null;
  }

  return {
    fullNameLabel: profile.fullName,
    contactRows: [
      {
        id: "email",
        label: "Email",
        value: profile.email,
        tone: "default",
      },
      {
        id: "phone",
        label: "Phone",
        value: profile.phone ?? "Phone not available in placeholder data",
        tone: profile.phone ? "default" : "muted",
      },
    ],
  };
}

export async function getAccountDashboardData(
  user: AuthenticatedUser | null,
): Promise<AccountDashboardData | null> {
  if (!user) {
    return null;
  }

  const orders = await createOrderRepository().getByCustomerEmail(user.email);

  return {
    overview: {
      greeting: "Welcome back",
      statusLabel: "Placeholder signed-in account with persisted order history",
      accountEmail: user.email,
    },
    orders: createAccountOrderHistoryData(orders),
    profile: {
      fullName: orders[0]?.shippingAddress.fullName ?? "Customer name placeholder",
      email: user.email,
      phone: orders[0]?.shippingAddress.phone ?? null,
    },
  };
}

export const accountDashboardDataTodo =
  "TODO: Keep account order history sourced from persisted orders while authentication, profile persistence, and broader account data remain placeholder-only.";

function createAccountOrderHistoryData(orders: Order[]): AccountOrderHistoryData {
  const items = orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    statusLabel: formatOrderStatusLabel(order.status),
    placedAtLabel: `Placed ${formatOrderPlacedAtLabel(order.placedAt)}`,
    totalLabel: formatOrderTotal(order.totalUsd),
  }));

  if (!items.length) {
    return {
      statusLabel: "No persisted orders found for this account email",
      orderCountLabel: "0 persisted orders",
      latestOrderLabel: "No persisted orders",
      items,
    };
  }

  return {
    statusLabel: "Persisted order history loaded",
    orderCountLabel: `${items.length} persisted order${items.length === 1 ? "" : "s"}`,
    latestOrderLabel: items[0].orderNumber,
    items,
  };
}

function formatOrderPlacedAtLabel(placedAt: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(placedAt));
}

function formatOrderTotal(totalUsd: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(totalUsd);
}

function formatOrderStatusLabel(status: OrderStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}
