import { AdminAnalyticsPageView } from "@/features/admin/admin-analytics-page-view";
import { getAdminAnalyticsPageData } from "@/lib/admin/analytics";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const pageData = await getAdminAnalyticsPageData();

  return <AdminAnalyticsPageView {...pageData} />;
}
