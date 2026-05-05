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

  const normalizedQuery = query.toLowerCase();

  return products
    .map((product) => ({
      product,
      score: getProductSearchScore(product, terms, normalizedQuery),
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .map((entry) => entry.product);
}

function getProductSearchScore(
  product: CatalogProductCardViewModel,
  terms: string[],
  normalizedQuery: string,
) {
  const title = product.name.toLowerCase();
  const description = product.description.toLowerCase();
  const subtitle = product.subtitle.toLowerCase();
  const supportingText = [
    product.merchandisingNote,
    product.badge,
    product.category,
    product.type,
    product.priceUsdLabel,
  ]
    .join(" ")
    .toLowerCase();

  let score = 0;

  if (title.includes(normalizedQuery)) {
    score += 120;
  }

  if (description.includes(normalizedQuery)) {
    score += 80;
  }

  if (subtitle.includes(normalizedQuery)) {
    score += 45;
  }

  for (const term of terms) {
    if (title.includes(term)) {
      score += 40;
    }

    if (description.includes(term)) {
      score += 24;
    }

    if (subtitle.includes(term)) {
      score += 14;
    }

    if (supportingText.includes(term)) {
      score += 6;
    }
  }

  return score;
}
