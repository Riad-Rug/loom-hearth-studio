/**
 * Rug Type (how a rug is made) and Region (where it comes from).
 *
 * Type is a fixed list; Region is a managed table (RugRegion). Both supersede
 * the legacy rugStyle / attributionRegion fields for display. Those legacy
 * fields stay in the data: rugStyle still decides legacy product URLs, and
 * both are the display fallback until a rug has been sorted in the admin.
 */

export const rugTypeOptions = [
  {
    value: "flatweave",
    label: "Flatweave (Hanbel)",
    slug: "flatweave-hanbel",
    construction: "Handwoven flatweave (hanbel)",
    legacyRugStyle: "Flatweave (Hanbel)",
  },
  {
    value: "pile",
    label: "Pile (hand-knotted)",
    slug: "pile",
    construction: "Hand-knotted pile",
    legacyRugStyle: undefined,
  },
  {
    value: "mixed",
    label: "Mixed technique",
    slug: "mixed-technique",
    construction: "Handwoven flatweave with raised hand-knotted motifs",
    legacyRugStyle: "Mixed technique",
  },
  {
    value: "boucherouite",
    label: "Boucherouite",
    slug: "boucherouite",
    construction: "Handmade from discarded fabrics",
    legacyRugStyle: "Boucherouite",
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

/** The legacy rugStyle that maps one-to-one onto a Type, if any. */
export function getRugTypeFromLegacyStyle(rugStyle: string | null | undefined): RugType | undefined {
  const style = rugStyle?.trim().toLowerCase();

  return rugTypeOptions.find((option) => option.legacyRugStyle?.toLowerCase() === style)?.value;
}

// Legacy style collections a region maps onto (Tiflet and Khemisset sit under
// Zemmour). Only used to pick a working legacy URL segment for new rugs.
const legacyStyleByRegionSlug: Record<string, string> = {
  azilal: "Azilal",
  "beni-ourain": "Beni Ourain",
  "beni-m-guild": "Beni M'Guild",
  boujad: "Boujad",
  zemmour: "Zemmour",
};

/**
 * New rugs no longer pick a rugStyle in the admin, but rugStyle still decides
 * their /shop/rugs/<style>/<slug> URL until per-type URLs land. Derive it from
 * the Type when the Type has its own collection, else from the Region: its
 * collection when it has one, else the top-level region's name (Glaoui under
 * Taznakht files as "Taznakht"; Middle Atlas as "Middle Atlas"). Only a rug
 * with neither falls back to "Unclassified".
 */
export function deriveLegacyRugStyle(rugType: RugType | undefined, region: RugRegionSummary | undefined) {
  if (rugType) {
    const fromType = getRugTypeOption(rugType).legacyRugStyle;

    if (fromType) {
      return fromType;
    }
  }

  const regionStyle =
    (region && legacyStyleByRegionSlug[region.slug]) ||
    (region?.parent && legacyStyleByRegionSlug[region.parent.slug]);

  return regionStyle || region?.parent?.name || region?.name || "Unclassified";
}

export type RugTaxonomyDisplay = {
  /** "Pile (hand-knotted), high pile"; legacy style text as fallback; undefined when nothing showable. */
  typeLabel?: string;
  /** "Tiflet, Zemmour"; cleaned legacy attributionRegion as fallback. */
  regionLabel?: string;
  /** Construction line for the product page; undefined when the type is unknown (no guessed claim). */
  construction?: string;
  /** True only when the new fields are set (feeds and JSON-LD use only these). */
  hasType: boolean;
  hasRegion: boolean;
};

/**
 * Buyer-facing Type / Region / Construction for a rug. New fields win; until
 * a rug is sorted, fall back to the legacy fields with "-type" qualifiers
 * stripped and "Unclassified" / "Not Stated" never shown.
 */
export function getRugTaxonomyDisplay(rug: {
  rugType?: RugType;
  pileHeight?: PileHeight;
  region?: RugRegionSummary;
  rugStyle?: string;
  attributionRegion?: string;
}): RugTaxonomyDisplay {
  const legacyType = getRugTypeFromLegacyStyle(rug.rugStyle);

  return {
    typeLabel: rug.rugType
      ? formatRugTypeLabel(rug.rugType, rug.pileHeight)
      : cleanLegacyAttributionText(rug.rugStyle),
    regionLabel: rug.region ? formatRegionLabel(rug.region) : cleanLegacyAttributionText(rug.attributionRegion),
    construction: rug.rugType
      ? formatRugConstructionLine(rug.rugType, rug.pileHeight)
      : legacyType
        ? formatRugConstructionLine(legacyType)
        : undefined,
    hasType: Boolean(rug.rugType),
    hasRegion: Boolean(rug.region),
  };
}
