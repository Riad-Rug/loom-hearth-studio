export type CheckoutStepKey =
  | "start"
  | "information"
  | "shipping"
  | "payment"
  | "review"
  | "confirmation";

export const checkoutSteps = [
  { key: "information", label: "Information", href: "/checkout/information" },
  { key: "shipping", label: "Shipping", href: "/checkout/shipping" },
  { key: "payment", label: "Payment", href: "/checkout/payment" },
  { key: "review", label: "Review", href: "/checkout/review" },
  { key: "confirmation", label: "Confirmation", href: "/checkout/success" },
] as const;

export const usStates = [
  "California",
  "Florida",
  "New York",
  "Texas",
  "Washington",
] as const;

export const checkoutSummary = {
  subtotalUsdLabel: "$0.00",
  shippingUsdLabel: "$0.00",
  taxUsdLabel: "$0.00",
  totalUsdLabel: "$0.00",
  guestLabel: "Guest checkout only",
  marketLabel: "USA, Europe, Canada, Australia",
  currencyLabel: "USD only",
} as const;

export const checkoutLineItems = [
  {
    id: "checkout-item-rug",
    name: "Atlas Morning Rug",
    quantityLabel: "Qty 1",
    typeLabel: "Moroccan rugs",
    priceUsdLabel: "$0.00",
  },
  {
    id: "checkout-item-pouf",
    name: "Clay Knot Pouf",
    quantityLabel: "Qty 2",
    typeLabel: "Poufs",
    priceUsdLabel: "$0.00",
  },
] as const;
