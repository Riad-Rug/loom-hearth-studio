import type { Metadata } from "next";
import type { Route } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { JsonLd } from "@/components/seo/json-ld";
import {
  getCategoryProductDetailByParams,
  getProductRedirectPathForSlug,
} from "@/lib/catalog/service";
import { getCategoryLabel } from "@/lib/catalog/helpers";
import { ProductDetailPageView } from "@/features/pdp/product-detail-page-view";
import { buildManagedMetadata, buildMetadata } from "@/lib/seo/metadata";
import { buildProductMetaDescription } from "@/lib/seo/product-metadata";
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
    // A slug the product used before, or the right slug under the wrong category,
    // 301s to the current URL. Only a slug nobody has ever used is a 404.
    const redirectPath = await getProductRedirectPathForSlug({ slug: resolvedParams.slug });
    const requestedPath = `/shop/${resolvedParams.category}/${resolvedParams.slug}`;

    if (redirectPath && redirectPath !== requestedPath) {
      permanentRedirect(redirectPath as Route);
    }

    notFound();
  }

  const productPath = getCategoryProductPath(product);

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
          // Real recorded condition for schema's itemCondition, read off the
          // domain record the view model already carries; the storefront
          // category cannot answer this (a pillow cover cut from vintage
          // Battania is still a new cover).
          ageClass: product.cartProduct.ageClass,
          // Attributes the page already shows. The size label only exists on
          // rugs (a pouf's size lives in its variants), while the centimetre
          // footprint comes off the domain record so both product types can
          // supply it when it was measured.
          material: product.materialLabel,
          sizeLabel: product.type === "rug" ? product.dimensionsLabel : undefined,
          dimensionsCm: product.cartProduct.dimensionsCm,
          // Colour is only sent when the piece carries its own recorded palette.
          // `createProductPalette` substitutes a hard-coded default palette for
          // every multi-unit piece and for any rug that recorded none, so
          // passing the view model's palette unconditionally would claim the
          // same five colours for most of the catalog.
          colorLabels:
            product.type === "rug" && product.cartProduct.palette.length > 0
              ? product.palette.map((swatch) => swatch.label)
              : undefined,
          imageUrls: product.gallery.map((image) => image.src),
          availability:
            product.status === "sold" ||
            (product.type === "multiUnit" && product.inventoryState === "outOfStock")
              ? "outOfStock"
              : "inStock",
          isOneOfOne: product.category === "vintage",
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Shop", path: "/shop" },
          {
            name: getCategoryLabel(product.category),
            path: `/shop/${product.category}`,
          },
          { name: product.name, path: productPath },
        ])}
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

  const ogImage = product.gallery[0];

  return buildManagedMetadata({
    entityType: "product",
    entityKey: product.id,
    title: product.seoTitle || product.name,
    description: buildProductMetaDescription(product),
    path: getCategoryProductPath(product),
    type: "product",
    ogImageUrl: ogImage?.src,
    ogImageAlt: ogImage?.altText || product.name,
    ogImageWidth: 1600,
    ogImageHeight: 1200,
    product: {
      priceAmount: product.priceUsd,
      availability:
        product.status === "sold" ||
        (product.type === "multiUnit" && product.inventoryState === "outOfStock")
          ? "oos"
          : "instock",
    },
  });
}

function getCategoryProductPath(product: { category: string; slug: string }) {
  return `/shop/${product.category}/${product.slug}`;
}
