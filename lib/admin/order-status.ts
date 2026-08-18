import type { Order } from "@/types/domain";

// Pure status/transition logic with no server-side dependencies (no db client,
// no fulfillment service). Kept in its own module so the admin orders client
// component can import these values directly without pulling the "server-only"
// data-fetching code in lib/admin/orders.ts into the client bundle.

export const adminOrderStatusOptions = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const satisfies ReadonlyArray<Order["status"]>;

export type AdminOrderStatusOption = (typeof adminOrderStatusOptions)[number];

// Terminal statuses represent the end of an order's normal lifecycle. Moving
// one of these back into an in-progress status via the plain status dropdown
// is unusual enough to warrant a confirmation step rather than a silent save.
export const terminalOrderStatuses = [
  "delivered",
  "cancelled",
  "refunded",
] as const satisfies ReadonlyArray<AdminOrderStatusOption>;

export function isTerminalOrderStatus(status: AdminOrderStatusOption): boolean {
  return (terminalOrderStatuses as readonly AdminOrderStatusOption[]).includes(status);
}

// Guard rail for the admin status dropdown: the common forward progression
// (pending -> paid/cancelled -> processing -> shipped -> delivered) should
// save without friction. Two situations get a confirmation step instead of a
// silent save, because they can't be casually reversed and carry real
// customer/financial weight:
//   1. Applying "cancelled" or "refunded" to any order.
//   2. Moving an order out of a terminal status (delivered/cancelled/refunded)
//      back into a non-terminal, in-progress status.
export function orderStatusTransitionNeedsConfirmation(
  currentStatus: AdminOrderStatusOption,
  nextStatus: AdminOrderStatusOption,
): boolean {
  if (currentStatus === nextStatus) {
    return false;
  }

  if (nextStatus === "cancelled" || nextStatus === "refunded") {
    return true;
  }

  if (isTerminalOrderStatus(currentStatus) && !isTerminalOrderStatus(nextStatus)) {
    return true;
  }

  return false;
}
