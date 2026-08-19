import type { OrderStatus, PaymentStatus } from "@/types/domain/order";

// Pure customer-facing status copy — no DB calls, no server-only imports — so
// it can be shared between the customer account dashboard
// (lib/account/dashboard.ts) and the admin orders table (lib/admin/orders.ts)
// without either one pulling in the other's dependencies. This is the single
// source of truth for "what does the customer see" — keep it in sync with
// whatever the account page actually renders, since the admin table surfaces
// this same string so staff can tell the two apart.
export function formatOrderStatusLabel(status: OrderStatus, paymentStatus: PaymentStatus): string {
  if (status === "pending" && paymentStatus === "authorized") {
    return "Reserved — card on hold, you have not been charged";
  }

  if (status === "paid" && paymentStatus === "paid") {
    return "Approved — payment complete, preparing to ship";
  }

  if (status === "shipped") {
    return "Shipped";
  }

  if (status === "delivered") {
    return "Delivered";
  }

  if (status === "cancelled" && paymentStatus === "failed") {
    return "Cancelled — hold released, you were not charged";
  }

  if (status === "refunded" || paymentStatus === "refunded") {
    return "Refunded";
  }

  if (status === "processing") {
    return "Processing — preparing your order";
  }

  if (status === "cancelled") {
    return "Cancelled";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}
