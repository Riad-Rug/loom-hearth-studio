import { flatShippingUsd, freeShippingThresholdUsd } from "@/lib/order/shipping";

export type DutiesPosition = "buyer-pays" | "included";

export const storePromise = {
  approvalMedia: "photos and video",
  approvalTurnaroundHours: { min: 24, max: 48 },
  decisionWindowDays: 5,
  deliveryBusinessDays: { min: 7, max: 14 },
  shipsFromCity: "Casablanca",
  shipsFromCountry: "Morocco",
  shipsToLabel: "the United States",
  flatShippingUsd,
  freeShippingThresholdUsd,
  duties: "buyer-pays" as DutiesPosition,
} as const;

export const storePromiseCopy = {
  approvalTurnaround: `within ${storePromise.approvalTurnaroundHours.min} to ${storePromise.approvalTurnaroundHours.max} hours`,
  deliveryWindow: `${storePromise.deliveryBusinessDays.min} to ${storePromise.deliveryBusinessDays.max} business days`,
  decisionWindow: `${storePromise.decisionWindowDays} days`,
  shipping: `Shipping $${storePromise.flatShippingUsd}, free on orders of $${storePromise.freeShippingThresholdUsd} or more`,
  shipsFrom: `Tracked shipping from ${storePromise.shipsFromCity}, ${storePromise.shipsFromCountry}`,
  duties:
    storePromise.duties === "included"
      ? "Import duties are included for US delivery."
      : "Import duties and taxes, if charged by US customs, are paid by the buyer on delivery.",
} as const;
