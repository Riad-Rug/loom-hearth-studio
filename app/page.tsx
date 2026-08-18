import type { Metadata } from "next";

import { HomePageView } from "@/features/home/home-page-view";
import {
  listCatalogProductCards,
  listRandomInventoryProductCards,
  listUnavailableCategoryHrefs,
} from "@/lib/catalog/service";
import { getHomepageContent } from "@/lib/homepage/content";
import { buildManagedMetadata } from "@/lib/seo/metadata";
import type { ProductCategory } from "@/types/domain";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getHomepageContent();

  return buildManagedMetadata({
    entityType: "site",
    entityKey: "home",
    title: content.pageSeo.title || content.hero.seo.seoTitle || content.hero.title,
    description:
      content.pageSeo.description || content.hero.seo.metaDescription || content.hero.paragraph,
    path: "/",
  });
}

export default async function HomePage() {
  const [content, inventoryProducts, allProducts, unavailableCategoryHrefs] = await Promise.all([
    getHomepageContent(),
    listRandomInventoryProductCards({ limit: 24 }),
    listCatalogProductCards(),
    listUnavailableCategoryHrefs(),
  ]);
  const liveCategories = [
    ...new Set<ProductCategory>(
      allProducts
        .filter((product) => product.status === "active")
        .map((product) => product.category),
    ),
  ];

  return (
    <HomePageView
      content={content}
      inventoryProducts={inventoryProducts}
      liveCategories={liveCategories}
      unavailableCategoryHrefs={unavailableCategoryHrefs}
    />
  );
}
