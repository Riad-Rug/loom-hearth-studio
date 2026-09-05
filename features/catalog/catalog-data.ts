import type { ProductCategory } from "@/types/domain";

export const catalogLanding = {
  eyebrow: "Collection",
  title: "The Full Collection",
  description:
    "Handcrafted Moroccan rugs, poufs, pillows, and decor \u2014 sourced directly from Marrakech. Every rug is ONE OF A KIND. When a piece sells, it does not return.",
  bullets: [
    "Hand-knotted rugs, rug-made poufs, cactus silk pillows, and handcrafted decor",
    "Every rug is ONE OF A KIND \u2014 sold pieces are not restocked",
    "Filter by category or sort by price and arrival date",
  ],
} as const;

export const catalogCategories = [
  {
    key: "rugs",
    label: "Rugs",
    title: "Moroccan Rugs",
    href: "/shop/rugs",
    description:
      "A Moroccan rug is a product of geography before it's a product of a name. Climate sets the pile thickness. Altitude shapes the wool. Trade routes decided which dyes were within reach. I learned to look at rugs this way before I learned any style names, and it's the order I still work in.\n\nMost buyers start with a label \u2014 Beni Ourain, Azilal, Boucherouite \u2014 because that's how the market sells rugs. I'd rather start with where a rug comes from. The Middle Atlas is mountain tribal weaving: thick pile built for cold winters, the ivory-and-dark-line rugs of the Beni Ourain confederation, and their neighbours in deep reds and golds, the Beni M'Guild. The High Atlas gives you both pile and flatweave \u2014 banded, graphic pieces in the Glaoua tradition, and the light-ground, colour-struck rugs people call Azilal. The central plains carry the warm, painterly Boujad palette and the bold red-ground geometry of Zemmour. And in the south, around Taznakht and the Siroua massif, you find some of the most pattern-dense, colour-sophisticated weaving in the country \u2014 pieces that mix pile and flatweave in a single rug, not one technique alone.\n\nI use these names because buyers search for them and because they're useful shorthand \u2014 not because they're guaranteed provenance. Even auction houses hedge attribution when they're not certain, and I do the same. What I check in person before a rug is listed: the wool (hand-spun wool has a slight irregularity a machine can't fake), the back (individual knots, not a uniform fabric grid), the weight, the way the pile catches light. Where I'm not certain of a rug's exact origin, I say so rather than dress it up.\n\nONE OF A KIND means exactly that. When a piece sells, it isn't rewoven or restocked.",
    bullets: [
      "Hand-knotted pile rugs, Moroccan flatweaves (hanbel), and ONE OF A KIND vintage pieces",
      "Construction details \u2014 pile depth, fibre type, knot structure \u2014 documented in every listing",
      "Filter by style or sort by price and arrival date",
    ],
  },
  {
    key: "vintage",
    label: "Vintage Rugs",
    title: "Vintage Rugs",
    href: "/shop/vintage",
    description:
      "\u201cVintage\u201d gets used loosely in this market, so here's what it means on this site. In the trade, vintage generally means roughly 20 to 80 years old, with real patina and wear \u2014 not a fixed legal definition, just a working convention I hold myself to. \u201cAntique\u201d is a higher bar, 100 years plus by standard trade usage, and I don't reach for that word unless I have real reason to believe it.\n\nAge alone doesn't get a rug into this collection. I check the wool first \u2014 springy and resilient means it's still doing its job; flat and lifeless is a problem no amount of patina fixes. I check the selvedges for fraying, the pile for bald patches worn to the foundation, the back for loose or irregular knot rows. A rug that lies flat with no waves or buckling has held its structure. One that doesn't, hasn't \u2014 no matter how good the story behind it is.\n\nTonal variation in the field colour \u2014 abrash, from batch-to-batch differences in hand-dyed wool \u2014 isn't a flaw here. It's a sign the dye was mixed by hand, not machine-matched, and it's one of the things that tells an old piece from a new one. Repairs happen to old rugs, and when one has been repaired, I say so and where. A well-done repair at the edge isn't a dealbreaker. An undisclosed one is the kind of thing that ends a relationship with a buyer, so I don't do it.\n\nEvery piece here passed that check. What didn't, isn't listed.",
    bullets: [
      "Assessed for wool quality, knot consistency, and structural integrity before listing",
      "Condition and any repairs disclosed honestly, not softened in copy",
      "Sort by price, size, or arrival date",
    ],
  },
  {
    key: "poufs",
    label: "Poufs",
    title: "Poufs",
    href: "/shop/poufs",
    description:
      "Poufs live at the edge of two crafts: my mom's needlework, and whatever rug or leather the piece began as. Rug-material poufs aren't woven as poufs from the start \u2014 they're built from wool with the same construction as the rugs in this collection, hand-spun irregularity and all, then cut, matched for pattern, and seamed into a new shape by hand. What you're looking at is the same fibre and weave logic as a rug, just made to sit under you instead of under your feet.\n\nLeather poufs follow a different logic \u2014 full-grain hide, hand-stitched, meant to age and darken with handling rather than stay pristine. Both kinds are matched and sewn by my mom before they're photographed, which means no two are identical even when they're cut from the same source material. That's not a flaw in the process. It's what hand-matching patterns from a real, used piece of textile actually looks like.",
    bullets: [
      "Rug-material poufs share the wool and weave structure of the source rugs",
      "Leather poufs hand-stitched from full-grain hide",
      "Hand-cut, pattern-matched, and seamed by hand \u2014 no two are identical",
    ],
  },
  {
    key: "pillows",
    label: "Pillows",
    title: "Pillows",
    href: "/shop/pillows",
    description:
      "Most pillows here are cactus silk \u2014 sabra, spun from the fibre of the agave cactus, not an actual silk. It's flat-woven rather than piled, which means it behaves differently on a sofa than a wool cover does: a quieter, low-sheen surface, less shedding, a cooler hand-feel. Sabra takes dye in a particular way too \u2014 the same colour can read slightly differently depending on the weave direction, which is part of its character rather than a flaw to correct.\n\nA smaller number of pillows in this collection are made from rug material instead \u2014 offcuts and remnants with the same pile character as the rugs they came from, rather than the flat sabra weave. That distinction matters for how a piece feels and wears, so it's noted on every listing rather than left for you to guess.",
    bullets: [
      "Cactus silk (sabra) \u2014 flat-woven from agave fibre, low sheen, low shed",
      "A smaller set made from rug material \u2014 pile character, not flat weave",
      "Fibre type noted on every listing",
    ],
  },
  {
    key: "decor",
    label: "Decor & Antiques",
    title: "Decor & Antiques",
    href: "/shop/decor",
    description:
      "This is a small, deliberately limited category. Every piece here \u2014 ceramics, vessels, small furniture, worked metal \u2014 passed the same test the rugs do: I looked at it in person, checked how it was made, and decided it was good enough to stand next to a rug I'd sell under my own name. Nothing gets added just to make the shop look fuller.\n\nMost of what ends up here is old rather than new \u2014 pieces that were made for use, not for export, and show it in small ways: a repaired handle, a worn glaze, a join that was clearly done by hand and not a mould. Where a piece is genuinely old by trade convention, I say so. Where it's a well-made newer piece, I say that instead. The word \u201cauthentic\u201d doesn't tell you anything on its own, so I try not to use it without something specific behind it.",
    bullets: [
      "Ceramics, vessels, small furniture, and worked metal \u2014 assessed in person, not sourced remotely",
      "Age and condition described specifically rather than labeled \u201cauthentic\u201d",
      "A small, curated set \u2014 not a catch-all category",
    ],
  },
] as const satisfies ReadonlyArray<{
  key: ProductCategory;
  label: string;
  title: string;
  href: string;
  description: string;
  bullets: readonly string[];
}>;

