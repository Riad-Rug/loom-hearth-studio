import "server-only";

import { randomBytes, createHash } from "node:crypto";

import { db } from "@/lib/db/client";
import { normalizePublicSiteUrl, siteConfig } from "@/config/site";
import { sendTransactionalEmailMessage } from "@/lib/email/service";
import { hashPassword } from "@/lib/auth/password";
import {
  createPasswordResetEmailMessage,
  createPasswordResetTokenView,
  type PasswordResetTokenView,
} from "@/lib/auth/password-reset";

const PASSWORD_RESET_TOKEN_TTL_MS = 1000 * 60 * 60;

function hashPasswordResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function createPasswordResetUrl(input: { token: string; origin?: string }) {
  const requestedOrigin = input.origin ? normalizePublicSiteUrl(input.origin) : "";
  const baseUrl = isLocalOrigin(requestedOrigin) ? requestedOrigin : siteConfig.siteUrl;
  const url = new URL("/account/forgot-password", baseUrl);
  url.searchParams.set("token", input.token);
  return url.toString();
}

function isLocalOrigin(value: string) {
  return value.startsWith("http://localhost") || value.startsWith("http://127.0.0.1");
}

function formatResetExpirationLabel(expiresAt: Date) {
  return `on ${new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(expiresAt)}`;
}

export async function createPasswordResetRequest(input: {
  email: string;
  origin?: string;
}) {
  const email = input.email.trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return {
      status: "invalid-input" as const,
      message: "Enter a valid email address before requesting a password reset.",
    };
  }

  const user = await db.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return {
      status: "sent" as const,
      message: "If an account exists for that email address, a reset link has been sent.",
    };
  }

  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashPasswordResetToken(rawToken);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS);

  await db.passwordResetToken.deleteMany({
    where: {
      userId: user.id,
    },
  });

  await db.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  const resetUrl = createPasswordResetUrl({
    token: rawToken,
    origin: input.origin,
  });
  const emailMessage = createPasswordResetEmailMessage({
    email: user.email,
    firstName: user.firstName,
    resetUrl,
    expiresAtLabel: formatResetExpirationLabel(expiresAt),
  });
  const deliveryResult = await sendTransactionalEmailMessage(emailMessage);

  if (deliveryResult.status === "configuration-error") {
    return {
      status: "configuration-error" as const,
      message: deliveryResult.message,
    };
  }

  if (deliveryResult.status === "api-error") {
    return {
      status: "api-error" as const,
      message: deliveryResult.message,
    };
  }

  return {
    status: "sent" as const,
    message: "If an account exists for that email address, a reset link has been sent.",
  };
}

export async function getPasswordResetTokenView(
  token: string | null | undefined,
): Promise<PasswordResetTokenView> {
  if (!token) {
    return createPasswordResetTokenView();
  }

  const passwordResetToken = await db.passwordResetToken.findUnique({
    where: {
      tokenHash: hashPasswordResetToken(token),
    },
    include: {
      user: true,
    },
  });

  if (!passwordResetToken) {
    return createPasswordResetTokenView({
      token,
      status: "invalid",
    });
  }

  if (passwordResetToken.usedAt) {
    return createPasswordResetTokenView({
      token,
      status: "used",
      email: passwordResetToken.user.email,
    });
  }

  if (passwordResetToken.expiresAt <= new Date()) {
    return createPasswordResetTokenView({
      token,
      status: "expired",
      email: passwordResetToken.user.email,
      expiresAtLabel: formatResetExpirationLabel(passwordResetToken.expiresAt),
    });
  }

  return createPasswordResetTokenView({
    token,
    status: "valid",
    email: passwordResetToken.user.email,
    expiresAtLabel: formatResetExpirationLabel(passwordResetToken.expiresAt),
  });
}

export async function resetPasswordWithToken(input: {
  token: string;
  password: string;
}) {
  const token = input.token.trim();
  const password = input.password.trim();

  if (!token || !password) {
    return {
      status: "invalid-input" as const,
      message: "A valid reset token and new password are required.",
    };
  }

  const passwordResetToken = await db.passwordResetToken.findUnique({
    where: {
      tokenHash: hashPasswordResetToken(token),
    },
  });

  if (!passwordResetToken) {
    return {
      status: "invalid-token" as const,
      message: "This password reset link is invalid.",
    };
  }

  if (passwordResetToken.usedAt) {
    return {
      status: "used-token" as const,
      message: "This password reset link has already been used.",
    };
  }

  if (passwordResetToken.expiresAt <= new Date()) {
    return {
      status: "expired-token" as const,
      message: "This password reset link has expired.",
    };
  }

  const passwordHash = await hashPassword(password);

  await db.$transaction([
    db.user.update({
      where: {
        id: passwordResetToken.userId,
      },
      data: {
        passwordHash,
      },
    }),
    db.passwordResetToken.update({
      where: {
        id: passwordResetToken.id,
      },
      data: {
        usedAt: new Date(),
      },
    }),
    db.session.deleteMany({
      where: {
        userId: passwordResetToken.userId,
      },
    }),
  ]);

  return {
    status: "reset" as const,
    message: "Password updated. Sign in with your new password.",
  };
}
