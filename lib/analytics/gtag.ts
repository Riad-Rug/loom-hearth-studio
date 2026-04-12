export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "";

export type AnalyticsItem = {
  item_id: string;
  item_name: string;
  item_category?: string;
  item_variant?: string;
  price?: number;
  quantity?: number;
};

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function canTrack() {
  return typeof window !== "undefined" && typeof window.gtag === "function" && Boolean(GA_MEASUREMENT_ID);
}

export function trackPageView(input: { path: string; title?: string | null }) {
  if (!canTrack()) {
    return;
  }

  window.gtag!("event", "page_view", {
    page_path: input.path,
    page_title: input.title || undefined,
    send_to: GA_MEASUREMENT_ID,
  });
}

export function trackViewItem(input: {
  currency?: string;
  value?: number;
  items: AnalyticsItem[];
}) {
  if (!canTrack()) {
    return;
  }

  window.gtag!("event", "view_item", {
    currency: input.currency || "USD",
    value: input.value,
    items: input.items,
  });
}

export function trackBeginCheckout(input: {
  currency?: string;
  value?: number;
  items: AnalyticsItem[];
}) {
  if (!canTrack()) {
    return;
  }

  window.gtag!("event", "begin_checkout", {
    currency: input.currency || "USD",
    value: input.value,
    items: input.items,
  });
}

export function trackPurchase(input: {
  transactionId: string;
  currency?: string;
  value?: number;
  items: AnalyticsItem[];
}) {
  if (!canTrack()) {
    return;
  }

  window.gtag!("event", "purchase", {
    transaction_id: input.transactionId,
    currency: input.currency || "USD",
    value: input.value,
    items: input.items,
  });
}

export function trackGenerateLead(input: {
  inquiryType?: string;
  productName?: string;
}) {
  if (!canTrack()) {
    return;
  }

  window.gtag!("event", "generate_lead", {
    inquiry_type: input.inquiryType || undefined,
    product_name: input.productName || undefined,
  });
}

export function trackNewsletterInterest(input: { location: string }) {
  if (!canTrack()) {
    return;
  }

  window.gtag!("event", "newsletter_interest", {
    form_location: input.location,
  });
}
