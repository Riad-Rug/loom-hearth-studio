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
        value: profile.phone ?? "Phone not provided",
        tone: profile.phone ? "default" : "muted",
      },
    ],
  };
}

export const accountDashboardDataTodo =
  "TODO: Keep account order history sourced from persisted orders while authentication, profile persistence, and broader account data remain placeholder-only.";
