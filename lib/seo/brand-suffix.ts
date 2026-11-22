import { siteConfig } from "@/config/site";

/**
 * Words an admin may append to the brand name when hand-typing a `seoTitle`.
 * The legal/marketing name of the business is "Loom & Hearth Studio" (see the
 * domain) while `siteConfig.name` — and therefore the root title template — is
 * the shorter "Loom & Hearth", so both spellings show up in admin-entered
 * titles and both have to be recognised as a brand suffix.
 */
const brandSuffixQualifiers = ["studio"];

const brandSuffixPattern = buildBrandSuffixPattern();

/** The title with every trailing brand suffix removed, trimmed. */
export function stripBrandSuffix(value: string) {
  let next = value.trim();

  while (brandSuffixPattern.test(next)) {
    next = next.replace(brandSuffixPattern, "").trim();
  }

  return next;
}

/**
 * Matches a trailing `<separator> <brand>` suffix, tolerating the ways a human
 * actually types the brand: any casing, loose spacing, "and" for "&", and an
 * optional trailing qualifier such as "Studio".
 *
 * Deliberately anchored with `$` so a product name that merely CONTAINS the
 * brand mid-string is never truncated.
 */
function buildBrandSuffixPattern() {
  const brandCore = escapeRegExp(siteConfig.name)
    .replace(/\s+/gu, "\\s+")
    .replace(/&/gu, "(?:&|and)");
  const qualifier = `(?:\\s+(?:${brandSuffixQualifiers.join("|")}))?`;

  return new RegExp(`\\s*(?:[|\\-–—:]\\s*)${brandCore}${qualifier}\\s*$`, "iu");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}
