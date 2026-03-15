import { notFound } from "next/navigation";

import { getRugPlaceholderByParams } from "@/features/pdp/pdp-data";
import { ProductDetailPageView } from "@/features/pdp/product-detail-page-view";

type RugProductPageProps = {
  params: Promise<{
    style: string;
    slug: string;
  }>;
};

export default async function RugProductPage({ params }: RugProductPageProps) {
  const resolvedParams = await params;
  const product = getRugPlaceholderByParams(resolvedParams.style, resolvedParams.slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailPageView product={product} />;
}
