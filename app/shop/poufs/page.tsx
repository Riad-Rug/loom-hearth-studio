import { CatalogPageView } from "@/features/catalog/catalog-page-view";
import { listCatalogProductCards } from "@/lib/catalog/service";

export default async function PoufsPage() {
  const products = await listCatalogProductCards({ category: "poufs" });

  return <CatalogPageView category="poufs" products={products} />;
}
