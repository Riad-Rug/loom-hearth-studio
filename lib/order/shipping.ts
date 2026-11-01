import { FLAT_SHIPPING_USD, FREE_SHIPPING_THRESHOLD_USD } from "@/config/shipping";

export function calculateShippingUsd(subtotalAfterDiscountUsd: number): number {
  if (subtotalAfterDiscountUsd <= 0) {
    return 0;
  }

  return subtotalAfterDiscountUsd >= FREE_SHIPPING_THRESHOLD_USD ? 0 : FLAT_SHIPPING_USD;
}
