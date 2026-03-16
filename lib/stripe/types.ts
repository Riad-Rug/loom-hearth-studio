import type { Order } from "@/types/domain";

import type {
  StripeCheckoutSessionRequest,
  StripeOrderPaymentInput,
  StripePaymentSession,
  StripeRefundReference,
} from "@/lib/stripe/contracts";

export type PaymentSession = StripePaymentSession;

export interface StripeCheckoutService {
  createCheckoutSession(input: StripeCheckoutSessionRequest): Promise<PaymentSession>;
  createPaymentSession(input: StripeOrderPaymentInput): Promise<PaymentSession>;
  getPaymentStatus(referenceId: string): Promise<Order["paymentStatus"]>;
  refundPayment(reference: StripeRefundReference): Promise<void>;
}

export const stripeServiceTodo =
  "TODO: Implement the StripeCheckoutService with real Checkout session creation, payment-status lookup, webhook handling, and refund workflow.";
