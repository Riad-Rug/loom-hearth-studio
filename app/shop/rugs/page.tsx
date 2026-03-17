import { CatalogPageView } from "@/features/catalog/catalog-page-view";
import { listCatalogProductCards } from "@/lib/catalog/service";

export default async function RugsPage() {
  const products = await listCatalogProductCards({ category: "rugs" });

  return <CatalogPageView category="rugs" products={products} />;
}
