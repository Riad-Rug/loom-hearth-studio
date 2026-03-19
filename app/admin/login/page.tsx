import type { Metadata } from "next";

import { AccountAuthPageView } from "@/features/account/account-auth-page-view";
import { requireAdminLoginEntryAccess } from "@/lib/auth/service";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Admin login | Loom & Hearth Studio",
  description:
    "Sign in to the Loom & Hearth Studio admin area with an approved back-office account.",
  path: "/admin/login",
  noIndex: true,
});

export default async function AdminLoginPage() {
  await requireAdminLoginEntryAccess();

  return <AccountAuthPageView mode="login" surface="admin" />;
}