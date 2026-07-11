import type { Product } from "@/types/domain";

export const productCardNameMaxLength = 60;
export const dimensionSeparator = " × ";

export type ProductCardNameInput = {
  name: string;
  type: Product["type"];
  category: Product["category"];
  rugStyle?: string;
  cardName?: string;
};

export function getProductCardName(input: ProductCardNameInput) {
  const manualCardName = input.cardName?.trim();

  if (manualCardName) {
    return limitProductTitle(manualCardName);
  }

  return getAutoProductCardName(input);
}

export function getAutoProductCardName(input: ProductCardNameInput) {
  const displayName = normalizeDimensionSeparators(getDisplayProductName(input.name));
  const titleWithoutDimensions = removeTrailingTitlePunctuation(removeProductDimensions(displayName));

  if (input.type !== "rug") {
    return limitProductTitle(titleWithoutDimensions);
  }

  if (displayName.length <= productCardNameMaxLength && displayName === titleWithoutDimensions) {
    return limitProductTitle(titleWithoutDimensions);
  }

  return limitProductTitle(createCondensedRugTitle(input, titleWithoutDimensions));
}

export function isProductCardNameAutoShortened(input: ProductCardNameInput) {
  const displayName = normalizeDimensionSeparators(getDisplayProductName(input.name));

  return getAutoProductCardName(input) !== displayName;
}

export function getDisplayProductName(name: string) {
  switch (name.trim().toLowerCase()) {
    case "beni":
      return "Beni Ourain Rug";
    case "rug maroc":
      return "Rug Maroc";
    default:
      return name;
  }
}

function createCondensedRugTitle(input: ProductCardNameInput, title: string) {
  const color = removeConstructionFromColor(getPrimaryColorFromTitle(title));
  const construction = getRugConstructionLabel(input, title);
  const feature = getRugFeatureLabel(title);

  if (color && construction && feature) {
    return `${color} ${construction} ${feature}`;
  }

  if (color && construction) {
    return `${color} ${construction}`;
  }

  return title
    .replace(/\bMixed[-\s]Technique\b/giu, "")
    .replace(/\bMoroccan\b/giu, "")
    .replace(/\bGround\b/giu, "")
    .replace(/\bScattered\b/giu, "")
    .replace(/\s+/gu, " ")
    .trim();
}

function removeProductDimensions(title: string) {
  return title
    .replace(
      /\b\d{1,3}(?:\.\d+)?["”]?\s*(?:x|×|by)\s*\d{1,3}(?:\.\d+)?["”]?\b/giu,
      " ",
    )
    .replace(/\b\d{1,2}'\s*\d{0,2}"?\s*(?:[x×-]\s*)?\d{1,2}'\s*\d{0,2}"?(?=\s|$)/gu, " ")
    .replace(
      /\b\d{1,3}(?:\.\d+)?\s*(?:x|×|by)\s*\d{1,3}(?:\.\d+)?\s*(?:cm|in|inch|inches|ft|feet)?\b/giu,
      " ",
    )
    .replace(/\b\d{1,3}(?:\.\d+)?\s*(?:cm|in|inch|inches|ft|feet)\b/giu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function limitProductTitle(title: string) {
  const normalizedTitle = title.replace(/\s+/gu, " ").trim();

  if (normalizedTitle.length <= productCardNameMaxLength) {
    return normalizedTitle;
  }

  const truncated = normalizedTitle.slice(0, productCardNameMaxLength + 1);
  const lastSpaceIndex = truncated.lastIndexOf(" ");
  const candidate =
    lastSpaceIndex > 36 ? truncated.slice(0, lastSpaceIndex) : normalizedTitle.slice(0, productCardNameMaxLength);

  return removeDanglingTitleEnding(candidate);
}

function removeDanglingTitleEnding(title: string) {
  const danglingWords = new Set(["and", "as", "at", "by", "for", "from", "in", "of", "on", "or", "the", "to", "with"]);
  const words = removeTrailingTitlePunctuation(title).trim().split(/\s+/u);

  while (words.length > 1 && danglingWords.has(words[words.length - 1].toLowerCase())) {
    words.pop();
  }

  return removeTrailingTitlePunctuation(words.join(" "));
}

function removeTrailingTitlePunctuation(title: string) {
  return title.replace(/[,\-–:;]+$/u, "").trim();
}

export function getPrimaryColorFromTitle(title: string) {
  const groundColor = title.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+Ground\b/u)?.[1];

  if (groundColor) {
    return groundColor;
  }

  const colorMatch = title.match(
    /\b(Ivory|Cream|Natural|Sand|Oat|Beige|Brown|Terracotta|Clay|Rust|Red|Black|Charcoal|Indigo|Blue|Green|Olive|Gold|Ochre|White)\b/iu,
  )?.[1];

  return colorMatch ? toTitleCase(colorMatch) : "";
}

export function removeConstructionFromColor(value: string) {
  return value
    .replace(/\b(?:Flatweave|Beni|Ourain|Kilim|Vintage|Moroccan|Rug)\b/giu, "")
    .replace(/\s+/gu, " ")
    .trim();
}

export function getRugConstructionLabel(
  product: { rugStyle?: string; category: Product["category"] },
  title: string,
) {
  if (/flat\s*weave|flatweave/iu.test(title)) {
    return "Flatweave";
  }

  if (/beni\s+ourain/iu.test(title) || /beni\s+ourain/iu.test(product.rugStyle ?? "")) {
    return "Beni Ourain Rug";
  }

  if (/kilim/iu.test(title) || /kilim/iu.test(product.rugStyle ?? "")) {
    return "Kilim Rug";
  }

  if (/vintage/iu.test(title) || product.category === "vintage") {
    return "Vintage Rug";
  }

  const styleLabel = humanizeProductToken(product.rugStyle ?? "");

  return styleLabel ? `${styleLabel} Rug` : "Moroccan Rug";
}

export function getRugFeatureLabel(title: string) {
  if (/pile\s+motifs?/iu.test(title)) {
    return "with Pile Motifs";
  }

  if (/diamond/iu.test(title)) {
    return "with Diamond Motifs";
  }

  if (/stripe|striped/iu.test(title)) {
    return "with Stripes";
  }

  if (/border/iu.test(title)) {
    return "with Border Detail";
  }

  return "";
}

export function humanizeProductToken(value: string) {
  return toTitleCase(value.replace(/[-_]+/gu, " ").trim());
}

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .replace(/\b[a-z]/gu, (character) => character.toUpperCase())
    .replace(/\bUsa\b/gu, "USA");
}

export function normalizeDimensionSeparators(value: string) {
  return value.replace(
    /(?:\d{1,3}(?:\.\d+)?(?:'\s*\d{0,2}"?|"|inches|inch|in)\s+){1,2}\d{1,3}(?:\.\d+)?(?:'\s*\d{0,2}"?|"|inches|inch|in)/giu,
    (match) => {
      const tokens =
        match.match(
          /\d{1,3}(?:\.\d+)?(?:'\s*\d{0,2}"?|"|inches|inch|in)/giu,
        ) ?? [];

      return tokens.length > 1 ? tokens.join(dimensionSeparator) : match;
    },
  );
}
