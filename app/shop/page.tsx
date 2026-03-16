import type { Metadata } from "next";

import { CatalogPageView } from "@/features/catalog/catalog-page-view";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Shop",
  description: "Browse the launch catalog structure for rugs and home decor.",
  path: "/shop",
});

export default function ShopPage() {
  return <CatalogPageView />;
}
