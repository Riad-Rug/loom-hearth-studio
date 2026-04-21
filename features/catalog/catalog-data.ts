import type { ProductCategory } from "@/types/domain";

export const catalogLanding = {
  eyebrow: "Collection",
  title: "The Full Collection",
  description:
    "Handcrafted Moroccan rugs, poufs, pillows, and decor \u2014 sourced directly from Marrakech. Every rug is one of one. When a piece sells, it does not return.",
  bullets: [
    "Hand-knotted rugs, rug-made poufs, cactus silk pillows, and handcrafted decor",
    "Every rug is one of one \u2014 sold pieces are not restocked",
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
      "Hand-knotted Moroccan rugs sourced directly through our family bazaar in Marrakech. Every rug in this collection is one of one \u2014 made by a single weaver, not mass-produced. When a piece sells, it does not return.",
    bullets: [
      "Hand-knotted pile rugs, flatweave kilims, and one of one vintage pieces",
      "Construction details \u2014 pile depth, fibre type, knot structure \u2014 documented in every listing",
      "Filter by style or sort by price and arrival date",
    ],
  },
  {
    key: "poufs",
    label: "Poufs",
    title: "Poufs",
    href: "/shop/poufs",
    description:
      "Moroccan poufs made from rug material and leather, sourced and constructed in Marrakech. Rug-material poufs carry the same fibre and weave structure as the rugs they come from. Construction quality is assessed before the pieces are formed \u2014 not after they are photographed.",
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
    label: "Decor",
    title: "Home Decor",
    href: "/shop/decor",
    description:
      "A focused selection of handcrafted Moroccan pieces for shelves, consoles, and surfaces. The same sourcing criteria as the rugs \u2014 assessed in person for construction and material quality, not added to fill a category.",
    bullets: [
      "Handmade textures in sand, clay, and terracotta",
      "Pieces for shelves, seating areas, and daily use",
      "Ready to browse by category or sort by what suits your space",
    ],
  },
  {
    key: "vintage",
    label: "Vintage",
    title: "Vintage Rugs",
    href: "/shop/vintage",
    description:
      "Vintage Moroccan rugs selected for structural integrity, patina, and visible age. Each piece is assessed for warp and weft tension, pile density, and condition before entering the collection. Visible age is not enough \u2014 the construction has to hold.\n\nEvery piece is one of one.",
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

export const catalogSortOptions = [
  "Featured",
  "Newest",
  "Price: Low to High",
  "Price: High to Low",
] as const;

export const catalogFilterLabels = [
  "Handwoven",
  "One of One",
  "Decor",
  "Fresh Arrivals",
] as const;
