import { CatalogPageView } from "@/features/catalog/catalog-page-view";
import { listCatalogProductCards } from "@/lib/catalog/service";

export default async function VintagePage() {
  const products = await listCatalogProductCards({ category: "vintage" });

  return <CatalogPageView category="vintage" products={products} />;
}
