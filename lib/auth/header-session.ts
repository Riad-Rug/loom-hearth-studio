import "server-only";

import { headers } from "next/headers";
import { getToken } from "next-auth/jwt";

export async function hasAuthenticatedHeaderSession(): Promise<boolean> {
  const requestHeaders = await headers();
  const cookie = requestHeaders.get("cookie") ?? undefined;

  if (!cookie) {
    return false;
  }

  // The shared header only needs a boolean auth state, so reading the JWT
  // avoids pulling the broader auth service and Prisma-backed adapter path
  // into every route that renders the root layout.
  const token = await getToken({
    req: {
      headers: {
        cookie,
      },
    } as Parameters<typeof getToken>[0]["req"],
  });

  return Boolean(token);
}
