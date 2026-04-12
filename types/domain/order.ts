import type { SupportedCheckoutCountry } from "@/config/supported-markets";
import type { CartItem } from "@/types/domain/cart";

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus =
  | "pending"
  | "authorized"
  | "paid"
  | "failed"
  | "refunded";

export type OrderAddress = {
  fullName: string;
  email: string;
  phone?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: SupportedCheckoutCountry;
};

export type Order = {
  id: string;
  orderNumber: string;
  items: CartItem[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddress: OrderAddress;
  billingAddress?: OrderAddress;
  promoCode?: string;
  discountUsd: number;
  subtotalUsd: number;
  shippingUsd: 0;
  taxUsd: number;
  totalUsd: number;
  currency: "USD";
  placedAt: string;
  stripePaymentIntentId?: string;
  // TODO: Validate final refund operation flow and Stripe object mapping.
  refundedAt?: string;
};

