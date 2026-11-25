import type { CatalogProductCardViewModel } from "@/lib/catalog/contracts";
import type { ProductCategory } from "@/types/domain";

export type CatalogSearchSuggestion = {
  id: string;
  href: string;
  name: string;
  dimensionsLabel?: string;
  priceUsdLabel: string;
  imageSrc: string | null;
  imageAlt: string;
};

/**
 * Catalog search. One scorer serves both the header suggestions and the /shop?q=
 * grid. A query is split into words, every meaningful word must match somewhere
 * in the product's searchable text (directly, as a plural, or through the synonym
 * table), and results come back best score first.
 */

/**
 * Words a shopper treats as the same thing. Grouped data, not branching: add a
 * row to teach the search a new equivalence. Terms are single words; phrases such
 * as "flat weave" are joined by `normalizeText` before tokenising. Groups follow
 * the shop's own vocabulary: rug-style names (rug-style-collections.ts, where
 * hanbel is the Moroccan flatweave), card-name colours (getPrimaryColorFromTitle),
 * and the pillow and pouf categories.
 */
const synonymGroups: readonly (readonly string[])[] = [
  ["kilim", "kelim", "flatweave", "hanbel"],
  ["rug", "carpet"],
  ["runner", "hallway"],
  ["pillow", "cushion"],
  ["pouf", "pouffe", "ottoman", "footstool"],
  ["vintage", "antique"],
  ["boucherouite", "boucherouette", "rag"],
  ["ourain", "ouarain"],
  ["cactus", "sabra"],
  ["gray", "grey", "charcoal"],
  ["blue", "indigo"],
  ["green", "olive"],
  ["cream", "ivory", "white"],
  ["beige", "sand", "oat"],
  ["terracotta", "clay", "rust"],
  ["gold", "ochre"],
];

/**
 * Words that describe the whole shop rather than a product. Dropped from a
 * query unless nothing else is left, so "moroccan handmade rug" is just "rug".
 */
const ignoredWords: ReadonlySet<string> = new Set([
  "a",
  "an",
  "and",
  "for",
  "handmade",
  "in",
  "moroccan",
  "of",
  "the",
  "with",
]);

/**
 * Words each category answers to, so "rug" does not exclude a product in a rug
 * category whose own text never says the word.
 */
const categoryAliases: Record<ProductCategory, string> = {
  rugs: "rug carpet",
  vintage: "vintage antique rug carpet",
  pillows: "pillow cushion cover",
  poufs: "pouf ottoman",
  decor: "decor antique",
};

// A size written as 16″ × 16″, 16 x 16, 5' x 8' or 16x16 becomes one token ("16x16")
// on both the query and the indexed text. Apostrophes are already gone by this
// point; inch marks and unit words around the "x" are dropped.
// The lookahead also accepts the end of the text so "16 x" typed so far still
// prefix-matches "16x16".
const sizeUnit = String.raw`(?:ft|feet|foot|inch|inches|in)\b`;
const sizeMark = String.raw`(?:\s*(?:["\u2033\u201d\u2032]+|${sizeUnit}))?`;
const sizeTrailingUnit = new RegExp(String.raw`((?:\d+(?:\.\d+)?x)+\d+(?:\.\d+)?)\s*${sizeUnit}`, "gu");
const sizeJoin = new RegExp(String.raw`(\d+(?:\.\d+)?)${sizeMark}\s*(?:[x\u00d7]|by)\s*(?=\d|$)`, "gu");

const phraseJoins: readonly (readonly [RegExp, string])[] = [
  [/flat\s+weave/gu, "flatweave"],
  [sizeJoin, "$1x"],
  [sizeTrailingUnit, "$1"],
];

// Weights say where a hit counts for most. A word in the title or category beats
// the same word in a paragraph of description.
const searchFields: readonly {
  weight: number;
  read: (product: SearchableProduct) => string | undefined;
}[] = [
  { weight: 10, read: (product) => `${product.name} ${product.displayName}` },
  { weight: 7, read: (product) => categoryAliases[product.category] },
  { weight: 6, read: (product) => product.rugFacetText },
  { weight: 5, read: (product) => product.subtitle },
  { weight: 4, read: (product) => product.palette?.map((color) => color.label).join(" ") },
  { weight: 3, read: (product) => product.materialLabel },
  { weight: 3, read: (product) => product.description },
  { weight: 2, read: (product) => product.badge },
  { weight: 1, read: (product) => product.dimensionsLabel },
];

// Fields the card does not carry today. Read when a caller supplies them, so
// the scorer improves as the card view model grows without another change here.
export type SearchableProduct = CatalogProductCardViewModel &
  Partial<{
    materialLabel: string;
    palette: ReadonlyArray<{ label: string }>;
  }>;

