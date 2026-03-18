import type { Testimonial } from "@/types/domain";

export const homeHero = {
  eyebrow: "Loom & Hearth Studio",
  title: "Shop handcrafted Moroccan rugs, poufs, pillows, and home decor.",
  description:
    "Discover Moroccan rugs, vintage rugs, rug-made poufs, cactus silk pillows, and handcrafted decor selected for warmth, texture, and collected character. From plush Beni Ourain-inspired pieces to one-of-one vintage finds, each piece is chosen to bring artisanal depth into everyday interiors.",
  imageSrc:
    "https://images.pexels.com/photos/30673750/pexels-photo-30673750.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=960",
  imageAlt:
    "A luxurious Moroccan seating area with ornate textiles, carved details, and plush handmade cushions",
  primaryCta: {
    href: "/shop/rugs",
    label: "Shop Moroccan rugs",
  },
  secondaryCta: {
    href: "/lookbook",
    label: "View the lookbook",
  },
} as const;

export const homeTrustBanner = [
  "Direct from Morocco",
  "United States delivery",
  "Duties included",
  "Curated launch selection",
] as const;

export const homeTrustBadges = [
  "Handcrafted in Morocco",
  "Beni Ourain & vintage rugs",
  "Rug-made poufs & pillows",
  "Curated for layered interiors",
] as const;

export const homeCategories = [
  {
    title: "Moroccan Rugs",
    href: "/shop/rugs",
    description:
      "Handcrafted Moroccan rugs chosen for texture, material depth, and lasting presence in the room.",
  },
  {
    title: "Poufs",
    href: "/shop/poufs",
    description:
      "Rug-made and leather poufs that bring flexible function and a softer, more collected look.",
  },
  {
    title: "Pillows",
    href: "/shop/pillows",
    description: "Cactus silk and rug-based pillows for color, contrast, and layered texture.",
  },
  {
    title: "Decor",
    href: "/shop/decor",
    description:
      "Handcrafted Moroccan decor selected to finish shelves, consoles, tables, and quiet corners.",
  },
  {
    title: "Vintage Rugs",
    href: "/shop/vintage",
    description: "One-of-one vintage Moroccan rugs chosen for patina, history, and collected appeal.",
  },
] as const;

export const homeFeaturedDirections = [
  {
    name: "Moroccan rugs",
    note: "Handwoven Moroccan rugs selected for warmth, texture, and a stronger sense of home.",
    href: "/shop/rugs",
    imageSrc:
      "https://images.pexels.com/photos/7880322/pexels-photo-7880322.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1200",
    imageAlt:
      "A soft cream wool rug styled in a warm interior with wooden furniture and natural light",
  },
  {
    name: "Poufs",
    note: "Leather and rug-made poufs selected for texture, function, and character.",
    href: "/shop/poufs",
    imageSrc:
      "https://images.pexels.com/photos/6368796/pexels-photo-6368796.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1200",
    imageAlt:
      "A brown leather pouf styled in a light, tactile interior with soft linen textures",
  },
  {
    name: "Cactus silk pillows",
    note: "Handcrafted pillows that add softness, color, and a more layered finish to the room.",
    href: "/shop/pillows",
    imageSrc:
      "https://images.pexels.com/photos/30664540/pexels-photo-30664540.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1200",
    imageAlt:
      "Moroccan cushions and layered textiles arranged in a warm interior with visible woven detail",
  },
] as const;

export const homeNarrativeSections = [
  {
    eyebrow: "Brand story",
    title: "Rooted in Moroccan craft, material character, and pieces chosen in person.",
    body:
      "Loom & Hearth Studio builds its collection through direct sourcing in Morocco and a clear eye for rugs, rug-made poufs, pillows, and decor with real presence.",
    href: "/about",
  },
  {
    eyebrow: "Design direction",
    title: "Created for interiors that feel layered, warm, and collected.",
    body:
      "The collection brings together tactile rugs, quiet contrast, and handcrafted accents that help a room feel more grounded and individual.",
    href: "/lookbook",
  },
] as const;

export const homeTestimonials: Testimonial[] = [
  {
    id: "testimonial-1",
    quote: "The rug completely changed the room. The texture feels even better in person.",
    customerName: "Sophie L.",
    location: "New York, NY",
    avatarUrl: "https://i.pravatar.cc/100?img=32",
    sortOrder: 1,
  },
  {
    id: "testimonial-2",
    quote:
      "The pillows added warmth immediately. Everything felt considered and well made.",
    customerName: "Daniel R.",
    location: "Los Angeles, CA",
    avatarUrl: "https://i.pravatar.cc/100?img=12",
    sortOrder: 2,
  },
] as const;

export const homeNewsletter = {
  eyebrow: "Newsletter",
  title: "Get first access to new Moroccan rugs, vintage finds, and studio releases.",
  description:
    "Join the list for new arrivals, lookbook updates, and early access to handcrafted pieces before wider release.",
} as const;

export const homeSeoSection = {
  eyebrow: "Moroccan rugs guide",
  title: "What makes Moroccan rugs unique?",
  body:
    "Moroccan rugs are valued for their handwoven texture, individual character, and the way they bring warmth into a room without feeling generic. Some styles, like Beni Ourain rugs, are known for plush wool and quieter patterning, while vintage Moroccan rugs often bring faded color, movement, and a stronger sense of history. Together, they offer a more collected alternative to mass-market floor coverings.",
} as const;
