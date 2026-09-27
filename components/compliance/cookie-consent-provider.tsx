"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getDefaultCookieConsentState } from "@/lib/security/helpers";
import type {
  CookieConsentCategory,
  CookieConsentState,
} from "@/lib/security/types";

export const CONSENT_COOKIE_NAME = "loom_hearth_cookie_consent";
const CONSENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 180;

/*
 * How analytics behaves before the visitor has made a choice. "opt-in" (EU/EEA,
 * UK, CH, unknown region, or Global Privacy Control): off until accepted.
 * "opt-out" (everywhere else): on until they opt out. Marketing is opt-in in
 * both modes, and a stored choice always overrides the mode.
 */
export type ConsentMode = "opt-in" | "opt-out";

type CookieConsentContextValue = {
  consent: CookieConsentState | null;
  mode: ConsentMode;
  hasResolved: boolean;
  acceptAll: () => void;
  declineAll: () => void;
  keepDefaults: () => void;
  allows: (category: CookieConsentCategory) => boolean;
};

type GeoResponse = {
  requiresOptIn?: boolean;
  gpc?: boolean;
};

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);

function readConsentCookie() {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${CONSENT_COOKIE_NAME}=`));

  if (!match) {
    return null;
  }

  const value = match.slice(CONSENT_COOKIE_NAME.length + 1);

  try {
    return JSON.parse(decodeURIComponent(value)) as CookieConsentState;
  } catch {
    return null;
  }
}

function persistConsent(state: CookieConsentState) {
  const serialized = encodeURIComponent(JSON.stringify(state));
  document.cookie = `${CONSENT_COOKIE_NAME}=${serialized}; path=/; max-age=${CONSENT_COOKIE_MAX_AGE}; samesite=lax`;
}

function hasGlobalPrivacyControl() {
  return (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
}

async function resolveConsentMode(): Promise<ConsentMode> {
  if (hasGlobalPrivacyControl()) {
    return "opt-in";
  }

  try {
    const response = await fetch("/api/geo", { cache: "no-store" });

    if (!response.ok) {
      return "opt-in";
    }

    const geo = (await response.json()) as GeoResponse;

    return geo.requiresOptIn === false && geo.gpc !== true ? "opt-out" : "opt-in";
  } catch {
    return "opt-in";
  }
}

/*
 * In opt-out regions GA and Clarity may already be running when the visitor
 * opts out. ConsentGate unmounts their <Script> tags, but the loaded libraries
 * stay in the page, so switch them off through their own opt-out hooks too.
 */
function setAnalyticsDisabled(disabled: boolean) {
  const measurementId = window.loomHearthGaMeasurementId?.trim();

  if (measurementId) {
    (window as unknown as Record<string, unknown>)[`ga-disable-${measurementId}`] = disabled;
  }

  if (disabled) {
    (window as Window & { clarity?: (...args: unknown[]) => void }).clarity?.("consent", false);
  }
}

type CookieConsentProviderProps = {
  children: ReactNode;
};

export function CookieConsentProvider({ children }: CookieConsentProviderProps) {
  const [consent, setConsent] = useState<CookieConsentState | null>(null);
  const [mode, setMode] = useState<ConsentMode>("opt-in");
  const [hasResolved, setHasResolved] = useState(false);

  useEffect(() => {
    const existingConsent = readConsentCookie();

    if (existingConsent) {
      setConsent(existingConsent);
      setHasResolved(true);
      return;
    }

    let cancelled = false;

    resolveConsentMode().then((resolvedMode) => {
      if (!cancelled) {
        setMode(resolvedMode);
        setHasResolved(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const updateConsent = (nextConsent: CookieConsentState) => {
    persistConsent(nextConsent);
    setAnalyticsDisabled(!nextConsent.analytics);
    setConsent(nextConsent);
  };

  const value = useMemo<CookieConsentContextValue>(
    () => ({
      consent,
      mode,
      hasResolved,
      acceptAll: () =>
        updateConsent({
          necessary: true,
          analytics: true,
          marketing: true,
        }),
      declineAll: () => updateConsent(getDefaultCookieConsentState()),
      keepDefaults: () =>
        updateConsent({
          necessary: true,
          analytics: mode === "opt-out",
          marketing: false,
        }),
      allows: (category) => {
        if (category === "necessary") {
          return true;
        }

        if (consent) {
          return consent[category];
        }

        return hasResolved && category === "analytics" && mode === "opt-out";
      },
    }),
    [consent, mode, hasResolved],
  );

  return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>;
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);

  if (!context) {
    throw new Error("useCookieConsent must be used within CookieConsentProvider");
  }

  return context;
}

type ConsentGateProps = {
  category: Exclude<CookieConsentCategory, "necessary">;
  children: ReactNode;
};

export function ConsentGate({ category, children }: ConsentGateProps) {
  const { allows } = useCookieConsent();

  if (!allows(category)) {
    return null;
  }

  return <>{children}</>;
}
