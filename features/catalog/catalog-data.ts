import type { ProductCategory } from "@/types/domain";

export const catalogCategories = [
  {
    key: "rugs",
    label: "Rugs",
    href: "/shop/rugs",
    description: "Handwoven statement rugs chosen for warmth, texture, and one-of-a-kind character.",
  },
  {
    key: "poufs",
    label: "Poufs",
    href: "/shop/poufs",
    description: "Soft, sculptural poufs that add relaxed seating and layered texture to a room.",
  },
  {
    key: "pillows",
    label: "Pillows",
    href: "/shop/pillows",
    description: "Collected pillows in earthy tones and artisan weaves for an inviting finishing touch.",
  },
  {
    key: "decor",
    label: "Decor",
    href: "/shop/decor",
    description: "Decor accents selected to bring shape, depth, and lived-in detail to every surface.",
  },
  {
    key: "vintage",
    label: "Vintage",
    href: "/shop/vintage",
    description: "Vintage finds with patina, provenance, and a collected feel that cannot be repeated.",
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
  "Handwoven",
  "One of a kind",
  "Layering pieces",
  "Fresh arrivals",
] as const;
