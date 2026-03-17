import {
  captchaProtectedSurfaces,
  loginRateLimitPolicies,
} from "@/lib/security/config";
import type {
  CaptchaProtectedSurface,
  LoginRateLimitSurface,
} from "@/lib/security/types";

export function requiresCaptcha(surface: CaptchaProtectedSurface) {
  return captchaProtectedSurfaces.includes(surface);
}

export function getLoginRateLimitPolicy(surface: LoginRateLimitSurface) {
  return loginRateLimitPolicies.find((policy) => policy.surface === surface) ?? null;
}

export function getDefaultCookieConsentState() {
  return {
    necessary: true as const,
    analytics: false,
    marketing: false,
  };
}
