export type CaptchaProtectedSurface =
  | "contact"
  | "checkout"
  | "newsletter"
  | "account-register";

export type CookieConsentCategory = "necessary" | "analytics" | "marketing";

export type CookieConsentState = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

export type LoginRateLimitPolicy = {
  surface: LoginRateLimitSurface;
  maxAttempts: number;
  windowMinutes: number;
};

export type LoginRateLimitSurface = "account-login" | "admin-login";
