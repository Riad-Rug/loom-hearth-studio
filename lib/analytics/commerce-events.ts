export type CommerceItem = {
  id: string;
  name: string;
  category: string;
  variant?: string;
  priceUsd: number;
  quantity: number;
};

type CommerceEventBase = {
  items: CommerceItem[];
  coupon?: string;
  discountUsd?: number;
};

export type CommerceEvent =
  | (CommerceEventBase & { name: "add_to_cart" })
  | (CommerceEventBase & { name: "view_cart" })
  | (CommerceEventBase & { name: "begin_checkout" })
  | (CommerceEventBase & { name: "add_shipping_info"; shippingTier: string })
  | (CommerceEventBase & { name: "add_payment_info" })
  | (CommerceEventBase & { name: "purchase"; transactionId: string; shippingUsd: number });

export type CommerceEventName = CommerceEvent["name"];

export type AnalyticsVendor = "ga" | "meta" | "pinterest";

export type VendorCall = {
  vendor: AnalyticsVendor;
  args: unknown[];
};

const metaEventNames: Partial<Record<CommerceEventName, string>> = {
  add_to_cart: "AddToCart",
  begin_checkout: "InitiateCheckout",
  purchase: "Purchase",
};

// Pinterest's "checkout" is its completed-purchase conversion, not checkout start.
const pinterestEventNames: Partial<Record<CommerceEventName, string>> = {
  add_to_cart: "addtocart",
  purchase: "checkout",
};

// GA4 defines value as the item total; shipping and tax travel in their own fields.
export function getCommerceValueUsd(event: CommerceEvent) {
  const itemTotalUsd = event.items.reduce((total, item) => total + item.priceUsd * item.quantity, 0);

  return Math.max(0, roundCurrency(itemTotalUsd - (event.discountUsd ?? 0)));
}

export function buildVendorCalls(event: CommerceEvent): VendorCall[] {
  const calls: VendorCall[] = [{ vendor: "ga", args: ["event", event.name, toGaParams(event)] }];
  const metaEventName = metaEventNames[event.name];
  const pinterestEventName = pinterestEventNames[event.name];

  if (metaEventName) {
    calls.push({ vendor: "meta", args: toMetaArgs(metaEventName, event) });
  }

  if (pinterestEventName) {
    calls.push({ vendor: "pinterest", args: ["track", pinterestEventName, toPinterestParams(event)] });
  }

  return calls;
}

function toGaParams(event: CommerceEvent) {
  return omitUndefined({
    currency: "USD",
    value: getCommerceValueUsd(event),
    coupon: event.coupon,
    items: event.items.map((item) =>
      omitUndefined({
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        item_variant: item.variant,
        price: item.priceUsd,
        quantity: item.quantity,
      }),
    ),
    ...(event.name === "purchase"
      ? { transaction_id: event.transactionId, shipping: event.shippingUsd, tax: 0 }
      : {}),
    ...(event.name === "add_shipping_info" ? { shipping_tier: event.shippingTier } : {}),
  });
}

function toMetaArgs(metaEventName: string, event: CommerceEvent): unknown[] {
  const params = {
    currency: "USD",
    value: getCommerceValueUsd(event),
    content_type: "product",
    content_ids: event.items.map((item) => item.id),
    contents: event.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      item_price: item.priceUsd,
    })),
    num_items: getTotalQuantity(event),
  };

  return event.name === "purchase"
    ? ["track", metaEventName, params, { eventID: event.transactionId }]
    : ["track", metaEventName, params];
}

function toPinterestParams(event: CommerceEvent) {
  return omitUndefined({
    currency: "USD",
    value: getCommerceValueUsd(event),
    order_quantity: getTotalQuantity(event),
    line_items: event.items.map((item) =>
      omitUndefined({
        product_id: item.id,
        product_name: item.name,
        product_category: item.category,
        product_variant: item.variant,
        product_price: item.priceUsd,
        product_quantity: item.quantity,
      }),
    ),
    ...(event.name === "purchase"
      ? { order_id: event.transactionId, event_id: event.transactionId }
      : {}),
  });
}

function getTotalQuantity(event: CommerceEvent) {
  return event.items.reduce((total, item) => total + item.quantity, 0);
}

function omitUndefined(value: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined));
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}
