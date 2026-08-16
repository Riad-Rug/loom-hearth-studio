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
      "Hand-knotted Moroccan rugs sourced in person across Morocco. Every rug in this collection is ONE OF A KIND \u2014 made by a single weaver, not mass-produced. When a piece sells, it does not return.",
    bullets: [
      "Hand-knotted pile rugs, flatweave kilims, and ONE OF A KIND vintage pieces",
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
      "Vintage Moroccan rugs selected for structural integrity, patina, and visible age. Each piece is assessed for warp and weft tension, pile density, and condition before entering the collection. Visible age is not enough \u2014 the construction has to hold.\n\nEvery piece is ONE OF A KIND.",
    bullets: [
      "Handmade textures in sand, clay, and terracotta",
      "Pieces for shelves, seating areas, and daily use",
      "Ready to browse by category or sort by what suits your space",
    ],
  },
  {
    key: "poufs",
    label: "Poufs",
    title: "Poufs",
    href: "/shop/poufs",
    description:
      "Moroccan poufs made from rug material and leather, designed and hand-sewn by my mom. Rug-material poufs carry the same fibre and weave structure as the rugs they come from. Every piece is cut, matched, and seamed by hand before it is photographed.",
    bullets: [
      "Handmade textures in sand, clay, and terracotta",
      "Pieces for shelves, seating areas, and daily use",
      "Ready to browse by category or sort by what suits your space",
    ],
  },
  {
    key: "pillows",
    label: "Pillows",
    title: "Pillows",
    href: "/shop/pillows",
    description:
      "Cactus silk pillows woven from sabra cactus fibre \u2014 flat-woven, low sheen, low-shed. The flat weave sits differently from a wool pile and introduces a quieter surface. Some pillows in this collection are made from rug material rather than cactus silk. This is noted in each listing.",
    bullets: [
      "Handmade textures in sand, clay, and terracotta",
      "Pieces for shelves, seating areas, and daily use",
      "Ready to browse by category or sort by what suits your space",
    ],
  },
  {
    key: "decor",
    label: "Decor & Antiques",
    title: "Decor & Antiques",
    href: "/shop/decor",
    description:
      "A focused selection of handcrafted Moroccan pieces for shelves, consoles, and surfaces. The same sourcing criteria as the rugs \u2014 assessed in person for construction and material quality, not added to fill a category.",
    bullets: [
      "Handmade textures in sand, clay, and terracotta",
      "Pieces for shelves, seating areas, and daily use",
      "Ready to browse by category or sort by what suits your space",
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

export const catalogPriceFilterOptions = [
  { value: "all", label: "Any" },
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

export type CatalogSizeFilter =
  | "all"
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
  { value: "all", label: "All" },
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
  { value: "all", label: "All" },
  { value: "accent", label: "Accent" },
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
  { value: "oversized", label: "Oversized" },
];

