import type { Order } from "@/types/domain";

import type {
  StripeCheckoutPaymentConfirmationResult,
  StripeCheckoutSessionCreationResult,
  StripeCheckoutSessionRequest,
  StripeCheckoutSessionResponse,
  StripeWebhookSignatureVerificationResult,
  StripeRefundReference,
} from "@/lib/stripe/contracts";

export interface StripeCheckoutService {
  createCheckoutSession(
    input: StripeCheckoutSessionRequest,
  ): Promise<StripeCheckoutSessionResponse>;
  createCheckoutSessionWithResult(
    input: StripeCheckoutSessionRequest,
  ): Promise<StripeCheckoutSessionCreationResult>;
  createCheckoutPaymentConfirmationFromWebhook(
    payload: string,
    signatureHeader: string | null,
  ): Promise<StripeCheckoutPaymentConfirmationResult>;
  verifyCheckoutWebhookSignature(
    payload: string,
    signatureHeader: string | null,
  ): Promise<StripeWebhookSignatureVerificationResult>;
  getPaymentStatus(referenceId: string): Promise<Order["paymentStatus"]>;
  refundPayment(reference: StripeRefundReference): Promise<void>;
}

export const stripeServiceTodo =
  "TODO: Implement the StripeCheckoutService with real Checkout session creation, webhook verification, confirmation-status mapping, payment-status lookup, and refund workflow without widening the boundary beyond Checkout launch requirements.";
