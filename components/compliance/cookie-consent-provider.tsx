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

type CookieConsentContextValue = {
  consent: CookieConsentState | null;
  hasResolved: boolean;
  acceptAll: () => void;
  declineAll: () => void;
  allows: (category: CookieConsentCategory) => boolean;
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

type CookieConsentProviderProps = {
  children: ReactNode;
};

export function CookieConsentProvider({ children }: CookieConsentProviderProps) {
  const [consent, setConsent] = useState<CookieConsentState | null>(null);
  const [hasResolved, setHasResolved] = useState(false);

  useEffect(() => {
    const existingConsent = readConsentCookie();
    setConsent(existingConsent);
    setHasResolved(true);
  }, []);

  const updateConsent = (nextConsent: CookieConsentState) => {
    persistConsent(nextConsent);
    setConsent(nextConsent);
  };

  const value = useMemo<CookieConsentContextValue>(
    () => ({
      consent,
      hasResolved,
      acceptAll: () =>
        updateConsent({
          necessary: true,
          analytics: true,
          marketing: true,
        }),
      declineAll: () => updateConsent(getDefaultCookieConsentState()),
      allows: (category) => {
        if (category === "necessary") {
          return true;
        }

        return consent?.[category] ?? false;
      },
    }),
    [consent, hasResolved],
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
