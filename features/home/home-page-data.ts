import type { Testimonial } from "@/types/domain";

export const homeHero = {
  eyebrow: "Loom & Hearth Studio",
  title: "Shop handcrafted Moroccan rugs, poufs, pillows, and home decor.",
  description:
    "Discover Moroccan rugs, vintage rugs, leather poufs, cactus silk pillows, and handcrafted decor selected for warmth, texture, and collected character. From plush Beni Ourain-inspired pieces to one-of-one vintage finds, each piece is chosen to bring artisanal depth into everyday interiors.",
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
    label: "core categories",
    supportingText: "Moroccan rugs, poufs, pillows, decor, and vintage pieces.",
  },
  {
    value: "2",
    label: "signature rug directions",
    supportingText: "Beni Ourain neutrals and vintage Moroccan character.",
  },
  {
    value: "US",
    label: "launch market only",
    supportingText: "USD pricing and domestic shipping for the first release.",
  },
] as const;

export const homeTrustBadges = [
  "Handcrafted in Morocco",
  "Beni Ourain & vintage rugs",
  "Leather poufs & cactus silk pillows",
  "Curated for layered interiors",
] as const;

export const homeCategories = [
  {
    title: "Moroccan Rugs",
    href: "/shop/rugs",
    description:
      "Handcrafted area rugs with texture, warmth, and visual depth for living rooms, bedrooms, and layered interiors.",
  },
  {
    title: "Poufs",
    href: "/shop/poufs",
    description:
      "Moroccan leather poufs for flexible seating, casual styling, and soft sculptural contrast.",
  },
  {
    title: "Pillows",
    href: "/shop/pillows",
    description:
      "Cactus silk and woven accent pillows that add softness, color, and artisanal detail.",
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

export const homeFeaturedProducts = [
  {
    name: "Moroccan rug preview",
    type: "Rug placeholder",
    price: "$0.00",
    note: "Preview placeholder for a handcrafted Moroccan rug. Final size, fiber details, and pricing will appear once the live catalog is connected.",
    href: "/shop/rugs",
  },
  {
    name: "Leather pouf preview",
    type: "Multi-unit placeholder",
    price: "$0.00",
    note: "Preview placeholder for a Moroccan leather pouf. Final color, finish, and availability will appear once the live catalog is connected.",
    href: "/shop/poufs",
  },
  {
    name: "Cactus silk pillow preview",
    type: "Multi-unit placeholder",
    price: "$0.00",
    note: "Preview placeholder for a cactus silk pillow. Final dimensions, textile details, and pricing will appear once the live catalog is connected.",
    href: "/shop/pillows",
  },
] as const;

export const homeNarrativeSections = [
  {
    eyebrow: "Brand story",
    title: "Rooted in Moroccan craft, material character, and pieces meant to last.",
    body:
      "Loom & Hearth Studio curates handcrafted Moroccan rugs and decor with an emphasis on texture, usability, and collected presence — pieces that feel lived with, not mass produced.",
    href: "/about",
  },
  {
    eyebrow: "Design direction",
    title: "Created for layered interiors with warmth, softness, and quiet contrast.",
    body:
      "The collection brings together tactile rugs, character-rich vintage pieces, and relaxed accents that help a room feel more grounded, personal, and complete.",
    href: "/lookbook",
  },
] as const;

export const homeTestimonials: Testimonial[] = [
  {
    id: "testimonial-1",
    quote:
      "The rug completely changed the room. The texture feels incredible in person, and it looks even better than the photos.",
    customerName: "Sophie L.",
    location: "New York, NY",
    avatarUrl: "https://i.pravatar.cc/100?img=32",
    sortOrder: 1,
  },
  {
    id: "testimonial-2",
    quote:
      "The pouf and pillows added exactly the warmth we were missing. Everything feels very considered and well made.",
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
    "Join the list for new arrivals, lookbook updates, and early access to handcrafted pieces before broader release.",
} as const;

export const homeSeoSection = {
  eyebrow: "Moroccan rugs guide",
  title: "What makes Moroccan rugs unique?",
  body:
    "Moroccan rugs are valued for their handwoven texture, individual character, and ability to warm a room without feeling generic. Some styles, like Beni Ourain rugs, are known for plush wool and quieter patterning, while vintage Moroccan rugs often bring faded color, movement, and a stronger sense of history. Together, they offer a more collected alternative to mass-market floor coverings.",
} as const;
