import type { ProductCategory } from "@/types/domain";

type SharedDetailSection = {
  title: string;
  body: string;
};

type SharedRelatedItem = {
  title: string;
  categoryLabel: string;
  href: string;
};

type SharedMediaItem = {
  id: string;
  label: string;
};

type BasePlaceholderProduct = {
  id: string;
  name: string;
  category: ProductCategory;
  priceUsdLabel: string;
  summary: string;
  materials: string;
  origin: string;
  gallery: SharedMediaItem[];
  detailSections: SharedDetailSection[];
  related: SharedRelatedItem[];
  recentlyViewed: SharedRelatedItem[];
  sharePlatforms: string[];
};

export type RugPlaceholderProduct = BasePlaceholderProduct & {
  type: "rug";
  style: string;
  slug: string;
  dimensionsCm: string;
  weightKg: string;
  quantityLabel: "1";
};

export type MultiUnitInventoryState = "inStock" | "lowStock" | "outOfStock";

export type MultiUnitPlaceholderProduct = BasePlaceholderProduct & {
  type: "multiUnit";
  slug: string;
  variantLabel?: string;
  quantityMin: 1;
  inventoryState: MultiUnitInventoryState;
  inventoryMessage: string;
  notifyMeLabel?: string;
  variants?: string[];
};

export type PlaceholderProduct = RugPlaceholderProduct | MultiUnitPlaceholderProduct;

const sharedRelatedItems: SharedRelatedItem[] = [
  {
    title: "Atlas Morning Rug",
    categoryLabel: "Rug placeholder",
    href: "/shop/rugs/atlas/atlas-morning",
  },
  {
    title: "Clay Knot Pouf",
    categoryLabel: "Multi-unit placeholder",
    href: "/shop/poufs/clay-knot-pouf",
  },
  {
    title: "Hearth Stripe Pillow",
    categoryLabel: "Multi-unit placeholder",
    href: "/shop/pillows/hearth-stripe-pillow",
  },
] as const;

const sharedRecentlyViewed: SharedRelatedItem[] = [
  {
    title: "Terracotta Field Rug",
    categoryLabel: "Rug placeholder",
    href: "/shop/rugs/terracotta/terracotta-field",
  },
  {
    title: "Cedar Vessel Decor",
    categoryLabel: "Multi-unit placeholder",
    href: "/shop/decor/cedar-vessel",
  },
] as const;

export const rugPlaceholders: RugPlaceholderProduct[] = [
  {
    id: "rug-atlas-morning",
    type: "rug",
    name: "Atlas Morning Rug",
    category: "rugs",
    style: "atlas",
    slug: "atlas-morning",
    priceUsdLabel: "$0.00",
    summary:
      "Static rug PDP placeholder for the Type A unique-item template. Quantity is locked to one and no variants are presented.",
    materials: "Wool placeholder",
    origin: "Morocco placeholder",
    dimensionsCm: "250 x 170 cm",
    weightKg: "9.0 kg",
    quantityLabel: "1",
    gallery: [
      { id: "rug-gallery-1", label: "Gallery placeholder 01" },
      { id: "rug-gallery-2", label: "Gallery placeholder 02" },
      { id: "rug-gallery-3", label: "Gallery placeholder 03" },
      { id: "rug-gallery-4", label: "Gallery placeholder 04" },
    ],
    detailSections: [
      {
        title: "Materials & Origin",
        body: "Reserved for PRD-supported material and origin details. This content is static placeholder copy only.",
      },
      {
        title: "Dimensions & Care",
        body: "Reserved for rug-specific measurements, care guidance, and handling notes without adding real catalog logic.",
      },
      {
        title: "Shipping & Returns",
        body: "Reserved for policy-aware PDP details. Launch shipping remains US-only and free at launch.",
      },
    ],
    related: sharedRelatedItems,
    recentlyViewed: sharedRecentlyViewed,
    sharePlatforms: ["Pinterest", "Instagram", "Email"],
  },
  {
    id: "rug-terracotta-field",
    type: "rug",
    name: "Terracotta Field Rug",
    category: "rugs",
    style: "terracotta",
    slug: "terracotta-field",
    priceUsdLabel: "$0.00",
    summary:
      "Second rug placeholder preserving the style-based dynamic route structure for the unique-item PDP template.",
    materials: "Wool and cotton placeholder",
    origin: "Morocco placeholder",
    dimensionsCm: "290 x 190 cm",
    weightKg: "11.5 kg",
    quantityLabel: "1",
    gallery: [
      { id: "rug-gallery-5", label: "Gallery placeholder 01" },
      { id: "rug-gallery-6", label: "Gallery placeholder 02" },
      { id: "rug-gallery-7", label: "Gallery placeholder 03" },
      { id: "rug-gallery-8", label: "Gallery placeholder 04" },
    ],
    detailSections: [
      {
        title: "Materials & Origin",
        body: "Reserved for provenance and construction notes in the rug template.",
      },
      {
        title: "Dimensions & Care",
        body: "Reserved for size and care presentation only. No CMS or product retrieval is wired yet.",
      },
      {
        title: "Shipping & Returns",
        body: "Reserved for launch-policy messaging on the PDP.",
      },
    ],
    related: sharedRelatedItems,
    recentlyViewed: sharedRecentlyViewed,
    sharePlatforms: ["Pinterest", "Instagram", "Email"],
  },
] as const;

