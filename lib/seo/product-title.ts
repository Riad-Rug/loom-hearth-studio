import type { Metadata } from "next";

import { siteConfig } from "@/config/site";
import { normalizeDimensionSeparators, parseProductTitle } from "@/lib/catalog/product-card-name";
import { stripBrandSuffix } from "@/lib/seo/brand-suffix";
import { SEO_TITLE_MAX_LENGTH } from "@/lib/seo/content-audit";

/** Where Google starts cutting a title in results, give or take a wide letter. */
export const productTitleBudget = 60;

/** The root layout's `%s | Loom & Hearth` template, as it lands after a title. */
const brandSuffix = ` | ${siteConfig.name}`;
const partSeparator = " — ";

/**
 * `templated: false` means the text already spends the budget, so the page must
 * opt out of the root layout's brand template with `title.absolute`.
 */
export type ProductTitle = { text: string; templated: boolean };

/**
 * The admin form requires an SEO title, so owners paste the product name into it
 * and nearly every stored `seoTitle` is the name verbatim. Only a title that says
 * something the name does not counts as written for search, and that one always
 * wins. Otherwise the title is rebuilt from the name's parts, keyword first
 * ("Flatweave Wool Pouf"), then the colour and motif that tell one-of-a-kind
 * pieces apart, then the size. The brand suffix goes first when space runs out,
 * because two pieces that differ only by colour must not share a title.
 */
export function buildProductTitle(product: { name: string; seoTitle: string }): ProductTitle {
  const seoTitle = collapseWhitespace(product.seoTitle);

  if (seoTitle && comparableTitle(seoTitle) !== comparableTitle(product.name)) {
    return { text: seoTitle, templated: true };
  }

  const { keyword, detail, size } = splitProductName(product.name);
  const full = joinTitleParts(keyword, detail, size);
  // The keyword plus whichever part tells this piece from its siblings. A size
  // only gives way to a colour, never to the brand.
  const distinguishing = joinTitleParts(keyword, detail || size);

  for (const text of new Set([full, distinguishing])) {
    if (text.length + brandSuffix.length <= productTitleBudget) {
      return { text, templated: true };
    }

    if (text.length <= productTitleBudget) {
      return { text, templated: false };
    }
  }

  // A few characters over 60 still beats a title shared with another piece.
  if (distinguishing.length <= SEO_TITLE_MAX_LENGTH) {
    return { text: distinguishing, templated: false };
  }

  // Past that the size goes, since a size cut in half would misstate the piece.
  return { text: truncateTitle(joinTitleParts(keyword, detail), productTitleBudget), templated: false };
}

/**
 * `buildManagedMetadata` returns the title as a plain string, which the root
 * layout's template extends. A title the admin SEO screen set for this product
 * arrives as a different string and keeps the template; only the title built
 * here can need `absolute`.
 */
export function applyProductTitle(metadata: Metadata, title: ProductTitle): Metadata {
  if (title.templated || metadata.title !== title.text) {
    return metadata;
  }

  return { ...metadata, title: { absolute: title.text } };
}

/**
 * Product names follow "Type — size — colour and motif", e.g.
 * "Flatweave Wool Pouf — 24″ × 24″ × 10″ — Cream Stripe & Fuchsia Geometric".
 * The size is found the same way the product page splits it onto its own line.
 */
function splitProductName(name: string) {
  const normalizedName = collapseWhitespace(normalizeDimensionSeparators(name));
  const { size } = parseProductTitle(normalizedName);
  const sizeIndex = size ? normalizedName.indexOf(size) : -1;

  if (!size || sizeIndex === -1) {
    return { keyword: normalizedName, detail: "", size: "" };
  }

  const before = normalizedName.slice(0, sizeIndex).replace(/[\s,:;(–—-]+$/u, "");
  const after = normalizedName.slice(sizeIndex + size.length).replace(/^[\s,:;)–—-]+/u, "");

  return before ? { keyword: before, detail: after, size } : { keyword: after, detail: "", size };
}

function joinTitleParts(...parts: string[]) {
  return parts.filter(Boolean).join(partSeparator);
}

function truncateTitle(value: string, maxLength: number) {
  const cut = value.slice(0, maxLength + 1);
  const lastSpace = cut.lastIndexOf(" ");

  return (lastSpace > 0 ? cut.slice(0, lastSpace) : value.slice(0, maxLength)).replace(
    /[\s,;:&×–—-]+$/u,
    "",
  );
}

/**
 * A pasted name with the brand on the end, or with straight quotes where the
 * name has primes or curly ones, is still the name.
 */
function comparableTitle(value: string) {
  const straightQuotes = stripBrandSuffix(value).replace(/[″“”„]/gu, '"').replace(/[′‘’‚]/gu, "'");

  return collapseWhitespace(normalizeDimensionSeparators(straightQuotes)).toLowerCase();
}

function collapseWhitespace(value: string) {
  return value.replace(/\s+/gu, " ").trim();
}
