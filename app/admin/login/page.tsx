import { AccountAuthPageView } from "@/features/account/account-auth-page-view";
import { requireAdminLoginEntryAccess } from "@/lib/auth/service";

export default async function AdminLoginPage() {
  await requireAdminLoginEntryAccess();

  return <AccountAuthPageView mode="login" surface="admin" />;
}
