export const SEO_TITLE_MIN_LENGTH = 45;
export const SEO_TITLE_MAX_LENGTH = 65;
export const META_DESCRIPTION_MIN_LENGTH = 120;
export const META_DESCRIPTION_MAX_LENGTH = 160;
export const DESCRIPTIVE_IMAGE_ALT_MIN_LENGTH = 24;

export function isSeoTitleReady(value: string) {
  const length = value.trim().length;

  return length >= SEO_TITLE_MIN_LENGTH && length <= SEO_TITLE_MAX_LENGTH;
}

export function isMetaDescriptionReady(value: string) {
  const length = value.trim().length;

  return length >= META_DESCRIPTION_MIN_LENGTH && length <= META_DESCRIPTION_MAX_LENGTH;
}

export function isImageAltReady(value: string) {
  return value.trim().length >= DESCRIPTIVE_IMAGE_ALT_MIN_LENGTH;
}

/** Lowercase letters and digits only, with accents dropped, so "Aït" and "Ait" compare equal. */
export function normalizeSeoText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

export type ProductCopyField = "description" | "seoDescription";

export type DuplicateProductCopy = {
  productId: string;
  field: ProductCopyField;
  /** Every other product carrying the same text, so the fix can start on either side. */
  sharedWith: string[];
};

/**
 * Products whose description or SEO description reads the same as another
 * product's once case, punctuation and spacing are set aside. Two one-of-a-kind
 * pieces with one text look like one page to a search engine.
 */
export function findDuplicateProductCopy(
  products: ReadonlyArray<{ id: string } & Record<ProductCopyField, string>>,
): DuplicateProductCopy[] {
  return (["description", "seoDescription"] as const).flatMap((field) => {
    const productIdsByText = new Map<string, string[]>();

    for (const product of products) {
      const text = normalizeSeoText(product[field]);

      if (text) {
        productIdsByText.set(text, [...(productIdsByText.get(text) ?? []), product.id]);
      }
    }

    return [...productIdsByText.values()]
      .filter((productIds) => productIds.length > 1)
      .flatMap((productIds) =>
        productIds.map((productId) => ({
          productId,
          field,
          sharedWith: productIds.filter((otherId) => otherId !== productId),
        })),
      );
  });
}

/** The same comparison as findDuplicateProductCopy, for one value against the rest. */
export function isDuplicateProductCopy(value: string, otherValues: readonly string[]) {
  const text = normalizeSeoText(value);

  return Boolean(text) && otherValues.some((otherValue) => normalizeSeoText(otherValue) === text);
}

export function isSeoTitleAlignedWithHeading(heading: string, seoTitle: string) {
  const normalizedHeading = normalizeSeoText(heading);
  const normalizedSeoTitle = normalizeSeoText(seoTitle);

  if (!normalizedHeading || !normalizedSeoTitle) {
    return false;
  }

  return (
    normalizedSeoTitle.includes(normalizedHeading) ||
    normalizedHeading.includes(normalizedSeoTitle)
  );
}
