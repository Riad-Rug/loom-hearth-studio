import { CatalogPageView } from "@/features/catalog/catalog-page-view";
import { listCatalogProductCards } from "@/lib/catalog/service";

export default async function DecorPage() {
  const products = await listCatalogProductCards({ category: "decor" });

  return <CatalogPageView category="decor" products={products} />;
}
