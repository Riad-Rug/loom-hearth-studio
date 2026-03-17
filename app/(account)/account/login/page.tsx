import { AccountAuthPageView } from "@/features/account/account-auth-page-view";
import { requireAuthenticatedGuestOnlyRoute } from "@/lib/auth/service";

export default async function LoginPage() {
  await requireAuthenticatedGuestOnlyRoute();

  return <AccountAuthPageView mode="login" />;
}