export const multiUnitPlaceholders: MultiUnitPlaceholderProduct[] = [
  {
    id: "pouf-clay-knot",
    type: "multiUnit",
    name: "Clay Knot Pouf",
    category: "poufs",
    slug: "clay-knot-pouf",
    priceUsdLabel: "$0.00",
    summary:
      "Static multi-unit PDP placeholder with quantity selector UI and optional variant shell.",
    materials: "Wool placeholder",
    origin: "Morocco placeholder",
    quantityMin: 1,
    variantLabel: "Color",
    variants: ["Sand", "Clay", "Charcoal"],
    inventoryState: "inStock",
    inventoryMessage: "In stock placeholder state.",
    gallery: [
      { id: "pouf-gallery-1", label: "Gallery placeholder 01" },
      { id: "pouf-gallery-2", label: "Gallery placeholder 02" },
      { id: "pouf-gallery-3", label: "Gallery placeholder 03" },
      { id: "pouf-gallery-4", label: "Gallery placeholder 04" },
    ],
    detailSections: [
      {
        title: "Materials & Origin",
        body: "Reserved for content about construction, origin, and styling notes.",
      },
      {
        title: "Sizing & Care",
        body: "Reserved for multi-unit dimensions and care instructions.",
      },
      {
        title: "Shipping & Returns",
        body: "Reserved for policy-aware PDP information at launch.",
      },
    ],
    related: sharedRelatedItems,
    recentlyViewed: sharedRecentlyViewed,
    sharePlatforms: ["Pinterest", "Instagram", "Email"],
  },
  {
    id: "pillow-hearth-stripe",
    type: "multiUnit",
    name: "Hearth Stripe Pillow",
    category: "pillows",
    slug: "hearth-stripe-pillow",
    priceUsdLabel: "$0.00",
    summary:
      "Static multi-unit placeholder demonstrating the low-stock messaging supported by the PRD.",
    materials: "Cotton placeholder",
    origin: "Morocco placeholder",
    quantityMin: 1,
    variantLabel: "Size",
    variants: ["Small", "Medium", "Large"],
    inventoryState: "lowStock",
    inventoryMessage: "Low stock placeholder state.",
    gallery: [
      { id: "pillow-gallery-1", label: "Gallery placeholder 01" },
      { id: "pillow-gallery-2", label: "Gallery placeholder 02" },
      { id: "pillow-gallery-3", label: "Gallery placeholder 03" },
      { id: "pillow-gallery-4", label: "Gallery placeholder 04" },
    ],
    detailSections: [
      {
        title: "Materials & Origin",
        body: "Reserved for soft-furnishing composition and origin details.",
      },
      {
        title: "Sizing & Care",
        body: "Reserved for size and care content in the multi-unit template.",
      },
      {
        title: "Shipping & Returns",
        body: "Reserved for launch-policy details.",
      },
    ],
    related: sharedRelatedItems,
    recentlyViewed: sharedRecentlyViewed,
    sharePlatforms: ["Pinterest", "Instagram", "Email"],
  },
  {
    id: "decor-cedar-vessel",
    type: "multiUnit",
    name: "Cedar Vessel Decor",
    category: "decor",
    slug: "cedar-vessel",
    priceUsdLabel: "$0.00",
    summary:
      "Static multi-unit placeholder demonstrating the out-of-stock and notify-me UI shell.",
    materials: "Ceramic placeholder",
    origin: "Morocco placeholder",
    quantityMin: 1,
    inventoryState: "outOfStock",
    inventoryMessage: "Out of stock placeholder state.",
    notifyMeLabel: "Notify me when available",
    gallery: [
      { id: "decor-gallery-1", label: "Gallery placeholder 01" },
      { id: "decor-gallery-2", label: "Gallery placeholder 02" },
      { id: "decor-gallery-3", label: "Gallery placeholder 03" },
      { id: "decor-gallery-4", label: "Gallery placeholder 04" },
    ],
    detailSections: [
      {
        title: "Materials & Origin",
        body: "Reserved for decor-specific composition and origin details.",
      },
      {
        title: "Sizing & Care",
        body: "Reserved for measurement and care guidance.",
      },
      {
        title: "Shipping & Returns",
        body: "Reserved for launch-policy details.",
      },
    ],
    related: sharedRelatedItems,
    recentlyViewed: sharedRecentlyViewed,
    sharePlatforms: ["Pinterest", "Instagram", "Email"],
  },
] as const;

export function getRugPlaceholderByParams(style: string, slug: string) {
  return rugPlaceholders.find(
    (product) => product.style === style && product.slug === slug,
  );
}

export function getMultiUnitPlaceholderByParams(category: string, slug: string) {
  return multiUnitPlaceholders.find(
    (product) => product.category === category && product.slug === slug,
  );
}
