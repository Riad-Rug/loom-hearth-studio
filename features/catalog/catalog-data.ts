import type { ProductCategory } from "@/types/domain";

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
    description: "Multi-unit home decor pieces with quantity-aware launch inventory.",
  },
  {
    key: "pillows",
    label: "Pillows",
    href: "/shop/pillows",
    description: "Soft furnishings with launch-ready size or variant presentation.",
  },
  {
    key: "decor",
    label: "Decor",
    href: "/shop/decor",
    description: "Accessory pieces selected for tabletop, shelf, and styling layers.",
  },
  {
    key: "vintage",
    label: "Vintage",
    href: "/shop/vintage",
    description: "One-of-one vintage textile pieces surfaced through the Type A product model.",
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
