import { notFound } from "next/navigation";

import { getMultiUnitPlaceholderByParams } from "@/features/pdp/pdp-data";
import { ProductDetailPageView } from "@/features/pdp/product-detail-page-view";

type CategoryProductPageProps = {
  params: Promise<{
    category: string;
    slug: string;
  }>;
};

export default async function CategoryProductPage({
  params,
}: CategoryProductPageProps) {
  const resolvedParams = await params;
  const product = getMultiUnitPlaceholderByParams(
    resolvedParams.category,
    resolvedParams.slug,
  );

  if (!product) {
    notFound();
  }

  return <ProductDetailPageView product={product} />;
}
