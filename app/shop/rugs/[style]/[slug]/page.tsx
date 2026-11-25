import type { Metadata } from "next";
import type { Route } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { JsonLd } from "@/components/seo/json-ld";
import { ProductOpenGraphMeta } from "@/components/seo/product-open-graph-meta";
import { getCategoryLabel, getProductRoutePath } from "@/lib/catalog/helpers";
import {
  getProductIndexFacts,
  getProductRedirectPathForSlug,
  getRugPageLinks,
  getRugProductDetailByParams,
} from "@/lib/catalog/service";
import { ProductDetailPageView } from "@/features/pdp/product-detail-page-view";
import { isProductIndexable } from "@/lib/seo/index-policy";
import { buildManagedMetadata, buildMetadata } from "@/lib/seo/metadata";
import { buildProductMetaDescription } from "@/lib/seo/product-metadata";
import { applyProductTitle, buildProductTitle } from "@/lib/seo/product-title";
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

  // The stored URL segment, unchanged for every existing rug.
  const productPath = getProductRoutePath(product.cartProduct);

  if (`/shop/rugs/${resolvedParams.style}/${resolvedParams.slug}` !== productPath) {
    permanentRedirect(productPath as Route);
  }

  // The breadcrumb's middle level is the rug's Region page, named only while
  // that page is indexed (lib/seo/index-policy.ts). The schema below and the
  // visible trail read the same answer, so they cannot disagree.
  const rugLinks = await getRugPageLinks(product);

  return (
    <>
      <JsonLd
        data={productSchema({
          id: product.id,
          catalogNumber: product.catalogNumber,
          name: product.name,
          description: product.description,
          path: productPath,
          priceUsdLabel: product.priceUsdLabel,
          compareAtPriceUsdLabel: product.compareAtPriceUsdLabel,
          category: product.category,
          // Real recorded condition for schema's itemCondition, read off the
          // domain record the view model already carries; the storefront
          // category cannot answer this on its own.
          ageClass: product.cartProduct.ageClass,
          // Attributes the page already shows: wool/cotton content, the
          // imperial size label from the spec table, and the measured
          // centimetre footprint. Colour is only sent when this rug recorded
          // its own palette — `createProductPalette` falls back to a hard-coded
          // default palette otherwise, which would be fabricated colour data.
          material: product.materialLabel,
          rugTypeLabel: product.typeLabel,
          regionLabel: product.regionLabel,
          sizeLabel: product.dimensionsLabel,
          dimensionsCm: product.cartProduct.dimensionsCm,
          colorLabels:
            product.cartProduct.palette.length > 0
              ? product.palette.map((swatch) => swatch.label)
              : undefined,
          imageUrls: product.gallery.map((image) => image.src),
          availability: product.availability,
          isOneOfOne: true,
          createdAt: product.cartProduct.createdAt,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Shop", path: "/shop" },
          { name: getCategoryLabel(product.category), path: "/shop/rugs" },
          ...(rugLinks.breadcrumb
            ? [{ name: rugLinks.breadcrumb.label, path: rugLinks.breadcrumb.href }]
            : []),
          { name: product.name, path: productPath },
        ])}
      />
      <ProductOpenGraphMeta
        priceAmount={product.priceUsd}
        availability={product.availability}
      />
      <ProductDetailPageView product={product} rugLinks={rugLinks} />
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
      description: "Browse handcrafted Moroccan rugs sourced in Morocco and prepared for review-first buying.",
      path: "/shop/rugs",
    });
  }

  const ogImage = product.gallery[0];
  const title = buildProductTitle(product);
  const indexFacts = await getProductIndexFacts(product.cartProduct);

  return applyProductTitle(
    await buildManagedMetadata({
      entityType: "product",
      entityKey: product.id,
      title: title.text,
      description: buildProductMetaDescription(product),
      path: getProductRoutePath(product.cartProduct),
      noIndexFollow: !isProductIndexable(indexFacts, new Date()),
      type: "product",
      ogImageUrl: ogImage?.src,
      ogImageAlt: product.ogImageAlt,
      ogImageWidth: 1600,
      ogImageHeight: 1200,
    }),
    title,
  );
}
