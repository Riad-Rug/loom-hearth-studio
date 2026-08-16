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

export type CatalogSizeFilter = "all" | "small" | "medium" | "large";

type CatalogSizeFilterOption = { value: CatalogSizeFilter; label: string };

// Size buckets are category-relative: the server classifies each product against
// its own category's scale (see getProductSizeBucket in lib/catalog/service.ts).
// On rug-only views the segments speak the rug vocabulary shoppers actually use.
export const rugSizeFilterOptions: readonly CatalogSizeFilterOption[] = [
  { value: "all", label: "All" },
  { value: "small", label: "Under 6 ft" },
  { value: "medium", label: "6–8 ft" },
  { value: "large", label: "8 ft +" },
];

export const genericSizeFilterOptions: readonly CatalogSizeFilterOption[] = [
  { value: "all", label: "All" },
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

