import type { Metadata } from "next";
import type { Route } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { JsonLd } from "@/components/seo/json-ld";
import { getRugStyleCollection } from "@/features/catalog/rug-style-collections";
import { getCategoryLabel } from "@/lib/catalog/helpers";
import {
  getProductRedirectPathForSlug,
  getRugProductDetailByParams,
  listAvailableRugStyleSlugs,
} from "@/lib/catalog/service";
import { normalizeSlug } from "@/lib/catalog/product-validation";
import { ProductDetailPageView } from "@/features/pdp/product-detail-page-view";
import { buildManagedMetadata, buildMetadata } from "@/lib/seo/metadata";
import { buildProductMetaDescription } from "@/lib/seo/product-metadata";
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
    // A slug the product used before, or the right slug under the wrong style segment,
    // 301s to the current URL. Only a slug nobody has ever used is a 404.
    const redirectPath = await getProductRedirectPathForSlug({ slug: resolvedParams.slug });
    const requestedPath = `/shop/rugs/${resolvedParams.style}/${resolvedParams.slug}`;

    if (redirectPath && redirectPath !== requestedPath) {
      permanentRedirect(redirectPath as Route);
    }

    notFound();
  }

  const productPath = getRugProductPath(product);
  const rugStyleSlug = normalizeSlug(product.rugStyle);
  const collection = getRugStyleCollection(rugStyleSlug);

  if (`/shop/rugs/${resolvedParams.style}/${resolvedParams.slug}` !== productPath) {
    permanentRedirect(productPath as Route);
  }

  // A style page is served noindex while nothing of that style is purchasable,
  // and a sold rug's PDP stays indexable, so the last piece of a style to sell
  // would otherwise keep a crawlable breadcrumb aimed at a page we are asking
  // Google to ignore. The schema below and the visible trail drop the style
  // level together in that case; the view is told the answer so it cannot
  // disagree with the schema.
  const rugStyleHasStock = collection
    ? (await listAvailableRugStyleSlugs()).has(rugStyleSlug)
    : false;

  return (
    <>
      <JsonLd
        data={productSchema({
          id: product.id,
          name: product.name,
          description: product.description,
          path: productPath,
          priceUsdLabel: product.priceUsdLabel,
          category: product.category,
          imageUrls: product.gallery.map((image) => image.src),
          availability: product.status === "sold" ? "outOfStock" : "inStock",
          isOneOfOne: true,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Shop", path: "/shop" },
          { name: getCategoryLabel(product.category), path: "/shop/rugs" },
          ...(collection && rugStyleHasStock
            ? [
                {
                  name: collection.title,
                  path: `/shop/rugs/${rugStyleSlug}`,
                },
              ]
            : []),
          { name: product.name, path: productPath },
        ])}
      />
      <ProductDetailPageView product={product} rugStyleHasStock={rugStyleHasStock} />
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
      description: "Browse handcrafted Moroccan rugs sourced in Marrakech and prepared for review-first buying.",
      path: "/shop/rugs",
    });
  }

  const ogImage = product.gallery[0];

  return buildManagedMetadata({
    entityType: "product",
    entityKey: product.id,
    title: product.seoTitle || product.name,
    description: buildProductMetaDescription(product),
    path: getRugProductPath(product),
    type: "product",
    ogImageUrl: ogImage?.src,
    ogImageAlt: ogImage?.altText || product.name,
    ogImageWidth: 1600,
    ogImageHeight: 1200,
  });
}

function getRugProductPath(product: { rugStyle: string; slug: string }) {
  return `/shop/rugs/${normalizeSlug(product.rugStyle)}/${product.slug}`;
}
