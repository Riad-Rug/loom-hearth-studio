import { AccountAuthPageView } from "@/features/account/account-auth-page-view";
import { getPasswordResetTokenView } from "@/lib/auth/password-reset-service";
import { requireAuthenticatedGuestOnlyRoute } from "@/lib/auth/service";

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
