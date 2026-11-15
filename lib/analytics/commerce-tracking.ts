"use client";

import { useEffect } from "react";

import {
  buildVendorCalls,
  type AnalyticsVendor,
  type CommerceEvent,
} from "@/lib/analytics/commerce-events";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    pintrk?: (...args: unknown[]) => void;
  }
}

const TRACKED_TRANSACTIONS_STORAGE_KEY = "loom-hearth-studio.analytics.tracked-transactions";
const TRACKED_TRANSACTIONS_LIMIT = 20;

// A vendor counts as enabled only while its consent-gated tag component is
// mounted. ConsentGate unmounts the tag when consent is withdrawn, but the
// library it loaded stays on window, so window.fbq existing is not consent.
const enabledVendors = new Set<AnalyticsVendor>();

export function enableAnalyticsVendor(vendor: AnalyticsVendor) {
  enabledVendors.add(vendor);

  return () => {
    enabledVendors.delete(vendor);
  };
}

export function useAnalyticsVendor(vendor: AnalyticsVendor) {
  useEffect(() => enableAnalyticsVendor(vendor), [vendor]);
}

export function trackCommerceEvent(event: CommerceEvent) {
  if (typeof window === "undefined") {
    return;
  }

  if (event.name === "purchase" && !claimTransaction(event.transactionId)) {
    return;
  }

  const vendorFunctions = {
    ga: window.gtag,
    meta: window.fbq,
    pinterest: window.pintrk,
  } satisfies Record<AnalyticsVendor, unknown>;

  for (const call of buildVendorCalls(event)) {
    const send = vendorFunctions[call.vendor];

    if (enabledVendors.has(call.vendor) && typeof send === "function") {
      send(...call.args);
    }
  }
}

function claimTransaction(transactionId: string) {
  try {
    const storedValue = JSON.parse(
      window.localStorage.getItem(TRACKED_TRANSACTIONS_STORAGE_KEY) ?? "[]",
    ) as unknown;
    const trackedIds = Array.isArray(storedValue)
      ? storedValue.filter((entry): entry is string => typeof entry === "string")
      : [];

    if (trackedIds.includes(transactionId)) {
      return false;
    }

    window.localStorage.setItem(
      TRACKED_TRANSACTIONS_STORAGE_KEY,
      JSON.stringify([...trackedIds, transactionId].slice(-TRACKED_TRANSACTIONS_LIMIT)),
    );
  } catch {
    // Blocked or corrupt storage must not cost the purchase event; the call site already fires once.
  }

  return true;
}
