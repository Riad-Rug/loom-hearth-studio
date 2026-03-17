export type AuthMode = "customer-account" | "admin-backoffice";

export const supportedAdminRoles = ["admin", "editor", "viewer"] as const;

export const authConfig = {
  customer: {
    mode: "customer-account" as const,
    guestCheckoutAllowed: true,
    accountRequiredForCheckout: false,
  },
  admin: {
    mode: "admin-backoffice" as const,
    roles: supportedAdminRoles,
  },
} as const;

export const authConfigTodo =
  "Launch auth is limited to email/password credentials, guest checkout remains allowed, and protected account/admin routes use server-side session checks.";
