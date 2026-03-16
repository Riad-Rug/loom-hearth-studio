import type { PaymentStatus } from "@/types/domain/order";

import { getStripeCheckoutConfirmationConfig, getStripeCheckoutWebhookConfig } from "@/lib/stripe/config";
import type {
  StripeCheckoutPaymentConfirmation,
  StripeCheckoutPaymentConfirmationResult,
  StripeCheckoutWebhookReceipt,
  StripeCheckoutWebhookBoundary,
  StripeCheckoutWebhookEvent,
  StripeCheckoutWebhookEventType,
  StripeCheckoutConfirmationBoundary,
  StripeWebhookSignatureVerificationResult,
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

export function parseStripeCheckoutWebhookEvent(
  payload: string,
):
  | {
      status: "parsed";
      event: StripeCheckoutWebhookEvent;
      message: string;
    }
  | {
      status: "invalid-payload";
      event: null;
      message: string;
    } {
  try {
    const parsedPayload = JSON.parse(payload) as Partial<StripeCheckoutWebhookEvent>;

    if (
      typeof parsedPayload.id !== "string" ||
      typeof parsedPayload.type !== "string" ||
      !parsedPayload.data ||
      typeof parsedPayload.data !== "object" ||
      !("object" in parsedPayload.data)
    ) {
      return {
        status: "invalid-payload",
        event: null,
        message: "Stripe webhook payload is missing the expected Checkout event fields.",
      };
    }

    return {
      status: "parsed",
      event: parsedPayload as StripeCheckoutWebhookEvent,
      message: "Stripe webhook payload parsed.",
    };
  } catch {
    return {
      status: "invalid-payload",
      event: null,
      message: "Stripe webhook payload could not be parsed as JSON.",
    };
  }
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

export function createStripeCheckoutWebhookReceipt(input: {
  payload: string;
  signatureHeader: string | null;
  signatureVerification: StripeWebhookSignatureVerificationResult;
}): StripeCheckoutWebhookReceipt {
  const webhookBoundary = createStripeCheckoutWebhookBoundary();
  const confirmationBoundary = createStripeCheckoutConfirmationBoundary();
  const signatureVerification = input.signatureVerification;

  if (
    webhookBoundary.status !== "ready" ||
    confirmationBoundary.status !== "ready"
  ) {
    return {
      status: "configuration-error",
      message:
        "Stripe Checkout webhook boundary is not ready. Configure the webhook secret before enabling webhook processing.",
      signaturePresent: Boolean(input.signatureHeader),
      signatureVerification,
      eventType: null,
      eventId: null,
      confirmationResult: {
        status: "configuration-error",
        confirmation: null,
        message:
          "Stripe Checkout confirmation boundary is not ready because webhook configuration is incomplete.",
      },
    };
  }

  if (signatureVerification.status !== "verified") {
    return {
      status: "configuration-error",
      message: signatureVerification.message,
      signaturePresent: Boolean(input.signatureHeader),
      signatureVerification,
      eventType: null,
      eventId: null,
      confirmationResult: {
        status:
          signatureVerification.status === "configuration-error"
            ? "configuration-error"
            : "signature-error",
        confirmation: null,
        message: signatureVerification.message,
      },
    };
  }

  const parsedEvent = parseStripeCheckoutWebhookEvent(input.payload);

  if (parsedEvent.status === "invalid-payload") {
    return {
      status: "invalid-payload",
      message: parsedEvent.message,
      signaturePresent: Boolean(input.signatureHeader),
      signatureVerification,
      eventType: null,
      eventId: null,
      confirmationResult: null,
    };
  }

  const confirmationResult = createStripeCheckoutPaymentConfirmation(parsedEvent.event);

  return {
    status: confirmationResult.status === "confirmed" ? "accepted" : "ignored",
    message:
      confirmationResult.status === "confirmed"
        ? "Stripe Checkout webhook event parsed and mapped to a confirmation status."
        : confirmationResult.message,
    signaturePresent: Boolean(input.signatureHeader),
    signatureVerification,
    eventType: parsedEvent.event.type,
    eventId: parsedEvent.event.id,
    confirmationResult,
  };
}

export const stripeConfirmationTodo = {
  webhook:
    "TODO: Keep webhook signature verification limited to the Checkout boundary. Timestamp tolerance hardening and replay protections can be refined later.",
  confirmation:
    "TODO: Hand confirmed Checkout payment status into the later order and email boundaries without implementing those side effects in this slice.",
  route:
    "TODO: Keep the webhook route scaffold side-effect free until order creation, email, and fulfillment boundaries are implemented.",
} as const;
