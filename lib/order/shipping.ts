export const freeShippingThresholdUsd = 150;
export const flatShippingUsd = 50;

export function calculateShippingUsd(subtotalAfterDiscountUsd: number): number {
  if (subtotalAfterDiscountUsd <= 0) {
    return 0;
  }

  return subtotalAfterDiscountUsd >= freeShippingThresholdUsd ? 0 : flatShippingUsd;
}
