export type AccountAuthMode = "login" | "register" | "forgot-password";

export const accountAuthContent = {
  login: {
    eyebrow: "Account login",
    title: "Sign in to your account",
    body:
      "This is a guest-facing account shell only. Authentication is not implemented yet, and provider selection remains unresolved.",
    primaryLabel: "Sign in UI placeholder",
  },
  register: {
    eyebrow: "Account registration",
    title: "Create an account",
    body:
      "The PRD includes customer account pages alongside guest checkout. This registration screen is placeholder UI only and does not create a real account.",
    primaryLabel: "Create account UI placeholder",
  },
  "forgot-password": {
    eyebrow: "Password reset",
    title: "Reset your password",
    body:
      "This password reset screen is presentation only. No email delivery, token flow, or auth integration is implemented in this slice.",
    primaryLabel: "Send reset link UI placeholder",
  },
} as const;

export const accountDashboardSections = [
  {
    id: "overview",
    title: "Overview",
    body:
      "Placeholder account overview panel reserved for future customer account data and status summaries.",
  },
  {
    id: "orders",
    title: "Order history",
    body:
      "Persisted launch orders now appear here for the signed-in account email. Broader account linking and order operations remain out of scope.",
  },
  {
    id: "profile",
    title: "Profile details",
    body:
      "Placeholder profile area reserved for future customer details and account management fields.",
  },
] as const;
