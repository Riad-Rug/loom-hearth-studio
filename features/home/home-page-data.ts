import type { Testimonial } from "@/types/domain";

export const homeHero = {
  eyebrow: "Loom & Hearth Studio",
  title: "A premium editorial storefront for handcrafted Moroccan rugs and home decor.",
  description:
    "The homepage is implemented with static placeholder content only. It preserves the PRD structure for hero storytelling, category browsing, featured products, testimonials, and newsletter capture without introducing live commerce or CMS behavior.",
  primaryCta: {
    href: "/shop",
    label: "Explore the collection",
  },
  secondaryCta: {
    href: "/lookbook",
    label: "View the lookbook",
  },
} as const;

export const homeTrustBanner = [
  "Guest checkout",
  "United States shipping",
  "USD pricing only",
  "Free shipping at launch",
] as const;

export const homeStats = [
  {
    value: "5",
    label: "launch shop categories",
  },
  {
    value: "2",
    label: "product page templates",
  },
  {
    value: "US",
    label: "launch market only",
  },
] as const;

export const homeTrustBadges = [
  "Handcrafted pieces",
  "Editorial storytelling",
  "SEO-focused storefront",
  "Cloudinary-ready media model",
] as const;

export const homeCategories = [
  {
    title: "Rugs",
    href: "/shop/rugs",
    description: "Unique handcrafted rugs with their own dedicated product template.",
  },
  {
    title: "Poufs",
    href: "/shop/poufs",
    description: "Multi-unit decor products reserved for inventory-aware merchandising.",
  },
  {
    title: "Pillows",
    href: "/shop/pillows",
    description: "Soft furnishings placeholder category for the launch catalog structure.",
  },
  {
    title: "Decor",
    href: "/shop/decor",
    description: "Home accents showcased through the same premium editorial system.",
  },
  {
    title: "Vintage",
    href: "/shop/vintage",
    description: "A preserved launch category route for curated one-off and collectible pieces.",
  },
] as const;

export const homeFeaturedProducts = [
  {
    name: "Atlas Loom Rug",
    type: "Rug placeholder",
    price: "$0.00",
    note: "Static placeholder card for the unique-item rug PDP flow.",
  },
  {
    name: "Clay Weave Pouf",
    type: "Multi-unit placeholder",
    price: "$0.00",
    note: "Static placeholder card for inventory-based merchandising.",
  },
  {
    name: "Hearth Stripe Pillow",
    type: "Multi-unit placeholder",
    price: "$0.00",
    note: "Static placeholder card only. No real catalog retrieval is implemented.",
  },
] as const;

export const homeNarrativeSections = [
  {
    eyebrow: "Brand story",
    title: "An editorial tone built around craft, material, and provenance.",
    body:
      "The PRD calls for homepage narrative sections and a premium storefront voice. This slice implements that structure with static copy only, so the final content can be managed later without changing the page architecture.",
  },
  {
    eyebrow: "Media direction",
    title: "Designed for large-format imagery, layered storytelling, and curated highlights.",
    body:
      "Homepage hero media, category tiles, lookbook imagery, testimonials, and trust elements all have reserved presentation patterns here. Live assets, CMS wiring, and merchandising rules remain out of scope for this slice.",
  },
] as const;

export const homeTestimonials: Testimonial[] = [
  {
    id: "testimonial-1",
    quote:
      "Placeholder testimonial preview for the homepage. Final customer stories will be entered through the future content workflow.",
    customerName: "Studio Client",
    location: "United States",
    sortOrder: 1,
  },
  {
    id: "testimonial-2",
    quote:
      "This section is intentionally static for now, but the PRD-supported testimonial surface is now represented in the homepage structure.",
    customerName: "Editorial Buyer",
    location: "United States",
    sortOrder: 2,
  },
] as const;

export const homeNewsletter = {
  eyebrow: "Newsletter",
  title: "Stay close to new arrivals, lookbook updates, and studio notes.",
  description:
    "This is UI only. Newsletter platform selection and subscription handling remain unresolved and are intentionally not implemented in this slice.",
} as const;
