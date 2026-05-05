import "server-only";

import { getAuthSession } from "@/auth";

export async function hasAuthenticatedHeaderSession(): Promise<boolean> {
  const session = await getAuthSession();

  return Boolean(session?.user?.id);
}
