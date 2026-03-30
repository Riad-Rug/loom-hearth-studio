export type AccountAuthMode = "login" | "register" | "forgot-password";

export const accountAuthContent = {
  login: {
    eyebrow: "Account login",
    title: "Sign in to your account",
    body:
      "Return to your Loom & Hearth Studio account with the email and password you already use. Guest checkout remains available if you prefer to shop without signing in.",
    primaryLabel: "Sign in",
    formTitle: "Returning customer sign-in",
    formBody:
      "Use the same email tied to your account so order-related account activity stays in one place. Guest checkout remains available if you would rather continue without signing in.",
    supportTitle: "Access your saved pieces and order history",
    supportBody:
      "Sign in to return to your account area, revisit saved pieces, and review order history tied to your account email.",
    reassurance:
      "Secure login. Your account and order history stay protected.",
  },
  register: {
    eyebrow: "Account registration",
    title: "Create an account",
    body:
      "Create a Loom & Hearth Studio account with the email you plan to use for orders, so future sign-ins and order-related account activity stay connected.",
    primaryLabel: "Create your account",
    formTitle: "Create your studio account",
    formBody:
      "Start with your full name, email, and password. Use the same email you plan to use at checkout for a more consistent account experience.",
    supportTitle: "Track your orders and saved pieces",
    supportBody:
      "Create an account to track your orders and saved pieces, access future product releases, and save your preferences for faster checkout.",
    reassurance:
      "Keep your orders, saved pieces, and future checkout details tied to one account email.",
  },
  "forgot-password": {
    eyebrow: "Password reset",
    title: "Reset your password",
    body:
      "Request a reset email for your Loom & Hearth Studio account, or set a new password from a valid reset link when you already have one.",
    primaryLabel: "Send reset link",
    formTitle: "Request a reset email",
    formBody:
      "Enter the email tied to your account and we will attempt to send a password reset link through the current launch flow.",
    supportTitle: "Recover access without creating a second account",
    supportBody:
      "Use password reset when you already have an account but cannot sign in. That keeps your existing account access tied to the same email instead of starting over with a new login.",
    reassurance:
      "Use password reset only to recover an existing account, not to start a second login.",
  },
} as const;

export const accountDashboardSections = [
  {
    id: "overview",
    title: "Overview",
    body:
      "Review the details tied to this account and keep your contact information up to date.",
  },
  {
    id: "orders",
    title: "Order history",
    body:
      "Orders linked to this account email appear here.",
  },
  {
    id: "profile",
    title: "Profile details",
    body:
      "Update the contact details tied to this account.",
  },
] as const;