import {
  getAccountDashboardData,
} from "@/lib/account/dashboard";
import { createAccountProfileSummaryView } from "@/lib/account/dashboard-shared";
import { requireAuthenticatedAccountUser } from "@/lib/auth/service";
import { AccountDashboardPageView } from "@/features/account/account-dashboard-page-view";

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
