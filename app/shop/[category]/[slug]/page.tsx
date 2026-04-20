import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/json-ld";
import { getCategoryProductDetailByParams } from "@/lib/catalog/service";
import { ProductDetailPageView } from "@/features/pdp/product-detail-page-view";
import { buildManagedMetadata, buildMetadata } from "@/lib/seo/metadata";
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

  const productPath = getCategoryProductPath(product);

  return (
    <>
      <JsonLd
        data={[
          productSchema({
            id: product.id,
            name: product.name,
            description: product.description,
            path: productPath,
            priceUsdLabel: product.priceUsdLabel,
            category: product.category,
            imageUrls: product.gallery.map((image) => image.src),
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Shop", path: "/shop" },
            {
              name: product.category.charAt(0).toUpperCase() + product.category.slice(1),
              path: `/shop/${product.category}`,
            },
            { name: product.name, path: productPath },
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
      description: "Browse Moroccan rugs, poufs, pillows, and decor sourced in Marrakech and prepared for review-first buying.",
      path: "/shop",
    });
  }

  return buildManagedMetadata({
    entityType: "product",
    entityKey: product.id,
    title: product.seoTitle || product.name,
    description: product.seoDescription || product.description,
    path: getCategoryProductPath(product),
  });
}

function getCategoryProductPath(product: { category: string; slug: string }) {
  return `/shop/${product.category}/${product.slug}`;
}
