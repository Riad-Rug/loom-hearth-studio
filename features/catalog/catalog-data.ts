import type { ProductCategory } from "@/types/domain";

export type CatalogPlaceholderProduct = {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  type: "rug" | "multiUnit";
  priceUsdLabel: string;
  summary: string;
  merchandisingNote: string;
  routePattern: string;
  badge: string;
};

export const catalogCategories = [
  {
    key: "rugs",
    label: "Rugs",
    href: "/shop/rugs",
    description: "Unique, single-quantity handcrafted rugs with their own PDP template.",
  },
  {
    key: "poufs",
    label: "Poufs",
    href: "/shop/poufs",
    description: "Multi-unit home decor pieces reserved for inventory-aware presentation.",
  },
  {
    key: "pillows",
    label: "Pillows",
    href: "/shop/pillows",
    description: "Launch category placeholder for soft furnishings and optional variants.",
  },
  {
    key: "decor",
    label: "Decor",
    href: "/shop/decor",
    description: "Accessory category reserved for broader home styling merchandise.",
  },
  {
    key: "vintage",
    label: "Vintage",
    href: "/shop/vintage",
    description: "Curated vintage placeholder category preserved from the PRD route map.",
  },
] as const satisfies ReadonlyArray<{
  key: ProductCategory;
  label: string;
  href: string;
  description: string;
}>;

export const catalogSortOptions = [
  "Featured",
  "Newest",
  "Price: low to high",
  "Price: high to low",
] as const;

export const catalogFilterLabels = [
  "Rugs",
  "Multi-unit",
  "Handcrafted",
  "New arrivals",
] as const;

export const catalogPlaceholderProducts: CatalogPlaceholderProduct[] = [
  {
    id: "rug-atlas-morning",
    slug: "atlas-morning",
    name: "Atlas Morning Rug",
    category: "rugs",
    type: "rug",
    priceUsdLabel: "$0.00",
    summary: "Static rug placeholder for the unique-item product model.",
    merchandisingNote: "Quantity fixed to 1. No variants.",
    routePattern: "/shop/rugs/[style]/[slug]",
    badge: "Rug placeholder",
  },
  {
    id: "rug-terracotta-field",
    slug: "terracotta-field",
    name: "Terracotta Field Rug",
    category: "rugs",
    type: "rug",
    priceUsdLabel: "$0.00",
    summary: "Reserved for a style-based rug PDP route.",
    merchandisingNote: "Unique inventory lifecycle only.",
    routePattern: "/shop/rugs/[style]/[slug]",
    badge: "Rug placeholder",
  },
  {
    id: "pouf-clay-knot",
    slug: "clay-knot-pouf",
    name: "Clay Knot Pouf",
    category: "poufs",
    type: "multiUnit",
    priceUsdLabel: "$0.00",
    summary: "Static multi-unit placeholder for inventory-aware catalog cards.",
    merchandisingNote: "Quantity and optional variants not implemented yet.",
    routePattern: "/shop/[category]/[slug]",
    badge: "Multi-unit placeholder",
  },
  {
    id: "pillow-hearth-stripe",
    slug: "hearth-stripe-pillow",
    name: "Hearth Stripe Pillow",
    category: "pillows",
    type: "multiUnit",
    priceUsdLabel: "$0.00",
    summary: "Placeholder product card reserved for future variant-capable merchandising.",
    merchandisingNote: "Inventory state is presentation-only in this slice.",
    routePattern: "/shop/[category]/[slug]",
    badge: "Multi-unit placeholder",
  },
  {
    id: "decor-cedar-vessel",
    slug: "cedar-vessel",
    name: "Cedar Vessel Decor",
    category: "decor",
    type: "multiUnit",
    priceUsdLabel: "$0.00",
    summary: "Placeholder decor card for the PRD category browsing surface.",
    merchandisingNote: "No cart or stock behavior implemented.",
    routePattern: "/shop/[category]/[slug]",
    badge: "Multi-unit placeholder",
  },
  {
    id: "vintage-desert-find",
    slug: "desert-find",
    name: "Desert Find Vintage Piece",
    category: "vintage",
    type: "rug",
    priceUsdLabel: "$0.00",
    summary: "Placeholder vintage entry preserving the launch taxonomy.",
    merchandisingNote: "Dynamic PDP route remains scaffolded only.",
    routePattern: "/shop/[category]/[slug]",
    badge: "Vintage placeholder",
  },
] as const;
