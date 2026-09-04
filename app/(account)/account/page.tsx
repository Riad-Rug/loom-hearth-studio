import {
  getAccountDashboardData,
} from "@/lib/account/dashboard";
import { createAccountProfileSummaryView } from "@/lib/account/dashboard-shared";
import { requireAuthenticatedAccountUser } from "@/lib/auth/service";
import { AccountDashboardPageView } from "@/features/account/account-dashboard-page-view";
import { buildMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";

// Private, auth-gated dashboard. It is linked from the header on every page, so it must
// carry an explicit noindex, nofollow rather than the default "index, follow".
export const metadata: Metadata = buildMetadata({
  title: "My Account | Loom & Hearth Studio",
  description: "Your Loom & Hearth Studio account: orders, reservations and profile details.",
  path: "/account",
  noIndex: true,
});

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const authenticatedUser = await requireAuthenticatedAccountUser();
  const dashboardData = await getAccountDashboardData(authenticatedUser);
  const profileSummaryView = createAccountProfileSummaryView(dashboardData?.profile ?? null);

  return (
    <AccountDashboardPageView
      authenticatedUser={authenticatedUser}
      dashboardData={dashboardData}
      profileSummaryView={profileSummaryView}
    />
  );
}
