import { AdminProductsPageView } from "@/features/admin/admin-products-page-view";
import { getAdminProductsPageData } from "@/lib/admin/products";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const pageData = await getAdminProductsPageData();

  return <AdminProductsPageView {...pageData} />;
}
