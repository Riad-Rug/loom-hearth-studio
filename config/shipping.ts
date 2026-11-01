/**
 * Single source of truth for shipping terms. Checkout pricing, the cart,
 * JSON-LD, emails, policy pages, and product-page shipping lines all read
 * these values; no other file should state a threshold, fee, day range, or
 * destination on its own.
 */

/** Orders at or above this subtotal (after discounts) ship free. */
export const FREE_SHIPPING_THRESHOLD_USD = 210;

/** Flat shipping fee for orders below the free-shipping threshold. */
export const FLAT_SHIPPING_USD = 50;

/** Business days from the buyer's approval to dispatch. */
export const DISPATCH_DAYS = { min: 3, max: 5 } as const;

/** Business days in transit after dispatch. */
export const DELIVERY_DAYS = { min: 7, max: 14 } as const;

/** ISO country codes checkout ships to. */
export const SHIPS_TO = ["US"] as const;

export type ShipsToCountry = (typeof SHIPS_TO)[number];

const shipsToLabels: Record<ShipsToCountry, string> = {
  US: "the United States",
};

/** "the United States" (joined with "and" if the list grows). */
export const SHIPS_TO_LABEL = SHIPS_TO.map((country) => shipsToLabels[country]).join(" and ");

/** "3–5" — en dash, for buyer-facing copy. */
export function formatDayRange(range: { min: number; max: number }) {
  return `${range.min}–${range.max}`;
}

/** The standard shipping lines shown on every product page, before the product's own notes. */
export function getStandardShippingLines() {
  return [
    "Ships tracked from Casablanca, Morocco.",
    `Shipping to ${SHIPS_TO_LABEL} is free on orders of $${FREE_SHIPPING_THRESHOLD_USD} or more; orders under $${FREE_SHIPPING_THRESHOLD_USD} ship for a flat $${FLAT_SHIPPING_USD}.`,
    `Dispatched within ${formatDayRange(DISPATCH_DAYS)} business days.`,
    `Delivery usually takes ${formatDayRange(DELIVERY_DAYS)} business days after dispatch.`,
  ];
}

/**
 * Product shippingNotes lines that restate terms owned by this module (a
 * dollar amount, a country, insurance, or dispatch timing) are dropped so a
 * stale note can never contradict the config.
 */
const configOwnedShippingTerms = [
  /\$\s?\d|\bUSD\b|\d\s?(?:dollars?)\b/iu,
  /\b(?:Morocco|United States|USA|U\.S\.|US|America|Canada|Australia|United Kingdom|UK|Europe|EU|worldwide|international(?:ly)?)\b/u,
  /insur/iu,
  /dispatch|business days|\b\d+\s*(?:[–-]|to)\s*\d+\s*days?\b|\b\d+\s*days?\b/iu,
];

export function isConfigOwnedShippingNote(line: string) {
  return configOwnedShippingTerms.some((pattern) => pattern.test(line));
}