const SYNONYM_WEIGHT = 0.7;
const PREFIX_WEIGHT = 0.5;
const PHRASE_BONUS = 25;
const MIN_PREFIX_LENGTH = 3;

function normalizeText(value: string): string {
  let text = value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/['\u2019]/gu, "");

  for (const [pattern, replacement] of phraseJoins) {
    text = text.replace(pattern, replacement);
  }

  return text;
}

function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
    .map(stem);
}

// Plurals only: pillows, kilims, ottomans, poufs, patches, and berries.
function stem(token: string): string {
  if (token.length > 4 && token.endsWith("ies")) {
    return `${token.slice(0, -3)}y`;
  }

  if (token.length > 4 && /(?:ches|shes|xes|sses)$/u.test(token)) {
    return token.slice(0, -2);
  }

  if (token.length > 3 && token.endsWith("s") && !token.endsWith("ss")) {
    return token.slice(0, -1);
  }

  return token;
}

const synonymsByToken: ReadonlyMap<string, readonly string[]> = new Map(
  synonymGroups.flatMap((group) => {
    const stems = group.map(stem);

    return stems.map((term) => [term, stems.filter((other) => other !== term)] as const);
  }),
);

type QueryWord = {
  word: string;
  alternatives: readonly string[];
  isLast: boolean;
};

export type ParsedSearchQuery = {
  words: QueryWord[];
  phrase: string;
};

export function parseSearchQuery(query: string): ParsedSearchQuery {
  const tokens = tokenize(query);
  const meaningful = tokens.filter((token) => !ignoredWords.has(token));
  const words = (meaningful.length ? meaningful : tokens).map((word, index, all) => ({
    word,
    alternatives: synonymsByToken.get(word) ?? [],
    isLast: index === all.length - 1,
  }));

  return { words, phrase: words.map((entry) => entry.word).join(" ") };
}

type IndexedField = { weight: number; tokens: ReadonlySet<string>; text: string };

function indexProduct(product: SearchableProduct): IndexedField[] {
  return searchFields.flatMap(({ weight, read }) => {
    const value = read(product);

    if (!value) {
      return [];
    }

    const tokens = tokenize(value);

    return [{ weight, tokens: new Set(tokens), text: tokens.join(" ") }];
  });
}

function scoreWord(word: QueryWord, fields: readonly IndexedField[]): number {
  let best = 0;

  for (const field of fields) {
    if (field.tokens.has(word.word)) {
      best = Math.max(best, field.weight);
      continue;
    }

    if (word.alternatives.some((alternative) => field.tokens.has(alternative))) {
      best = Math.max(best, field.weight * SYNONYM_WEIGHT);
      continue;
    }

    // Someone is still typing the last word: "kil" should already find kilims.
    if (
      word.isLast &&
      word.word.length >= MIN_PREFIX_LENGTH &&
      [...field.tokens].some((token) => token.startsWith(word.word))
    ) {
      best = Math.max(best, field.weight * PREFIX_WEIGHT);
    }
  }

  return best;
}

/** 0 when any meaningful word has no match anywhere on the product. */
export function getProductSearchScore(
  product: SearchableProduct,
  query: ParsedSearchQuery,
): number {
  if (!query.words.length) {
    return 0;
  }

  const fields = indexProduct(product);
  let score = 0;

  for (const word of query.words) {
    const wordScore = scoreWord(word, fields);

    if (wordScore === 0) {
      return 0;
    }

    score += wordScore;
  }

  if (query.words.length > 1 && fields[0]?.text.includes(query.phrase)) {
    score += PHRASE_BONUS;
  }

  return score;
}

/** Matching products, best score first. Equal scores keep the input order. */
export function searchCatalogProducts<T extends SearchableProduct>(
  products: readonly T[],
  query: string,
): T[] {
  const parsed = parseSearchQuery(query);

  return products
    .map((product, index) => ({
      product,
      index,
      score: getProductSearchScore(product, parsed),
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map((entry) => entry.product);
}

export function buildCatalogSearchSuggestions(
  products: readonly CatalogProductCardViewModel[],
  query: string,
  limit = 6,
): CatalogSearchSuggestion[] {
  return searchCatalogProducts(products, query)
    .slice(0, limit)
    .map((product) => ({
      id: product.id,
      href: product.href,
      name: product.displayName || product.name,
      dimensionsLabel: product.dimensionsLabel,
      priceUsdLabel: product.priceUsdLabel,
      imageSrc: product.primaryImage?.src ?? null,
      imageAlt: product.primaryImage?.altText ?? product.name,
    }));
}
