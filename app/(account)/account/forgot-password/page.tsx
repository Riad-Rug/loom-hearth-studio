import { AccountAuthPageView } from "@/features/account/account-auth-page-view";
import { requireAuthenticatedGuestOnlyRoute } from "@/lib/auth/service";

export default async function ForgotPasswordPage() {
  await requireAuthenticatedGuestOnlyRoute();

  return <AccountAuthPageView mode="forgot-password" />;
}
