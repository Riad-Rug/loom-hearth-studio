import { AdminPromosPageView } from "@/features/admin/admin-promos-page-view";
import { getAdminPromosPageData } from "@/lib/admin/promos";

export const dynamic = "force-dynamic";

export default async function AdminPromosPage() {
  const pageData = await getAdminPromosPageData();
  return <AdminPromosPageView {...pageData} />;
}
