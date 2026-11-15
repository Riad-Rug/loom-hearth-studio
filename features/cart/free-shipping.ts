import { storePromise } from "@/lib/order/store-promise";
import { calculateShippingUsd } from "@/lib/order/shipping";

export type FreeShippingProgress =
  | { status: "qualified" }
  | { status: "remaining"; remainingUsd: number; ratio: number };

export function getFreeShippingProgress(subtotalAfterDiscountUsd: number): FreeShippingProgress {
  if (subtotalAfterDiscountUsd > 0 && calculateShippingUsd(subtotalAfterDiscountUsd) === 0) {
    return { status: "qualified" };
  }

  const thresholdUsd = storePromise.freeShippingThresholdUsd;
  const subtotalUsd = Math.max(0, subtotalAfterDiscountUsd);

  return {
    status: "remaining",
    remainingUsd: Math.round((thresholdUsd - subtotalUsd) * 100) / 100,
    ratio: Math.min(1, subtotalUsd / thresholdUsd),
  };
}
