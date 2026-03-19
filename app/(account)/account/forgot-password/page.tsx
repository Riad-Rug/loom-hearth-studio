import type { Metadata } from "next";

import { AccountAuthPageView } from "@/features/account/account-auth-page-view";
import { getPasswordResetTokenView } from "@/lib/auth/password-reset-service";
import { requireAuthenticatedGuestOnlyRoute } from "@/lib/auth/service";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Reset your password | Loom & Hearth Studio",
  description:
    "Request a Loom & Hearth Studio password reset link or set a new account password from a valid reset email.",
  path: "/account/forgot-password",
  noIndex: true,
});

export default async function ForgotPasswordPage(props: {
  searchParams?: Promise<{
    token?: string;
  }>;
}) {
  await requireAuthenticatedGuestOnlyRoute();
  const searchParams = await props.searchParams;
  const passwordResetTokenView = await getPasswordResetTokenView(searchParams?.token ?? null);

  return (
    <AccountAuthPageView
      mode="forgot-password"
      passwordResetTokenView={passwordResetTokenView}
    />
  );
}