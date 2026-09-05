export const rugStyleCollections = {
  "beni-ourain": {
    title: "Beni Ourain Rugs",
    description:
      "Browse Beni Ourain rugs selected for hand-knotted wool construction, pale fields, and restrained geometric pattern. Each rug is reviewed as an individual piece before it is listed.",
    bullets: [
      "Hand-knotted wool pile rugs with visible construction notes",
      "ONE OF A KIND pieces sourced through Marrakech",
      "Final colour and condition confirmed before payment is captured",
    ],
    category: "rugs",
  },
  boujad: {
    title: "Boujad Rugs",
    description:
      "Browse Boujad rugs from the plains around Boujad in central Morocco, hand-knotted in wool and recognised for expressive, folk-art motifs drawn across warm pink, magenta, and purple grounds. Each rug is reviewed as an individual piece before it is listed.",
    bullets: [
      "Hand-knotted wool pile rugs with expressive, freely drawn motifs",
      "ONE OF A KIND pieces sourced through Marrakech",
      "Final colour and condition confirmed before payment is captured",
    ],
    category: "rugs",
  },
  azilal: {
    title: "Azilal Rugs",
    description:
      "Browse Azilal rugs from the Azilal region of the central Atlas, hand-knotted in wool with colourful abstract and geometric drawing set on a pale ivory ground. A more decorative relative of the Beni Ourain, reviewed piece by piece before listing.",
    bullets: [
      "Hand-knotted wool pile rugs with colour drawing on an ivory field",
      "ONE OF A KIND pieces sourced through Marrakech",
      "Final colour and condition confirmed before payment is captured",
    ],
    category: "rugs",
  },
  "beni-m-guild": {
    title: "Beni M'Guild Rugs",
    description:
      "Browse Beni M'Guild rugs from the Middle Atlas, hand-knotted in thick wool with deep reds, oranges, and blacks arranged in banded diamond and lozenge patterns. Woven for real everyday use, and reviewed as an individual piece before it is listed.",
    bullets: [
      "Hand-knotted wool pile rugs with a heavier, everyday-use pile",
      "ONE OF A KIND pieces sourced through Marrakech",
      "Final colour and condition confirmed before payment is captured",
    ],
    category: "rugs",
  },
  zemmour: {
    title: "Zemmour Rugs",
    description:
      "Browse Zemmour rugs from the Middle Atlas plateau, woven in both knotted pile and flatweave (hanbel) form and known for tightly banded geometric pattern, often on a red ground. Each rug is reviewed as an individual piece before it is listed.",
    bullets: [
      "Handwoven wool pieces in banded geometric pattern, pile or flatweave",
      "ONE OF A KIND pieces sourced through Marrakech",
      "Final colour and condition confirmed before payment is captured",
    ],
    category: "rugs",
  },
  boucherouite: {
    title: "Boucherouite Rugs",
    description:
      "Browse Boucherouite rugs, woven from recycled fabric and yarn scraps rather than spun fleece, which makes them the most improvisational and vividly coloured of the Moroccan rug traditions. A comparatively recent craft, reviewed piece by piece before listing.",
    bullets: [
      "Handwoven rag rugs built from recycled fabric and mixed yarn",
      "ONE OF A KIND pieces sourced through Marrakech",
      "Final colour and condition confirmed before payment is captured",
    ],
    category: "rugs",
  },
  "flatweave-hanbel": {
    title: "Flatweave (Hanbel) Rugs",
    description:
      "Browse hanbel flatweaves, woven without a knotted pile so they sit lighter and thinner than a pile rug, typically carrying banded geometric design. Historically used as floor coverings and as blankets, and reviewed as an individual piece before listing.",
    bullets: [
      "Flatwoven wool pieces with no knotted pile, light enough to layer",
      "ONE OF A KIND pieces sourced through Marrakech",
      "Final colour and condition confirmed before payment is captured",
    ],
    category: "rugs",
  },
  "mixed-technique": {
    title: "Mixed Technique Rugs",
    description:
      "Browse rugs that combine more than one construction in a single piece, most often knotted pile worked alongside flatwoven bands. Construction is stated per rug, and each one is reviewed as an individual piece before it is listed.",
    bullets: [
      "Handwoven pieces combining pile and flatweave in one rug",
      "ONE OF A KIND pieces sourced through Marrakech",
      "Final colour and condition confirmed before payment is captured",
    ],
    category: "rugs",
  },
  vintage: {
    title: "Vintage Moroccan Rugs",
    description:
      "Browse vintage Moroccan rugs selected for structure, patina, and exact-piece character. These are collected pieces, not repeatable stock.",
    bullets: [
      "ONE OF A KIND vintage rugs with condition notes",
      "Selected for structural integrity, not age alone",
      "Final colour and condition confirmed before payment is captured",
    ],
    category: "vintage",
  },
} as const;

export type RugStyleCollectionSlug = keyof typeof rugStyleCollections;

export function getRugStyleCollection(slug: string) {
  return rugStyleCollections[slug as RugStyleCollectionSlug] ?? null;
}


/**
 * The rug styles that get their own nav entry, in the order they should be
 * offered to a shopper (roughly search demand, best-known first). "vintage" is
 * deliberately absent: it is its own category with its own /shop/vintage
 * landing route, not a rug style nested under /shop/rugs.
 *
 * Single source of truth for anchor text. Every surface that links a style page
 * — the header dropdown, the homepage strip, the /shop/rugs chip row, the
 * sibling "Other rug types" strip — reads its label from here, so each of these
 * six pages accumulates one consistent, keyword-exact anchor instead of a
 * different phrasing per surface.
 */
export const rugStyleNavSlugs = [
  "beni-ourain",
  "azilal",
  "boujad",
  "zemmour",
  "beni-m-guild",
  "boucherouite",
  "flatweave-hanbel",
  "mixed-technique",
] as const satisfies readonly RugStyleCollectionSlug[];

export type RugStyleNavSlug = (typeof rugStyleNavSlugs)[number];

export type RugStyleNavLink = {
  slug: RugStyleNavSlug;
  href: string;
  label: string;
};

export const rugStyleNavLinks: readonly RugStyleNavLink[] = rugStyleNavSlugs.map((slug) => ({
  slug,
  href: `/shop/rugs/${slug}`,
  label: rugStyleCollections[slug].title,
}));

/** Anchor for the parent rugs landing route, used as the first item in style menus. */
export const allRugsNavLink = {
  href: "/shop/rugs",
  label: "All Moroccan Rugs",
} as const;
