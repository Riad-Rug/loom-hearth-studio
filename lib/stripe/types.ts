import type { Order } from "@/types/domain";

export type PaymentSession = {
  id: string;
  clientSecret?: string;
  redirectUrl?: string;
};

export interface PaymentService {
  createPaymentSession(order: Order): Promise<PaymentSession>;
  getPaymentStatus(referenceId: string): Promise<Order["paymentStatus"]>;
  refundPayment(referenceId: string): Promise<void>;
}

export const stripeServiceTodo =
  "TODO: Validate Stripe Checkout vs Elements, webhook handling, wallet support, and refund workflow before implementation.";
