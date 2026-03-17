import {
  createAccountProfileSummaryView,
  getAccountDashboardData,
} from "@/lib/account/dashboard";
import { AccountDashboardPageView } from "@/features/account/account-dashboard-page-view";

const placeholderUser = {
  id: "account-session-placeholder",
  email: "customer@example.com",
};

export default async function AccountPage() {
  const dashboardData = await getAccountDashboardData(placeholderUser);
  const profileSummaryView = createAccountProfileSummaryView(dashboardData?.profile ?? null);

  return (
    <AccountDashboardPageView
      dashboardData={dashboardData}
      profileSummaryView={profileSummaryView}
    />
  );
}
