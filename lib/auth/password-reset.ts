import type { EmailMessage } from "@/lib/email";

export type ForgotPasswordRequestPayload = {
  email: string;
};

export type ForgotPasswordRequestState = {
  status: "idle" | "submitting" | "success" | "failure";
  payload: ForgotPasswordRequestPayload | null;
  resetEmailPreview: EmailMessage | null;
  message: string | null;
};

export function createForgotPasswordRequestPayload(
  email: string,
): ForgotPasswordRequestPayload | null {
  const normalizedEmail = email.trim();

  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    return null;
  }

  return {
    email: normalizedEmail,
  };
}

export function createForgotPasswordResetEmailPreview(
  payload: ForgotPasswordRequestPayload | null,
): EmailMessage | null {
  if (!payload) {
    return null;
  }

  return {
    to: payload.email,
    subject: "Password reset placeholder",
    html: `<p>Password reset placeholder for ${payload.email}.</p>`,
    text: `Password reset placeholder for ${payload.email}.`,
  };
}

export const forgotPasswordRequestTodo =
  "TODO: Connect forgot-password requests to a real auth provider and email delivery flow once those decisions are implemented.";
