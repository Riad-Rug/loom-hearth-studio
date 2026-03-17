import "server-only";

import { redirect } from "next/navigation";

import { getAuthSession } from "@/auth";
import { db } from "@/lib/db/client";
import { hashPassword } from "@/lib/auth/password";
import type { AuthenticatedUser } from "@/lib/auth/types";
import type { AdminRole } from "@/types/domain";

export async function getCurrentAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const session = await getAuthSession();

  if (!session?.user?.email || !session.user.id) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    role: session.user.role,
  };
}

export async function requireAuthenticatedAccountUser() {
  const user = await getCurrentAuthenticatedUser();

  if (!user) {
    redirect("/account/login");
  }

  return user;
}

export async function requireAuthenticatedGuestOnlyRoute() {
  const user = await getCurrentAuthenticatedUser();

  if (user) {
    redirect("/account");
  }
}

export async function requireAuthenticatedAdminUser() {
  const user = await getCurrentAuthenticatedUser();

  if (!user) {
    redirect("/account/login");
  }

  if (!user.role || !["admin", "editor", "viewer"].includes(user.role)) {
    redirect("/");
  }

  return user;
}

export async function requireAdminRoleForMutation() {
  const user = await getCurrentAuthenticatedUser();

  if (!user) {
    return {
      status: "requires-auth" as const,
      user: null,
    };
  }

  if (!user.role || !["admin", "editor", "viewer"].includes(user.role)) {
    return {
      status: "requires-role" as const,
      user,
    };
  }

  return {
    status: "allowed" as const,
    user,
  };
}

export async function registerLaunchUser(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: AdminRole;
}) {
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !email.includes("@") ||
    !password.trim()
  ) {
    return {
      status: "invalid-input" as const,
      message: "First name, last name, email, and password are required.",
    };
  }

  const existingUser = await db.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    return {
      status: "email-taken" as const,
      message: "An account already exists for that email address.",
    };
  }

  const passwordHash = await hashPassword(password);

  const user = await db.user.create({
    data: {
      email,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.trim(),
      passwordHash,
      role: input.role,
    },
  });

  return {
    status: "created" as const,
    user: {
      id: user.id,
      email: user.email,
      role: user.role ?? undefined,
    },
    message: "Account created.",
  };
}
