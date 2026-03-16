import type { CheckoutStepKey } from "@/features/checkout/checkout-data";
import type { StripeCheckoutPaymentDraft } from "@/lib/stripe";

export type CheckoutStepIndicatorView = {
  key: Exclude<CheckoutStepKey, "start">;
  label: string;
  stateLabel: string;
  isActive: boolean;
  isComplete: boolean;
};

export type CheckoutNonConfirmationRouteViewModel = {
  shell: {
    eyebrow: string;
    title: string;
    body: string;
  };
  stepIndicators: CheckoutStepIndicatorView[];
  start: {
    title: string;
    body: string;
    actionLabel: string;
  };
  information: {
    note: string;
    actionLabel: string;
  };
  shipping: {
    optionTitle: string;
    optionBody: string;
    optionPriceLabel: string;
    body: string;
    actionLabel: string;
  };
  payment: {
    body: string;
    launchModeLabel: string;
    handoffLabel: string;
    boundary: {
      modeLabel: string;
      statusLabel: string;
      publishableKeyLabel: string;
      missingConfigLabel: string | null;
      sessionLabel: string;
      sessionStatusLabel: string;
      paymentStatusLabel: string;
      readinessLabel: string;
    };
    checkoutService: {
      statusLabel: string;
      successUrlLabel: string;
      cancelUrlLabel: string;
      missingClientConfigLabel: string | null;
      missingServerConfigLabel: string | null;
    };
    checkoutSessionRequest: {
      customerEmailLabel: string | null;
      lineItemsLabel: string | null;
      totalLabel: string | null;
      emptyLabel: string | null;
    };
    actionLabel: string;
  };
};

export function createCheckoutNonConfirmationRouteViewModel(input: {
  step: CheckoutStepKey;
  checkoutSteps: ReadonlyArray<{
    key: Exclude<CheckoutStepKey, "start">;
    label: string;
  }>;
  canAccessShipping: boolean;
  canAccessReview: boolean;
  stripePaymentDraft: Pick<
    StripeCheckoutPaymentDraft,
    | "mode"
    | "launchMode"
    | "paymentStepStatus"
    | "publishableKeyReady"
    | "missingConfig"
    | "checkoutService"
    | "checkoutSessionRequest"
    | "session"
    | "paymentStatus"
    | "isReadyForPlaceholderFlow"
  >;
}): CheckoutNonConfirmationRouteViewModel {
  const currentStepIndex = input.checkoutSteps.findIndex(
    (candidate) => candidate.key === input.step,
  );

  return {
    shell: {
      eyebrow: "Checkout",
      title: "Guest checkout UI shell",
      body:
        "This slice implements the PRD checkout structure only. Payment, order creation, cart wiring, tax handling, email, and provider integrations remain unresolved.",
    },
    stepIndicators: input.checkoutSteps.map((item, index) => ({
      key: item.key,
      label: item.label,
      stateLabel:
        input.step !== "start" && currentStepIndex > index
          ? "Complete preview"
          : "Placeholder step",
      isActive: item.key === input.step,
      isComplete: input.step !== "start" && currentStepIndex > index,
    })),
    start: {
      title: "Checkout route shell",
      body:
        "Guest checkout is the only supported mode in the PRD. Use the step links below to move through the existing 5-step flow using the current client-side checkout state.",
      actionLabel: "Start guest checkout",
    },
    information: {
      note:
        "Guest email and US shipping address are stored in local client state only for this slice.",
      actionLabel: "Continue to shipping",
    },
    shipping: {
      optionTitle: "Standard shipping",
      optionBody: "United States only",
      optionPriceLabel: "$0.00",
      body:
        "Shipping is fixed at $0.00 for launch in the PRD. No shipping provider or rate calculation logic is implemented in this slice.",
      actionLabel: "Continue to payment",
    },
    payment: {
      body:
        "Stripe Checkout is the only supported launch path in this boundary layer. This step now reflects the hosted Checkout handoff state only. No payment capture, webhook handling, or order creation is implemented yet.",
      launchModeLabel: `Launch mode: Stripe ${input.stripePaymentDraft.launchMode}`,
      handoffLabel:
        "Hosted Stripe Checkout remains placeholder-only in this slice. The current UI consumes the Checkout service boundary and session-request draft without executing Stripe.",
      boundary: {
        modeLabel: `Mode: ${input.stripePaymentDraft.mode}`,
        statusLabel: `Status: ${input.stripePaymentDraft.paymentStepStatus}`,
        publishableKeyLabel: `Publishable key: ${
          input.stripePaymentDraft.publishableKeyReady
            ? "Configured"
            : "Missing placeholder env"
        }`,
        missingConfigLabel: input.stripePaymentDraft.missingConfig.length
          ? `Missing config: ${input.stripePaymentDraft.missingConfig.join(", ")}`
          : null,
        sessionLabel: `Session: ${
          input.stripePaymentDraft.session
            ? input.stripePaymentDraft.session.id
            : "Not created"
        }`,
        sessionStatusLabel: `Session status: ${
          input.stripePaymentDraft.session?.status ?? "Not created"
        }`,
        paymentStatusLabel: `Payment status: ${input.stripePaymentDraft.paymentStatus}`,
        readinessLabel: `Review readiness: ${
          input.stripePaymentDraft.isReadyForPlaceholderFlow
            ? "Launch mode locked"
            : "Unavailable"
        }`,
      },
      checkoutService: {
        statusLabel: `Service status: ${input.stripePaymentDraft.checkoutService.status}`,
        successUrlLabel: `Success URL: ${input.stripePaymentDraft.checkoutService.successUrl}`,
        cancelUrlLabel: `Cancel URL: ${input.stripePaymentDraft.checkoutService.cancelUrl}`,
        missingClientConfigLabel: input.stripePaymentDraft.checkoutService.missingClientConfig
          .length
          ? `Missing client config: ${input.stripePaymentDraft.checkoutService.missingClientConfig.join(", ")}`
          : null,
        missingServerConfigLabel: input.stripePaymentDraft.checkoutService.missingServerConfig
          .length
          ? `Missing server config: ${input.stripePaymentDraft.checkoutService.missingServerConfig.join(", ")}`
          : null,
      },
      checkoutSessionRequest: input.stripePaymentDraft.checkoutSessionRequest
        ? {
            customerEmailLabel: input.stripePaymentDraft.checkoutSessionRequest.customerEmail
              ? `Customer email: ${input.stripePaymentDraft.checkoutSessionRequest.customerEmail}`
              : "Customer email: not collected yet",
            lineItemsLabel: `Line items: ${input.stripePaymentDraft.checkoutSessionRequest.lineItems.length}`,
            totalLabel: `Checkout total: $${input.stripePaymentDraft.checkoutSessionRequest.totalUsd.toFixed(2)}`,
            emptyLabel: null,
          }
        : {
            customerEmailLabel: null,
            lineItemsLabel: null,
            totalLabel: null,
            emptyLabel: "Checkout session request will be prepared once cart items are present.",
          },
      actionLabel: "Continue to review",
    },
  };
}
