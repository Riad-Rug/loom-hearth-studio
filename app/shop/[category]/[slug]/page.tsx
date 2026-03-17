import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/json-ld";
import { getCategoryProductDetailByParams } from "@/lib/catalog/service";
import { ProductDetailPageView } from "@/features/pdp/product-detail-page-view";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, productSchema } from "@/lib/seo/schema";

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
  const product = await getCategoryProductDetailByParams({
    category: resolvedParams.category,
    slug: resolvedParams.slug,
  });

  if (!product) {
    notFound();
  }

  return (
    <>
      <JsonLd
        data={[
          productSchema({
            name: product.name,
            description: product.description,
            path: `/shop/${product.category}/${product.slug}`,
            priceUsdLabel: product.priceUsdLabel,
            category: product.category,
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Shop", path: "/shop" },
            {
              name: product.category.charAt(0).toUpperCase() + product.category.slice(1),
              path: `/shop/${product.category}`,
            },
            { name: product.name, path: `/shop/${product.category}/${product.slug}` },
          ]),
        ]}
      />
      <ProductDetailPageView product={product} />
    </>
  );
}

export async function generateMetadata({
  params,
}: CategoryProductPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getCategoryProductDetailByParams({
    category: resolvedParams.category,
    slug: resolvedParams.slug,
  });

  if (!product) {
    return buildMetadata({
      title: "Shop",
      description: "Browse the launch collection for rugs and home decor.",
      path: "/shop",
    });
  }

  return buildMetadata({
    title: product.name,
    description: product.description,
    path: `/shop/${product.category}/${product.slug}`,
  });
}
