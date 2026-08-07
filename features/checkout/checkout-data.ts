export type CheckoutStepKey = "billing" | "shipping" | "payment" | "review" | "confirmation";

// Confirmation is intentionally excluded — it's the destination, not a step
// the customer has to complete, so it doesn't appear in the progress bar.
export const checkoutSteps = [
  { key: "billing", label: "Billing" },
  { key: "shipping", label: "Shipping" },
  { key: "payment", label: "Payment" },
  { key: "review", label: "Review" },
] as const satisfies ReadonlyArray<{ key: Exclude<CheckoutStepKey, "confirmation">; label: string }>;

export const checkoutSummary = {
  subtotalUsdLabel: "$0.00",
  shippingUsdLabel: "$0.00",
  taxUsdLabel: "$0.00",
  totalUsdLabel: "$0.00",
  guestLabel: "Guest checkout",
  marketLabel: "Shipping to the United States, Canada, and Australia",
  currencyLabel: "Prices shown in USD",
} as const;
