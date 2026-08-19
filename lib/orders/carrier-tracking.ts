// Pure carrier-tracking logic — no DB calls, no server-only imports — so it
// can be shared between the customer account dashboard
// (lib/account/dashboard.ts, which builds the customer-facing tracking link)
// and the admin orders table (features/admin/admin-orders-module-view.tsx,
// which needs the exact same accepted carrier names for its carrier select)
// without the admin client component pulling in server-only data-fetching
// code. Same split as lib/admin/order-status.ts and
// lib/orders/customer-status-label.ts, and for the same reason.

// Display casing for the carrier select in the admin tracking panel.
// `resolveCarrierTrackingHref` normalizes (trim + lowercase) before matching,
// so casing here is purely cosmetic — but the *words* must match one of the
// `matches` checks below or the customer will see a tracking number with no
// clickable link.
export const knownCarrierNames = ["USPS", "UPS", "FedEx", "DHL"] as const;

export type KnownCarrierName = (typeof knownCarrierNames)[number];

const carrierTrackingUrlBuilders: ReadonlyArray<{
  matches: (normalizedCarrier: string) => boolean;
  buildHref: (trackingNumber: string) => string;
}> = [
  {
    matches: (carrier) => carrier === "usps",
    buildHref: (trackingNumber) =>
      `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(trackingNumber)}`,
  },
  {
    matches: (carrier) => carrier === "ups",
    buildHref: (trackingNumber) =>
      `https://www.ups.com/track?tracknum=${encodeURIComponent(trackingNumber)}`,
  },
  {
    matches: (carrier) => carrier === "fedex",
    buildHref: (trackingNumber) =>
      `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(trackingNumber)}`,
  },
  {
    matches: (carrier) => carrier === "dhl",
    buildHref: (trackingNumber) =>
      `https://www.dhl.com/us-en/home/tracking/tracking-express.html?submit=1&tracking-id=${encodeURIComponent(trackingNumber)}`,
  },
];

export function resolveCarrierTrackingHref(carrier: string, trackingNumber: string): string | undefined {
  const normalizedCarrier = carrier.trim().toLowerCase();
  const builder = carrierTrackingUrlBuilders.find(({ matches }) => matches(normalizedCarrier));

  return builder?.buildHref(trackingNumber);
}
