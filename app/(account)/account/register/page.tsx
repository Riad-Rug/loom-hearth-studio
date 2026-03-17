import { AccountAuthPageView } from "@/features/account/account-auth-page-view";
import { requireAuthenticatedGuestOnlyRoute } from "@/lib/auth/service";

export default async function RegisterPage() {
  await requireAuthenticatedGuestOnlyRoute();

  return <AccountAuthPageView mode="register" />;
}
