import type { MediaAsset } from "@/types/domain";

/**
 * Auto-filled or camera-default alt text that describes nothing:
 * "Azilal rug image 1", "Product image 3", "IMG_2041", "DSC 0042".
 */
export function isPlaceholderAltText(altText: string) {
  const alt = altText.trim();

  return (
    !alt ||
    /\bimage\s*\d+$/iu.test(alt) ||
    /^(?:img|dsc|dscn|pxl|photo|image|screenshot)[\s_-]*\d/iu.test(alt) ||
    /^[\w-]+\.(?:jpe?g|png|webp|heic|avif)$/iu.test(alt)
  );
}

const roleDescriptions: Partial<Record<MediaAsset["role"], string>> = {
  hero: "full view",
  styled: "styled in a room",
  detail: "close-up detail",
  edge: "edge detail",
  back: "reverse side",
  scale: "shown for scale",
  motif: "motif close-up",
};

/** Upload default: "<name>, full view". Still flagged in the admin until rewritten. */
export function describeImageRole(productName: string, role: MediaAsset["role"]) {
  const description = roleDescriptions[role];
  const name = productName.trim() || "Product";

  return description ? `${name}, ${description}` : `${name}, photo`;
}
