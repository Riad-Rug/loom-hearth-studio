export type AccountAuthMode = "login" | "register" | "forgot-password";

export const accountAuthContent = {
  login: {
    eyebrow: "Account login",
    title: "Sign in to your account",
    body:
      "Sign in with your Loom & Hearth Studio email and password. Guest checkout remains available if you do not need an account.",
    primaryLabel: "Sign in",
  },
  register: {
    eyebrow: "Account registration",
    title: "Create an account",
    body:
      "Create a Loom & Hearth Studio account to review your order history and manage future sign-ins, while keeping guest checkout available.",
    primaryLabel: "Create account",
  },
  "forgot-password": {
    eyebrow: "Password reset",
    title: "Reset your password",
    body:
      "Request a password reset link or set a new password from a valid reset email, using the existing account auth boundary.",
    primaryLabel: "Send reset link",
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
