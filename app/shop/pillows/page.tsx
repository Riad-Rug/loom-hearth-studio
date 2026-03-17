import { CatalogPageView } from "@/features/catalog/catalog-page-view";
import { listCatalogProductCards } from "@/lib/catalog/service";

export default async function PillowsPage() {
  const products = await listCatalogProductCards({ category: "pillows" });

  return <CatalogPageView category="pillows" products={products} />;
}
