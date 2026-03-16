import type { PaymentStatus } from "@/types/domain/order";

import { getStripeCheckoutConfirmationConfig, getStripeCheckoutWebhookConfig } from "@/lib/stripe/config";
import type {
  StripeCheckoutPaymentConfirmation,
  StripeCheckoutPaymentConfirmationResult,
  StripeCheckoutWebhookBoundary,
  StripeCheckoutWebhookEvent,
  StripeCheckoutWebhookEventType,
  StripeCheckoutConfirmationBoundary,
} from "@/lib/stripe/contracts";

export const stripeCheckoutConfirmationEventTypes = [
  "checkout.session.completed",
  "checkout.session.async_payment_failed",
  "checkout.session.expired",
] as const satisfies ReadonlyArray<StripeCheckoutWebhookEventType>;

export function createStripeCheckoutWebhookBoundary(): StripeCheckoutWebhookBoundary {
  const config = getStripeCheckoutWebhookConfig();

  return {
    mode: config.mode,
    endpointPath: config.endpointPath,
    status: config.status,
    missingServerConfig: config.missingServerConfig,
    supportedEventTypes: stripeCheckoutConfirmationEventTypes,
  };
}

export function createStripeCheckoutConfirmationBoundary(): StripeCheckoutConfirmationBoundary {
  const config = getStripeCheckoutConfirmationConfig();

  return {
    mode: config.mode,
    source: config.source,
    webhookEndpointPath: config.webhookEndpointPath,
    status: config.status,
    missingServerConfig: config.missingServerConfig,
    supportedEventTypes: stripeCheckoutConfirmationEventTypes,
  };
}

export function isStripeCheckoutConfirmationEventType(
  value: string,
): value is StripeCheckoutWebhookEventType {
  return stripeCheckoutConfirmationEventTypes.includes(
    value as StripeCheckoutWebhookEventType,
  );
}

export function getStripeWebhookSignatureHeader(input: {
  headers: Headers;
}) {
  return input.headers.get("stripe-signature");
}

export function deriveStripeCheckoutConfirmationStatus(
  event: Pick<StripeCheckoutWebhookEvent, "type" | "data">,
): Extract<PaymentStatus, "pending" | "paid" | "failed"> | null {
  if (event.type === "checkout.session.completed") {
    return event.data.object.paymentStatus === "paid" ? "paid" : "pending";
  }

  if (
    event.type === "checkout.session.async_payment_failed" ||
    event.type === "checkout.session.expired"
  ) {
    return "failed";
  }

  return null;
}

export function createStripeCheckoutPaymentConfirmation(
  event: StripeCheckoutWebhookEvent,
): StripeCheckoutPaymentConfirmationResult {
  if (!isStripeCheckoutConfirmationEventType(event.type)) {
    return {
      status: "ignored",
      confirmation: null,
      message: `Unsupported Stripe Checkout webhook event: ${event.type}.`,
    };
  }

  const paymentStatus = deriveStripeCheckoutConfirmationStatus(event);

  if (!paymentStatus) {
    return {
      status: "ignored",
      confirmation: null,
      message: `Stripe Checkout webhook event ${event.type} did not map to a confirmation status.`,
    };
  }

  const confirmation: StripeCheckoutPaymentConfirmation = {
    provider: "stripe",
    mode: "checkout",
    source: "webhook",
    eventId: event.id,
    eventType: event.type,
    paymentStatus,
    checkoutSessionId: event.data.object.id,
    paymentIntentId: event.data.object.paymentIntentId ?? null,
    customerEmail:
      event.data.object.customerDetails?.email ?? event.data.object.customerEmail ?? null,
    checkoutMode: event.data.object.metadata.checkoutMode,
    orderReference: null,
  };

  return {
    status: "confirmed",
    confirmation,
    message: `Stripe Checkout webhook event ${event.type} mapped to payment status ${paymentStatus}.`,
  };
}

export const stripeConfirmationTodo = {
  webhook:
    "TODO: Verify Stripe webhook signatures against the Checkout webhook config before trusting incoming event payloads.",
  confirmation:
    "TODO: Hand confirmed Checkout payment status into the later order and email boundaries without implementing those side effects in this slice.",
} as const;
