export const freeShippingThresholdUsd = 210;
export const flatShippingUsd = 50;

export function calculateShippingUsd(subtotalAfterDiscountUsd: number): number {
  const subtotalCents = Math.round(subtotalAfterDiscountUsd * 100);

  if (subtotalCents <= 0) {
    return 0;
  }

  return subtotalCents >= freeShippingThresholdUsd * 100 ? 0 : flatShippingUsd;
}
