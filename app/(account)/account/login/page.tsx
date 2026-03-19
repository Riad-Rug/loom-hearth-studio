import type { Metadata } from "next";

import { AccountAuthPageView } from "@/features/account/account-auth-page-view";
import { buildMetadata } from "@/lib/seo/metadata";
import { requireAuthenticatedGuestOnlyRoute } from "@/lib/auth/service";

export const metadata: Metadata = buildMetadata({
  title: "Customer login | Loom & Hearth Studio",
  description:
    "Sign in to your Loom & Hearth Studio account to access order-related account activity and a smoother return visit experience.",
  path: "/account/login",
  noIndex: true,
});

export default async function LoginPage() {
  await requireAuthenticatedGuestOnlyRoute();

  return <AccountAuthPageView mode="login" />;
}