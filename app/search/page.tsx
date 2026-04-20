import type { Metadata } from "next";

import { SearchPageView } from "@/features/catalog/search-page-view";
import type { CatalogProductCardViewModel } from "@/lib/catalog/contracts";
import { listCatalogProductCards } from "@/lib/catalog/service";
import { buildManagedMetadata } from "@/lib/seo/metadata";

type SearchPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return buildManagedMetadata({
    entityType: "category",
    entityKey: "search",
    title: "Search",
    description: "Search Loom & Hearth Studio pieces by rug style, material, category, or detail.",
    path: "/search",
  });
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const query = sanitizeSearchQuery(resolvedSearchParams?.q);
  const products = await listCatalogProductCards();
  const results = query ? filterProducts(products, query) : products;

  return <SearchPageView query={query} results={results} totalCount={products.length} />;
}

function sanitizeSearchQuery(value: string | undefined) {
  return typeof value === "string" ? value.trim().slice(0, 80) : "";
}

function filterProducts(products: CatalogProductCardViewModel[], query: string) {
  const terms = query
    .toLowerCase()
    .split(/\s+/u)
    .filter(Boolean);

  return products.filter((product) => {
    const haystack = [
      product.name,
      product.subtitle,
      product.category,
      product.type,
      product.priceUsdLabel,
      product.description,
      product.merchandisingNote,
      product.badge,
    ]
      .join(" ")
      .toLowerCase();

    return terms.every((term) => haystack.includes(term));
  });
}
