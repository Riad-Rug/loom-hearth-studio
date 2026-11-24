import { flatShippingUsd, freeShippingThresholdUsd } from "@/lib/order/shipping";

export const storePromise = {
  approvalMedia: "photos and video",
  approvalTurnaroundHours: { min: 24, max: 48 },
  decisionWindowDays: 4,
  /** From the buyer's approval to the parcel leaving Casablanca. */
  dispatchBusinessDays: { min: 3, max: 5 },
  /** Carrier transit after dispatch, any destination. */
  deliveryBusinessDays: { min: 5, max: 10 },
  shipsFromCity: "Casablanca",
  shipsFromCountry: "Morocco",
  /** Reads after "to": "Ships from Casablanca to anywhere in the world". */
  shipsToLabel: "anywhere in the world",
  flatShippingUsd,
  freeShippingThresholdUsd,
  returnWindowDays: 14,
  returnShippingPaidBy: "buyer",
  /** Higher of the two, never more than the item price; waived for damaged or misdescribed pieces. */
  restockingFee: { percent: 20, minimumUsd: 50 },
} as const;

const restockingFeeTerms = `${storePromise.restockingFee.percent}% of the item price or $${storePromise.restockingFee.minimumUsd}, whichever is higher, and never more than the item price`;

export const storePromiseCopy = {
  approvalTurnaround: `within ${storePromise.approvalTurnaroundHours.min} to ${storePromise.approvalTurnaroundHours.max} hours`,
  dispatchWindow: `${storePromise.dispatchBusinessDays.min} to ${storePromise.dispatchBusinessDays.max} business days`,
  deliveryWindow: `${storePromise.deliveryBusinessDays.min} to ${storePromise.deliveryBusinessDays.max} business days`,
  decisionWindow: `${storePromise.decisionWindowDays} days`,
  shipping: `Shipping $${storePromise.flatShippingUsd}, free on orders of $${storePromise.freeShippingThresholdUsd} or more`,
  shipsFrom: `Tracked shipping from ${storePromise.shipsFromCity}, ${storePromise.shipsFromCountry}`,
  shipsWorldwide: "We ship worldwide, with the same shipping rate for every country",
  duties: "If your order is subject to import duties or taxes, we'll tell you the amount before you're charged.",
  restockingFeeTerms,
  returnsWaiver: "Return shipping and the restocking fee are both waived if a piece arrives damaged or doesn't match its listing.",
  returns: `Returns accepted within ${storePromise.returnWindowDays} days of confirmed delivery. Return shipping is at the buyer's cost, and a restocking fee applies: ${restockingFeeTerms}. Both are waived if a piece arrives damaged or doesn't match its listing.`,
} as const;
