import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/json-ld";
import { getRugProductDetailByParams } from "@/lib/catalog/service";
import { ProductDetailPageView } from "@/features/pdp/product-detail-page-view";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, productSchema } from "@/lib/seo/schema";

type RugProductPageProps = {
  params: Promise<{
    style: string;
    slug: string;
  }>;
};

export default async function RugProductPage({ params }: RugProductPageProps) {
  const resolvedParams = await params;
  const product = await getRugProductDetailByParams({
    style: resolvedParams.style,
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
            path: `/shop/rugs/${product.rugStyle}/${product.slug}`,
            priceUsdLabel: product.priceUsdLabel,
            category: product.category,
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Shop", path: "/shop" },
            { name: "Rugs", path: "/shop/rugs" },
            { name: product.name, path: `/shop/rugs/${product.rugStyle}/${product.slug}` },
          ]),
        ]}
      />
      <ProductDetailPageView product={product} />
    </>
  );
}

export async function generateMetadata({
  params,
}: RugProductPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getRugProductDetailByParams({
    style: resolvedParams.style,
    slug: resolvedParams.slug,
  });

  if (!product) {
    return buildMetadata({
      title: "Rugs",
      description: "Browse handcrafted launch rugs.",
      path: "/shop/rugs",
    });
  }

  return buildMetadata({
    title: product.name,
    description: product.description,
    path: `/shop/rugs/${product.rugStyle}/${product.slug}`,
  });
}
