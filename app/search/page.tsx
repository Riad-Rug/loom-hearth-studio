import type { Metadata } from "next";

import { SearchPageView } from "@/features/catalog/search-page-view";
import { searchCatalogProducts } from "@/lib/catalog/search";
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
  const results = query ? searchCatalogProducts(products, query) : products;

  return <SearchPageView query={query} results={results} totalCount={products.length} />;
}

function sanitizeSearchQuery(value: string | undefined) {
  return typeof value === "string" ? value.trim().slice(0, 80) : "";
}
