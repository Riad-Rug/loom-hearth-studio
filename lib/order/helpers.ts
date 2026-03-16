import type { OrderDraft } from "@/features/checkout/checkout-provider";
import type {
  StripeCheckoutPaymentDraft,
  StripeOrderPaymentInput,
} from "@/lib/stripe";

import type {
  OrderSubmissionPayload,
  OrderSubmissionPreview,
} from "@/lib/order/contracts";

export function createOrderSubmissionPayload(input: {
  orderDraft: OrderDraft;
  stripePaymentDraft: StripeCheckoutPaymentDraft;
  stripeOrderPaymentInput: StripeOrderPaymentInput;
}): OrderSubmissionPayload | null {
  const { orderDraft, stripePaymentDraft, stripeOrderPaymentInput } = input;

  if (!orderDraft.shippingAddress || !orderDraft.shippingMethod) {
    return null;
  }

  return {
    checkoutMode: orderDraft.checkoutMode,
    email: orderDraft.shippingAddress.email,
    items: orderDraft.items.map((item, index) => ({
      id: stripeOrderPaymentInput.lineItems[index]?.id ?? item.id,
      productId: item.productId,
      productType: item.productType,
      name: item.name,
      quantity: item.quantity,
      unitAmountUsd: item.priceUsd,
      variantName: item.variantName,
    })),
    shippingAddress: orderDraft.shippingAddress,
    shippingMethod: orderDraft.shippingMethod,
    paymentMethod: orderDraft.paymentMethod,
    paymentStatus: stripePaymentDraft.paymentStatus,
    subtotalUsd: orderDraft.subtotalUsd,
    shippingUsd: orderDraft.shippingUsd,
    taxUsd: orderDraft.taxUsd,
    totalUsd: orderDraft.totalUsd,
    currency: orderDraft.currency,
  };
}

export function createOrderSubmissionPreview(
  payload: OrderSubmissionPayload | null,
): OrderSubmissionPreview | null {
  if (!payload) {
    return null;
  }

  return {
    status: "placeholder",
    orderReference: "LH-ORDER-DRAFT",
    paymentStatus: payload.paymentStatus,
    confirmationLabel: "Order submission placeholder only",
  };
}
