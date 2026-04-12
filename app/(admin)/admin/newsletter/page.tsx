import { AdminNewsletterPageView } from "@/features/admin/admin-newsletter-page-view";
import { getAdminNewsletterPageData } from "@/lib/admin/newsletter";

export const dynamic = "force-dynamic";

export default async function AdminNewsletterPage() {
  const pageData = await getAdminNewsletterPageData();

  return <AdminNewsletterPageView {...pageData} />;
}
