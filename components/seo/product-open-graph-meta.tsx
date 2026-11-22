import { siteConfig } from "@/config/site";
import type { ProductAvailability } from "@/lib/catalog/availability";

type ProductOpenGraphMetaProps = {
  priceAmount: number;
  priceCurrency?: string;
  availability: ProductAvailability;
};

const openGraphAvailability: Record<ProductAvailability, "instock" | "oos"> = {
  available: "instock",
  reserved: "oos",
  sold: "oos",
  outOfStock: "oos",
};

/**
 * Pinterest reads `og:type=product` plus the `product:*` price tags and
 * `og:availability` to turn a saved pin into a Product Rich Pin that shows live
 * price and stock (https://developers.pinterest.com/docs/web-features/rich-pins-overview/).
 * Open Graph tags are read from `property`, which Next's `metadata.other`
 * cannot emit, so product pages render them as meta elements that React hoists
 * into the document head.
 */
export function ProductOpenGraphMeta({
  priceAmount,
  priceCurrency = siteConfig.currency,
  availability,
}: ProductOpenGraphMetaProps) {
  return (
    <>
      <meta property="og:type" content="product" />
      {Number.isFinite(priceAmount) ? (
        <>
          <meta property="product:price:amount" content={priceAmount.toFixed(2)} />
          <meta property="product:price:currency" content={priceCurrency} />
          <meta property="og:availability" content={openGraphAvailability[availability]} />
        </>
      ) : null}
    </>
  );
}
