import type { Testimonial } from "@/types/domain";

export const homeHero = {
  eyebrow: "Loom & Hearth Studio",
  title: "Handcrafted Moroccan rugs and home decor for collected, design-led interiors.",
  description:
    "Discover Moroccan rugs, vintage rugs, leather poufs, cactus silk pillows, and handcrafted decor selected for texture, warmth, and everyday beauty. From plush Beni Ourain rugs to storied one-of-one finds, each piece brings artisanal character home.",
  primaryCta: {
    href: "/shop",
    label: "Shop Moroccan rugs",
  },
  secondaryCta: {
    href: "/lookbook",
    label: "View the lookbook",
  },
} as const;

export const homeTrustBanner = [
  "Direct checkout",
  "United States shipping",
  "USD pricing only",
  "Free shipping at launch",
] as const;

export const homeStats = [
  {
    value: "5",
    label: "launch categories",
    supportingText: "Moroccan rugs, poufs, pillows, decor, and vintage pieces.",
  },
  {
    value: "2",
    label: "signature directions",
    supportingText: "Beni Ourain neutrals and vintage character-led rugs.",
  },
  {
    value: "US",
    label: "launch market only",
    supportingText: "USD checkout and domestic shipping for the first release.",
  },
] as const;

export const homeTrustBadges = [
  "Handcrafted in Morocco",
  "Beni Ourain & vintage rugs",
  "Leather poufs & pillows",
  "Curated home decor",
] as const;

export const homeCategories = [
  {
    title: "Moroccan Rugs",
    href: "/shop/rugs",
    description:
      "Handcrafted area rugs including Beni Ourain-inspired neutrals, textured wool pieces, and statement designs for living spaces and bedrooms.",
  },
  {
    title: "Poufs",
    href: "/shop/poufs",
    description:
      "Moroccan leather poufs and relaxed floor seating that add warmth, texture, and flexible function.",
  },
  {
    title: "Pillows",
    href: "/shop/pillows",
    description:
      "Cactus silk and woven accent pillows designed to layer color, softness, and artisanal detail.",
  },
  {
    title: "Decor",
    href: "/shop/decor",
    description:
      "Handcrafted Moroccan decor chosen for shelves, tables, and finishing touches with soul.",
  },
  {
    title: "Vintage Rugs",
    href: "/shop/vintage",
    description: "One-of-one vintage Moroccan rugs with patina, character, and collected appeal.",
  },
] as const;

export const homeFeaturedProducts = [
  {
    name: "Moroccan rug preview",
    type: "Rug placeholder",
    price: "$0.00",
    note: "Launch preview placeholder. Final size, materials, and pricing will appear once the live catalog is connected.",
  },
  {
    name: "Leather pouf preview",
    type: "Multi-unit placeholder",
    price: "$0.00",
    note: "Launch preview placeholder. Final size, color, and availability will appear once the live catalog is connected.",
  },
  {
    name: "Cactus silk pillow preview",
    type: "Multi-unit placeholder",
    price: "$0.00",
    note: "Launch preview placeholder. Final fabric, dimensions, and pricing will appear once the live catalog is connected.",
  },
] as const;

export const homeNarrativeSections = [
  {
    eyebrow: "Brand story",
    title: "Moroccan craft, material depth, and a more thoughtful pace of home.",
    body:
      "Loom & Hearth Studio brings together handcrafted Moroccan rugs and decor selected for texture, utility, and lasting presence — pieces that feel collected rather than mass produced.",
  },
  {
    eyebrow: "Media direction",
    title: "Designed for layered rooms, quiet color, and tactile living.",
    body:
      "The collection pairs sculptural rugs, vintage character, and soft-textured accents to help build interiors that feel warm, grounded, and individual.",
  },
] as const;

export const homeTestimonials: Testimonial[] = [
  {
    id: "testimonial-1",
    quote: "Customer testimonials will appear here once post-launch reviews are available.",
    customerName: "Future client stories",
    location: "Launch phase",
    sortOrder: 1,
  },
  {
    id: "testimonial-2",
    quote:
      "Until then, this section should support trust without manufacturing proof that does not yet exist.",
    customerName: "Editorial note",
    location: "Placeholder copy",
    sortOrder: 2,
  },
] as const;

export const homeNewsletter = {
  eyebrow: "Newsletter",
  title: "Be first to see new Moroccan rugs, vintage finds, and studio updates.",
  description: "Join for new arrivals, lookbook releases, and behind-the-scenes notes from Loom & Hearth Studio.",
} as const;

export const homeSeoSection = {
  eyebrow: "Moroccan rugs guide",
  title: "What makes Moroccan rugs unique?",
  body:
    "Moroccan rugs stand out for their texture, handwoven character, and sense of individuality. Some styles feel plush and minimal, like Beni Ourain rugs, while vintage flatweaves and color-rich pieces add movement and history. The result is a rug that warms a room visually and physically while still feeling collected and personal.",
} as const;
