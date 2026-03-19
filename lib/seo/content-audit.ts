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

export function normalizeSeoText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
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
