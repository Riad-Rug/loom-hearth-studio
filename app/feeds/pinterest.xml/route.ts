import { siteConfig } from "@/config/site";
import { getProductRoutePath, isPurchasableProduct } from "@/lib/catalog/helpers";
import { buildCloudinaryUrl } from "@/lib/cloudinary/url";
import { createProductRepository } from "@/lib/db/repositories/product-repository";
import { absoluteUrl } from "@/lib/seo/metadata";
import type { Product } from "@/types/domain";

/**
 * Pinterest Catalogs product feed (RSS 2.0 + Google Merchant `g:` namespace),
 * the format Pinterest ingests to turn every SKU into a shoppable Product Pin
 * and keep price/stock in sync automatically.
 *
 * Register once in Pinterest → Business → Catalogs with this URL:
 *   https://www.loomandhearthstudio.com/feeds/pinterest.xml
 *
 * Sold pieces stay in the feed as `out of stock` (rather than vanishing) so
 * Pinterest marks existing pins sold instead of treating them as broken.
 * Field reference: https://help.pinterest.com/en/business/article/before-you-get-started-with-catalogs
 */

// Always read live catalog rows; the Cache-Control header below lets Vercel's
// edge serve the XML for an hour between regenerations.
export const dynamic = "force-dynamic";

const feedImageWidth = 1600;
const maxAdditionalImages = 9;

function escapeXml(value: string) {
  return value
    .replace(/&/gu, "&amp;")
    .replace(/</gu, "&lt;")
    .replace(/>/gu, "&gt;")
    .replace(/"/gu, "&quot;")
    .replace(/'/gu, "&apos;");
}

function buildFeedImageUrl(publicId: string) {
  return buildCloudinaryUrl(publicId, {
    transformation: { c: "limit", w: feedImageWidth, q: "auto", f: "jpg" },
  });
}

function getAvailability(product: Product) {
  return isPurchasableProduct(product) ? "in stock" : "out of stock";
}

function getCondition(product: Product) {
  return product.category === "vintage" ? "used" : "new";
}

function getProductType(product: Product) {
  const categoryLabels: Record<Product["category"], string> = {
    rugs: "Rugs",
    vintage: "Vintage Rugs",
    poufs: "Poufs",
    pillows: "Pillows",
    decor: "Decor",
  };

  const base = `Home > ${categoryLabels[product.category]}`;

  return product.type === "rug" && product.rugStyle
    ? `${base} > ${product.rugStyle}`
    : base;
}

function getGoogleProductCategory(product: Product) {
  // Google taxonomy ids Pinterest maps onto its own shopping categories.
  switch (product.category) {
    case "rugs":
    case "vintage":
      return "Home & Garden > Decor > Rugs";
    case "poufs":
      return "Furniture > Ottomans";
    case "pillows":
      return "Home & Garden > Decor > Throw Pillows";
    default:
      return "Home & Garden > Decor";
  }
}

function trimDescription(value: string) {
  const plain = value.replace(/\s+/gu, " ").trim();

  return plain.length > 4900 ? `${plain.slice(0, 4897)}...` : plain;
}

function buildItem(product: Product) {
  const images = [...product.images]
    .filter((image) => image.mediaType === "image")
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const [primaryImage, ...additionalImages] = images;

  if (!primaryImage) {
    return null;
  }

  const link = absoluteUrl(getProductRoutePath(product));
  const lines = [
    `<g:id>${escapeXml(product.catalogNumber || product.id)}</g:id>`,
    `<title>${escapeXml(product.name)}</title>`,
    `<description>${escapeXml(trimDescription(product.description))}</description>`,
    `<link>${escapeXml(link)}</link>`,
    `<g:image_link>${escapeXml(buildFeedImageUrl(primaryImage.publicId))}</g:image_link>`,
    ...additionalImages
      .slice(0, maxAdditionalImages)
      .map(
        (image) =>
          `<g:additional_image_link>${escapeXml(buildFeedImageUrl(image.publicId))}</g:additional_image_link>`,
      ),
    `<g:price>${product.priceUsd.toFixed(2)} ${siteConfig.currency}</g:price>`,
    `<g:availability>${getAvailability(product)}</g:availability>`,
    `<g:condition>${getCondition(product)}</g:condition>`,
    `<g:brand>${escapeXml("Loom & Hearth Studio")}</g:brand>`,
    `<g:product_type>${escapeXml(getProductType(product))}</g:product_type>`,
    `<g:google_product_category>${escapeXml(getGoogleProductCategory(product))}</g:google_product_category>`,
    `<g:identifier_exists>no</g:identifier_exists>`,
  ];

  if (product.weightKg) {
    lines.push(`<g:shipping_weight>${product.weightKg} kg</g:shipping_weight>`);
  }

  if (product.dimensionsCm) {
    lines.push(
      `<g:product_length>${product.dimensionsCm.length} cm</g:product_length>`,
      `<g:product_width>${product.dimensionsCm.width} cm</g:product_width>`,
    );
  }

  return `<item>${lines.join("")}</item>`;
}

export async function GET() {
  const products = await createProductRepository().listAll();
  const items = products
    .map(buildItem)
    .filter((item: string | null): item is string => Boolean(item));

  const body = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">`,
    `<channel>`,
    `<title>${escapeXml(siteConfig.name)}</title>`,
    `<link>${escapeXml(absoluteUrl("/"))}</link>`,
    `<description>${escapeXml(siteConfig.description)}</description>`,
    ...items,
    `</channel>`,
    `</rss>`,
  ].join("\n");

  return new Response(body, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
