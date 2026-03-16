import type { Order } from "@/types/domain";

import type {
  StripeCheckoutSessionCreationResult,
  StripeCheckoutSessionRequest,
  StripeCheckoutSessionResponse,
  StripeRefundReference,
} from "@/lib/stripe/contracts";

export interface StripeCheckoutService {
  createCheckoutSession(
    input: StripeCheckoutSessionRequest,
  ): Promise<StripeCheckoutSessionResponse>;
  createCheckoutSessionWithResult(
    input: StripeCheckoutSessionRequest,
  ): Promise<StripeCheckoutSessionCreationResult>;
  getPaymentStatus(referenceId: string): Promise<Order["paymentStatus"]>;
  refundPayment(reference: StripeRefundReference): Promise<void>;
}

export const stripeServiceTodo =
  "TODO: Implement the StripeCheckoutService with real Checkout session creation, payment-status lookup, webhook handling, and refund workflow without widening the boundary beyond Checkout session creation.";
