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
  "TODO: Select the auth provider before wiring login persistence, session storage, and route protection.";
