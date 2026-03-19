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
  title: "A direct source for handcrafted Moroccan rugs, poufs, pillows, and home decor.",
  body:
    "Loom & Hearth Studio is built on real roots in Marrakech, where our family has worked in the bazaar trade for decades. Our grandfather’s shop in the Semmarine souk, steps from Jemaa el-Fnaa, was known for handcrafted pieces sourced across Morocco.\n\nToday, we continue that work with a more focused approach — selecting Moroccan rugs, transforming some into one-of-one poufs and pillows, and curating decor with a clear point of view.\n\nEvery piece is chosen in person, not mass-produced, and not sourced from generic export catalogs. The goal is simple: bring objects with real material depth and character into homes that value design.\n\nAll orders ship directly from Morocco within 5–7 business days, with shipping and customs already included in the final price — no surprises at delivery.",
} as const;

export const aboutSections: AboutSection[] = [
  {
    eyebrow: "Craft",
    title: "Rooted in Moroccan sourcing, material knowledge, and direct selection.",
    body:
      "We work directly with artisans, souks, and trusted suppliers across Morocco, selecting pieces based on texture, construction, and presence — not trends. Many items are one-of-one, and even repeatable designs remain handmade, which means no two pieces are exactly alike.\n\nOur poufs and pillows are often made from rugs or rug materials, giving them the same depth, irregularity, and character as the originals they come from.",
  },
  {
    eyebrow: "Direction",
    title: "Built for interiors that value texture, warmth, and individuality.",
    body:
      "Loom & Hearth Studio is not a marketplace and not a mass-production brand. The collection is intentionally focused on Moroccan rugs, rug-based poufs, pillows, and supporting decor — pieces that work together and build a coherent interior.\n\nThe direction is simple: fewer, better objects with real presence. Pieces that feel collected over time, not selected from a catalog.",
  },
] as const;

export const aboutBridge = {
  eyebrow: "How we source",
  title: "Selected in person, not pulled from a catalog.",
  body:
    "We work directly across Morocco to source handcrafted rugs, rug-based poufs and pillows, and supporting decor with real texture, construction, and presence. The process is hands-on by design, so the collection stays focused, distinctive, and materially honest.",
} as const;

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
      "Loom & Hearth Studio currently accepts launch orders shipping to addresses within the United States only. Orders with non-United States shipping destinations are not supported in the current checkout flow.",
      "Launch shipping is fixed at $0.00 for eligible orders. Storefront pricing and checkout totals are shown in USD, and the current launch checkout remains limited to that market and currency configuration.",
      "Order handling timelines, carrier selection, tracking workflows, and other fulfillment operations remain intentionally generic in this policy because the underlying shipping-provider and broader fulfillment tooling decisions are still unresolved in the current implementation state.",
      "If an order cannot be fulfilled to the submitted United States address after purchase, Loom & Hearth Studio may contact the customer using the order email address to resolve the issue or cancel and refund the order when shipment is not possible.",
    ].join("\n\n"),
    seoTitle: "Shipping policy | Loom & Hearth Studio",
    seoDescription: "Shipping policy for the Loom & Hearth Studio United States launch.",
  },
  {
    slug: "returns-policy",
    title: "Returns policy",
    body: [
      "Loom & Hearth Studio publishes this page to explain the launch returns surface, but detailed operational return rules remain conservative until broader fulfillment and support workflows are finalized.",
      "Customers who need help with an order should reply to their order confirmation email and include the order number and a summary of the issue. Loom & Hearth Studio will review the request and respond using the email address associated with the order.",
      "Because launch operations are intentionally narrow, this policy does not commit to automatic return labels, exchange workflows, or carrier-specific processes. Any approved return or refund handling will be communicated directly with the customer based on the order details and current launch operating constraints.",
      "Nothing on this page changes a customer’s non-waivable legal rights where those rights apply. More detailed return windows, exchange terms, and exception rules remain intentionally generic here because those operational decisions are not yet committed elsewhere in the repo state.",
    ].join("\n\n"),
    seoTitle: "Returns policy | Loom & Hearth Studio",
    seoDescription: "Returns policy information for the Loom & Hearth Studio launch.",
  },
  {
    slug: "privacy-policy",
    title: "Privacy policy",
    body: [
      "Loom & Hearth Studio collects the information required to operate the current launch storefront and order flow. That may include customer contact details, shipping details, cart and checkout information, and payment-related order references needed to process and support a purchase.",
      "The current launch stack includes Stripe Checkout for payment processing, Postmark for transactional order confirmation email delivery, and PostgreSQL with Prisma for persisted order data. Payment card details are handled by Stripe Checkout rather than being stored directly by Loom & Hearth Studio in this repo’s current implementation.",
      "Customer information may be used to create and manage orders, send transactional confirmation messages, review order status, and support customer service requests connected to an existing purchase. The current repo state does not implement newsletter signup workflows, broader marketing automation, or real customer account authentication.",
      "Cookie consent tooling, expanded privacy controls, retention scheduling, and jurisdiction-specific privacy workflows remain intentionally generic on this page because those implementation decisions are not yet finalized in the committed launch stack.",
    ].join("\n\n"),
    seoTitle: "Privacy policy | Loom & Hearth Studio",
    seoDescription: "Privacy policy for the current Loom & Hearth Studio launch stack.",
  },
  {
    slug: "terms-and-conditions",
    title: "Terms and conditions",
    body: [
      "By using the Loom & Hearth Studio storefront, you agree to use the site only for lawful purposes and to provide accurate information when placing an order through the launch checkout flow.",
      "All storefront prices and launch checkout totals are shown in USD. The current launch checkout supports shipping within the United States only, and Stripe Checkout is the only supported payment path in the committed implementation.",
      "Product details, pricing, and availability are presented for the launch catalog and may change before an order is submitted. Loom & Hearth Studio reserves the right to correct site errors, update catalog information, or decline or cancel an order when the submitted information cannot be honored within the current launch operating constraints.",
      "These terms remain intentionally conservative and generic where broader legal, tax, shipping-provider, fulfillment, and account-authentication decisions are still unresolved in the repo. More detailed contractual terms beyond those confirmed launch facts are not implied by this page.",
    ].join("\n\n"),
    seoTitle: "Terms and conditions | Loom & Hearth Studio",
    seoDescription: "Terms and conditions for the Loom & Hearth Studio launch storefront.",
  },
] as const;
