import type {
  CaptchaProtectedSurface,
  LoginRateLimitPolicy,
} from "@/lib/security/types";

export const captchaProtectedSurfaces: readonly CaptchaProtectedSurface[] = [
  "contact",
  "checkout",
  "newsletter",
  "account-register",
] as const;

export const loginRateLimitPolicies: readonly LoginRateLimitPolicy[] = [
  {
    surface: "account-login",
    maxAttempts: 5,
    windowMinutes: 15,
  },
  {
    surface: "admin-login",
    maxAttempts: 5,
    windowMinutes: 15,
  },
] as const;

export const securityFoundationTodos = {
  captcha:
    "TODO: Select and integrate a CAPTCHA provider before enabling protected public forms.",
  cookieConsent:
    "TODO: Add real cookie-consent persistence and category handling before production.",
  rateLimit:
    "Launch credentials login now uses a server-side rate limit on the Auth.js credentials request path. Broader account security tooling remains out of scope.",
} as const;
