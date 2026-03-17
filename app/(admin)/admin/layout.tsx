import type { ReactNode } from "react";

import { AdminShell } from "@/features/admin/admin-shell";
import { requireAuthenticatedAdminUser } from "@/lib/auth/service";

type AdminLayoutProps = {
  children: ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const authenticatedUser = await requireAuthenticatedAdminUser();

  return <AdminShell authenticatedUser={authenticatedUser}>{children}</AdminShell>;
}
