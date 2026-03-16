import type { FaqItem, PolicyPage, Testimonial } from "@/types/domain";

type AboutSection = {
  eyebrow: string;
  title: string;
  body: string;
};

type LookbookItem = {
  id: string;
  title: string;
  description: string;
};

export const aboutHero = {
  eyebrow: "About",
  title: "An editorial home for handcrafted Moroccan rugs and home decor.",
  body:
    "This page is implemented with static placeholder content only. It preserves the PRD-supported About surface and premium brand tone without introducing CMS wiring or finalized editorial copy.",
} as const;

export const aboutSections: AboutSection[] = [
  {
    eyebrow: "Craft",
    title: "A storefront shaped around material, texture, and provenance.",
    body:
      "The PRD calls for editorial storytelling across the storefront. This placeholder section preserves that narrative layout so final brand copy can be introduced later without changing the page structure.",
  },
  {
    eyebrow: "Direction",
    title: "Built to balance commerce with trust, story, and visual pace.",
    body:
      "The current implementation focuses on shell and structure only. Product operations, CMS-driven storytelling, and media publishing workflows remain intentionally out of scope for this slice.",
  },
] as const;

export const contactData = {
  eyebrow: "Contact",
  title: "WhatsApp-first contact presentation",
  body:
    "This contact page is presentation only. It preserves the PRD contact surface and a WhatsApp-first communication direction without implementing real messaging, forms, or provider wiring.",
  whatsappLabel: "WhatsApp link placeholder",
  emailLabel: "studio@example.com placeholder",
  hoursLabel: "Monday to Friday, 9am to 5pm placeholder",
} as const;

export const faqItems: FaqItem[] = [
  {
    id: "faq-1",
    question: "Do you ship only within the United States at launch?",
    answer:
      "Yes. The PRD defines the launch market as United States only, and this placeholder answer preserves that policy direction.",
    sortOrder: 1,
  },
  {
    id: "faq-2",
    question: "What is the launch shipping price?",
    answer:
      "Shipping is fixed at $0.00 at launch. This page is static placeholder content and does not reflect live operational logic.",
    sortOrder: 2,
  },
  {
    id: "faq-3",
    question: "Are rugs and multi-unit products handled differently?",
    answer:
      "Yes. Rugs are unique items with quantity locked to one, while multi-unit products can support quantities greater than one and optional variants.",
    sortOrder: 3,
  },
] as const;

export const lookbookItems: LookbookItem[] = [
  {
    id: "lookbook-1",
    title: "Living room composition placeholder",
    description:
      "Gallery-style placeholder panel reserved for future Cloudinary-backed lookbook media.",
  },
  {
    id: "lookbook-2",
    title: "Textile detail placeholder",
    description:
      "Static placeholder tile preserving the lookbook browsing rhythm from the PRD.",
  },
  {
    id: "lookbook-3",
    title: "Editorial scene placeholder",
    description:
      "Placeholder composition card only. No media CMS or content retrieval is implemented yet.",
  },
  {
    id: "lookbook-4",
    title: "Home styling vignette placeholder",
    description:
      "Reserved for future curated imagery and narrative copy associated with the lookbook layer.",
  },
] as const;

export const testimonials: Testimonial[] = [
  {
    id: "testimonial-1",
    quote:
      "Placeholder testimonial content preserving the testimonials listing surface described in the PRD.",
    customerName: "Studio Client",
    location: "United States",
    sortOrder: 1,
  },
  {
    id: "testimonial-2",
    quote:
      "This section remains static for now, but the layout is ready to receive final customer stories later.",
    customerName: "Editorial Buyer",
    location: "United States",
    sortOrder: 2,
  },
  {
    id: "testimonial-3",
    quote:
      "A trust-focused presentation is in place here without introducing review systems or external integrations.",
    customerName: "Home Decor Client",
    location: "United States",
    sortOrder: 3,
  },
] as const;

export const policyPages: PolicyPage[] = [
  {
    slug: "shipping-policy",
    title: "Shipping policy",
    body: [
      "This static placeholder policy preserves the launch rule that shipping is United States only.",
      "The PRD also defines launch shipping as fixed at $0.00.",
      "Operational shipping software, rate providers, and fulfillment tooling are not implemented in this slice.",
    ].join("\n\n"),
    seoTitle: "Shipping policy | Loom & Hearth Studio",
    seoDescription: "Placeholder shipping policy page for the launch policy surface.",
  },
  {
    slug: "returns-policy",
    title: "Returns policy",
    body: [
      "This is a placeholder returns policy shell only.",
      "It preserves the policy page structure and reading rhythm so final legal or operational copy can replace it later.",
      "No policy management workflow or external compliance tooling is implemented here.",
    ].join("\n\n"),
    seoTitle: "Returns policy | Loom & Hearth Studio",
    seoDescription: "Placeholder returns policy page for the launch policy surface.",
  },
  {
    slug: "privacy-policy",
    title: "Privacy policy",
    body: [
      "This placeholder privacy policy reserves the route and content structure required by the PRD.",
      "Cookie consent and privacy tooling are not implemented in this slice.",
      "Final policy text should be validated before production use.",
    ].join("\n\n"),
    seoTitle: "Privacy policy | Loom & Hearth Studio",
    seoDescription: "Placeholder privacy policy page for the launch policy surface.",
  },
  {
    slug: "terms-and-conditions",
    title: "Terms and conditions",
    body: [
      "This static placeholder shell preserves the terms and conditions route from the PRD.",
      "It is intended for future replacement with validated legal and operational copy.",
      "No acceptance flow or legal workflow is implemented in this slice.",
    ].join("\n\n"),
    seoTitle: "Terms and conditions | Loom & Hearth Studio",
    seoDescription: "Placeholder terms page for the launch policy surface.",
  },
] as const;
