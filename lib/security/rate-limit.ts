import "server-only";

import { createHash } from "node:crypto";

import { db } from "@/lib/db/client";
import { getLoginRateLimitPolicy } from "@/lib/security/helpers";
import type { LoginRateLimitSurface } from "@/lib/security/types";

function normalizeHeaderValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function getRequestIp(headers: Record<string, string | string[] | undefined>) {
  const forwardedFor = normalizeHeaderValue(headers["x-forwarded-for"]);

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  const realIp = normalizeHeaderValue(headers["x-real-ip"]);
  return realIp.trim() || "unknown";
}

function createLoginRateLimitIdentifier(input: {
  surface: LoginRateLimitSurface;
  email: string;
  headers: Record<string, string | string[] | undefined>;
}) {
  const ip = getRequestIp(input.headers);
  return createHash("sha256")
    .update(`${input.surface}:${input.email.toLowerCase()}:${ip}`)
    .digest("hex");
}

export async function checkLoginRateLimit(input: {
  surface: LoginRateLimitSurface;
  email: string;
  headers: Record<string, string | string[] | undefined>;
}) {
  const policy = getLoginRateLimitPolicy(input.surface);

  if (!policy) {
    return {
      status: "allowed" as const,
      identifierHash: null,
      attemptsRemaining: null,
      retryAfterSeconds: null,
    };
  }

  const identifierHash = createLoginRateLimitIdentifier(input);
  const windowStart = new Date(Date.now() - policy.windowMinutes * 60 * 1000);

  const attempts = await db.loginRateLimitAttempt.count({
    where: {
      surface: input.surface,
      identifierHash,
      attemptedAt: {
        gte: windowStart,
      },
    },
  });

  if (attempts >= policy.maxAttempts) {
    return {
      status: "limited" as const,
      identifierHash,
      attemptsRemaining: 0,
      retryAfterSeconds: policy.windowMinutes * 60,
    };
  }

  return {
    status: "allowed" as const,
    identifierHash,
    attemptsRemaining: policy.maxAttempts - attempts,
    retryAfterSeconds: null,
  };
}

export async function recordFailedLoginAttempt(input: {
  surface: LoginRateLimitSurface;
  identifierHash: string | null;
}) {
  if (!input.identifierHash) {
    return;
  }

  await db.loginRateLimitAttempt.create({
    data: {
      surface: input.surface,
      identifierHash: input.identifierHash,
    },
  });
}

export async function clearLoginRateLimitAttempts(input: {
  surface: LoginRateLimitSurface;
  identifierHash: string | null;
}) {
  if (!input.identifierHash) {
    return;
  }

  await db.loginRateLimitAttempt.deleteMany({
    where: {
      surface: input.surface,
      identifierHash: input.identifierHash,
    },
  });
}
