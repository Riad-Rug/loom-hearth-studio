import "server-only";

import { getAuthSession } from "@/auth";

export type HeaderAuthState = {
  isAuthenticated: boolean;
  firstName: string | null;
};

export async function getHeaderAuthState(): Promise<HeaderAuthState> {
  const session = await getAuthSession();
  const userId = session?.user?.id;

  if (!userId) {
    return { isAuthenticated: false, firstName: null };
  }

  const firstName = session?.user?.name?.trim().split(/\s+/)[0] ?? null;

  return { isAuthenticated: true, firstName };
}
