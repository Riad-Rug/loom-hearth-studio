import type { EmailMessage } from "@/lib/email";
import type { AuthRequestStatus } from "@/lib/auth/requests";

export type ForgotPasswordRequestPayload = {
  email: string;
};

export type ForgotPasswordRequestState = {
  status: AuthRequestStatus;
  payload: ForgotPasswordRequestPayload | null;
  message: string | null;
};

export type PasswordResetTokenView = {
  token: string | null;
  status: "request" | "valid" | "invalid" | "expired" | "used";
  email: string | null;
  expiresAtLabel: string | null;
};

export type ResetPasswordPayload = {
  token: string;
  password: string;
  confirmPassword: string;
};

export type ResetPasswordState = {
  status: AuthRequestStatus;
  payload: ResetPasswordPayload | null;
  message: string | null;
};

export function createForgotPasswordRequestPayload(
  email: string,
): ForgotPasswordRequestPayload | null {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    return null;
  }

  return {
    email: normalizedEmail,
  };
}

export function createResetPasswordPayload(input: {
  token: string | null;
  password: string;
  confirmPassword: string;
}): ResetPasswordPayload | null {
  const token = input.token?.trim() ?? "";
  const password = input.password.trim();
  const confirmPassword = input.confirmPassword.trim();

  if (!token || !password || !confirmPassword || password !== confirmPassword) {
    return null;
  }

  return {
    token,
    password,
    confirmPassword,
  };
}

export function createInitialForgotPasswordRequestState(): ForgotPasswordRequestState {
  return {
    status: "idle",
    payload: null,
    message: null,
  };
}

export function createInitialResetPasswordState(): ResetPasswordState {
  return {
    status: "idle",
    payload: null,
    message: null,
  };
}

export function createPasswordResetTokenView(input?: Partial<PasswordResetTokenView>) {
  return {
    token: input?.token ?? null,
    status: input?.status ?? "request",
    email: input?.email ?? null,
    expiresAtLabel: input?.expiresAtLabel ?? null,
  } satisfies PasswordResetTokenView;
}

export function createPasswordResetEmailMessage(input: {
  email: string;
  firstName: string | null;
  resetUrl: string;
  expiresAtLabel: string;
}): EmailMessage {
  const customerName = input.firstName?.trim() || "there";

  return {
    to: input.email,
    subject: "Reset your Loom & Hearth Studio password",
    html: [
      `<p>Hi ${escapeHtml(customerName)},</p>`,
      "<p>We received a request to reset the password for your Loom & Hearth Studio account.</p>",
      `<p><a href="${escapeHtml(input.resetUrl)}">Reset your password</a></p>`,
      `<p>This link expires ${escapeHtml(input.expiresAtLabel)}.</p>`,
      "<p>If you did not request a password reset, you can ignore this email.</p>",
      "<p>Thank you,<br />Loom & Hearth Studio</p>",
    ].join(""),
    text: [
      `Hi ${customerName},`,
      "",
      "We received a request to reset the password for your Loom & Hearth Studio account.",
      `Reset your password: ${input.resetUrl}`,
      `This link expires ${input.expiresAtLabel}.`,
      "If you did not request a password reset, you can ignore this email.",
      "",
      "Thank you,",
      "Loom & Hearth Studio",
    ].join("\n"),
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export const forgotPasswordRequestTodo =
  "Password reset now creates persisted launch reset tokens and sends a Postmark reset email. Broader account recovery and security hardening remain out of scope.";