// "newest" is the default and requires no client-side reordering: the catalog
// repository already lists products by `updatedAt desc` (see
// PrismaProductRepository.listAll/listByCategory), so "newest" just means
// "leave the server's order alone."
export const catalogSortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
] as const;

export type CatalogSortOption = (typeof catalogSortOptions)[number]["value"];

// Multi-select, like category: no selection means "every price", so there's no
// "Any" option to check.
export const catalogPriceFilterOptions = [
  { value: "under-300", label: "Under $300" },
  { value: "300-600", label: "$300–600" },
  { value: "600-plus", label: "$600+" },
] as const;

export type CatalogPriceFilter = (typeof catalogPriceFilterOptions)[number]["value"];

// Category filter options for the shop sidebar. Ordered the way the shop reads
// left to right in the header's Collection menu rather than by catalogCategories
// order; `vintage` is a real ProductCategory of its own (not a rug sub-style),
// so every option maps 1:1 onto a category key and its route.
export const catalogCategoryFilterOptions = [
  { value: "rugs", label: "Rugs", href: "/shop/rugs" },
  { value: "poufs", label: "Poufs", href: "/shop/poufs" },
  { value: "pillows", label: "Pillows", href: "/shop/pillows" },
  { value: "vintage", label: "Vintage Rugs", href: "/shop/vintage" },
  { value: "decor", label: "Decor & Antiques", href: "/shop/decor" },
] as const satisfies ReadonlyArray<{
  value: ProductCategory;
  label: string;
  href: string;
}>;

export type CatalogCategoryFilterOption = (typeof catalogCategoryFilterOptions)[number];

// Multi-select, like category and price: no selection means "every size", so
// there's no "All" option to check.
export type CatalogSizeFilter =
  | "accent"
  | "small"
  | "medium"
  | "large"
  | "oversized";

export type CatalogSizeFilterOption = {
  value: CatalogSizeFilter;
  label: string;
  /** Concrete footprint range, shown as a second line on rug-only views. */
  hint?: string;
  /** Spoken form of label + hint, so screen readers don't read "ft²" raw. */
  spokenLabel?: string;
};

// Size buckets are category-relative: the server classifies each product against
// its own category's footprint scale (see getProductSizeBucket in
// lib/catalog/service.ts). On rug-only views the tiers carry the concrete area
// range, because "Medium" alone tells a shopper nothing about their room.
export const rugSizeFilterOptions: readonly CatalogSizeFilterOption[] = [
  { value: "accent", label: "Accent", hint: "to 13 ft²", spokenLabel: "Accent, up to 13 square feet" },
  { value: "small", label: "Small", hint: "13–17 ft²", spokenLabel: "Small, 13 to 17 square feet" },
  { value: "medium", label: "Medium", hint: "17–21 ft²", spokenLabel: "Medium, 17 to 21 square feet" },
  { value: "large", label: "Large", hint: "21–32 ft²", spokenLabel: "Large, 21 to 32 square feet" },
  {
    value: "oversized",
    label: "Oversized",
    hint: "32 ft² +",
    spokenLabel: "Oversized, 32 square feet and up",
  },
];

// Mixed views span rugs and much smaller pieces, so a single area range would be
// wrong for half the grid: names only, each piece measured against its own scale.
export const genericSizeFilterOptions: readonly CatalogSizeFilterOption[] = [
  { value: "accent", label: "Accent" },
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
  { value: "oversized", label: "Oversized" },
];

