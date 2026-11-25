/**
 * Rug Type (how a rug is made) and Region (where it comes from).
 *
 * Type is a fixed list; Region is a managed table (RugRegion). They are the
 * only source for the Type and Region shown to shoppers, and for the shop's
 * Type and Region pages and filters. The legacy rugStyle column now only
 * stores each rug's URL segment (see deriveRugUrlSegment).
 */

export const rugTypeOptions = [
  {
    value: "flatweave",
    label: "Flatweave (Hanbel)",
    slug: "flatweave-hanbel",
    construction: "Handwoven flatweave (hanbel)",
  },
  {
    value: "pile",
    label: "Pile (hand-knotted)",
    slug: "pile",
    construction: "Hand-knotted pile",
  },
  {
    value: "mixed",
    label: "Mixed technique",
    slug: "mixed-technique",
    construction: "Handwoven flatweave with raised hand-knotted motifs",
  },
  {
    value: "boucherouite",
    label: "Boucherouite",
    slug: "boucherouite",
    construction: "Handmade from discarded fabrics",
  },
] as const;

export type RugType = (typeof rugTypeOptions)[number]["value"];

export const pileHeightOptions = [
  { value: "medium", label: "Medium pile" },
  { value: "high", label: "High pile" },
] as const;

export type PileHeight = (typeof pileHeightOptions)[number]["value"];

export type RugRegionSummary = {
  id: string;
  name: string;
  slug: string;
  parent?: { id: string; name: string; slug: string };
};

export function isRugType(value: string | null | undefined): value is RugType {
  return rugTypeOptions.some((option) => option.value === value);
}

export function isPileHeight(value: string | null | undefined): value is PileHeight {
  return pileHeightOptions.some((option) => option.value === value);
}

export function getRugTypeOption(value: RugType) {
  return rugTypeOptions.find((option) => option.value === value)!;
}

/** "Pile (hand-knotted), high pile" / "Flatweave (Hanbel)". */
export function formatRugTypeLabel(rugType: RugType, pileHeight?: PileHeight) {
  const label = getRugTypeOption(rugType).label;

  return rugType === "pile" && pileHeight ? `${label}, ${pileHeight} pile` : label;
}

/** "Hand-knotted pile, high pile" / "Handwoven flatweave (hanbel)". */
export function formatRugConstructionLine(rugType: RugType, pileHeight?: PileHeight) {
  const construction = getRugTypeOption(rugType).construction;

  return rugType === "pile" && pileHeight ? `${construction}, ${pileHeight} pile` : construction;
}

/** "Tiflet, Zemmour" for a region with a parent; the name alone otherwise. */
export function formatRegionLabel(region: RugRegionSummary) {
  return region.parent ? `${region.name}, ${region.parent.name}` : region.name;
}

const hiddenLegacyValues = new Set(["unclassified", "not stated"]);

/** True for an empty rugStyle or the "Unclassified" placeholder. */
export function isUnclassifiedRugStyle(rugStyle: string | null | undefined) {
  const style = (rugStyle ?? "").trim().toLowerCase();

  return !style || style === "unclassified";
}

/**
 * Legacy text cleaned for buyers: "-type" / "-style" qualifiers stripped
 * ("Azilal-type" → "Azilal"), and "Unclassified" / "Not Stated" never shown.
 */
export function cleanLegacyAttributionText(value: string | null | undefined) {
  const cleaned = (value ?? "")
    .replace(/(\p{L})[-‐–\s](?:type|style)\b/giu, "$1")
    .replace(/\s+/gu, " ")
    .trim();

  return cleaned && !hiddenLegacyValues.has(cleaned.toLowerCase()) ? cleaned : undefined;
}

/**
 * The URL segment a rug lives under, /shop/rugs/<segment>/<slug>. It is stored
 * in the legacy rugStyle column so every existing rug keeps its URL; only rugs
 * that have never been live get this new path: their Region, or their Type
 * while no Region is set.
 */
export function deriveRugUrlSegment(rugType: RugType | undefined, region: RugRegionSummary | undefined) {
  return region?.slug ?? (rugType ? getRugTypeOption(rugType).slug : "unclassified");
}

export type RugTaxonomyDisplay = {
  /** "Pile (hand-knotted), high pile"; undefined when Type is not set. */
  typeLabel?: string;
  /** "Tiflet, Zemmour"; undefined when Region is not set. */
  regionLabel?: string;
  /** Construction line for the product page; undefined when Type is not set (no guessed claim). */
  construction?: string;
};

/**
 * Buyer-facing Type / Region / Construction for a rug, from the Type and
 * Region fields only. An unset field stays undefined so its row is hidden:
 * the legacy rugStyle / attributionRegion are never shown in their place.
 */
export function getRugTaxonomyDisplay(rug: {
  rugType?: RugType;
  pileHeight?: PileHeight;
  region?: RugRegionSummary;
}): RugTaxonomyDisplay {
  return {
    typeLabel: rug.rugType ? formatRugTypeLabel(rug.rugType, rug.pileHeight) : undefined,
    regionLabel: rug.region ? formatRegionLabel(rug.region) : undefined,
    construction: rug.rugType ? formatRugConstructionLine(rug.rugType, rug.pileHeight) : undefined,
  };
}
