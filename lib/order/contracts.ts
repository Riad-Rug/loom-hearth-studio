import type { PaymentStatus } from "@/types/domain/order";

import type { OrderDraft } from "@/features/checkout/checkout-provider";
import type { StripeCheckoutPaymentDraft } from "@/lib/stripe";

export type OrderSubmissionPayload = {
  checkoutMode: OrderDraft["checkoutMode"];
  email: string;
  items: Array<{
    id: string;
    productId: string;
    productType: OrderDraft["items"][number]["productType"];
    name: string;
    quantity: number;
    unitAmountUsd: number;
    variantName?: string;
  }>;
  shippingAddress: NonNullable<OrderDraft["shippingAddress"]>;
  shippingMethod: NonNullable<OrderDraft["shippingMethod"]>;
  paymentMethod: OrderDraft["paymentMethod"];
  paymentStatus: StripeCheckoutPaymentDraft["paymentStatus"];
  subtotalUsd: number;
  shippingUsd: 0;
  taxUsd: number;
  totalUsd: number;
  currency: "USD";
};

export type OrderSubmissionPreview = {
  status: "placeholder";
  orderReference: string;
  paymentStatus: Extract<PaymentStatus, "pending">;
  confirmationLabel: string;
};

export const orderSubmissionTodo =
  "TODO: Replace the placeholder submission contract with a real backend request once Stripe execution and order persistence are implemented.";
