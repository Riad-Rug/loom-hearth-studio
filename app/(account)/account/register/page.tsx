import type { Metadata } from "next";

import { AccountAuthPageView } from "@/features/account/account-auth-page-view";
import { requireAuthenticatedGuestOnlyRoute } from "@/lib/auth/service";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Create an account | Loom & Hearth Studio",
  description:
    "Create a Loom & Hearth Studio account to keep order-related account activity tied to one email and make future sign-ins easier.",
  path: "/account/register",
  noIndex: true,
});

export default async function RegisterPage() {
  await requireAuthenticatedGuestOnlyRoute();

  return <AccountAuthPageView mode="register" />;
}