import type { Order } from "@/types/domain";

import type {
  StripeOrderPaymentInput,
  StripePaymentSession,
  StripeRefundReference,
} from "@/lib/stripe/contracts";

export type PaymentSession = StripePaymentSession;

export interface PaymentService {
  createPaymentSession(input: StripeOrderPaymentInput): Promise<PaymentSession>;
  getPaymentStatus(referenceId: string): Promise<Order["paymentStatus"]>;
  refundPayment(reference: StripeRefundReference): Promise<void>;
}

export const stripeServiceTodo =
  "TODO: Implement the Stripe Checkout service boundary, webhook handling, wallet support, and refund workflow.";
