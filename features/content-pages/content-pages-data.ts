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
  ctaLabel: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
};

export const aboutHero = {
  eyebrow: "About",
  title: "A direct source for handcrafted Moroccan rugs, poufs, pillows, and home decor.",
  body: `Loom & Hearth Studio is built on real roots in Marrakech, where our family has worked in the bazaar trade for decades. Our grandfather's shop in the Semmarine souk, steps from Jemaa el-Fnaa, was known for handcrafted pieces sourced across Morocco.

Today, we continue that work with a more focused approach  selecting Moroccan rugs, transforming some into one-of-one poufs and pillows, and curating decor with a clear point of view.

Every piece is chosen in person, not mass-produced, and not sourced from generic export catalogs. The goal is simple: bring objects with real material depth and character into homes that value design.

All orders ship directly from Morocco within 57 business days, with shipping and customs already included in the final price  no surprises at delivery.`,
} as const;

export const aboutSections: AboutSection[] = [
  {
    eyebrow: "Craft",
    title: "Rooted in Moroccan sourcing, material knowledge, and direct selection.",
    body:
      "We work directly with artisans, souks, and trusted suppliers across Morocco, selecting pieces based on texture, construction, and presence \u2014 not trends. Many items are one-of-one, and even repeatable designs remain handmade, which means no two pieces are exactly alike.\n\nOur poufs and pillows are often made from rugs or rug materials, giving them the same depth, irregularity, and character as the originals they come from.",
  },
  {
    eyebrow: "Direction",
    title: "Built for interiors that value texture, warmth, and individuality.",
    body: `Loom & Hearth Studio is not a marketplace and not a mass-production brand. The collection is intentionally focused on Moroccan rugs, rug-based poufs, pillows, and supporting decor  pieces that work together and build a coherent interior.

The direction is simple: fewer, better objects with real presence. Pieces that feel collected over time, not selected from a catalog.`,
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
  title: "Contact Loom & Hearth Studio",
  body:
    "Contact Loom & Hearth Studio for inquiries about handmade Moroccan rugs, custom sourcing, vintage textiles, and curated home decor.",
  formTitle: "Send a customer inquiry",
  formBody:
    "Send us a message about a specific piece, a sourcing request, or any question about the collection. We review every message personally and respond within 24 hours.",
  ctaLabel: "Send message",
  supportTitle: "Studio support",
  supportBody:
    "Send us a message about a specific piece, a sourcing request, or any question about the collection. We review every message personally and respond within 24 hours.",
  reassuranceLabel: "Support note",
  reassuranceText:
    "Every inquiry about a rug includes a video of the actual piece before payment is taken. Include the product name and your room dimensions if you have them  it helps us respond with something useful.",
  responseTimeLabel: "Response timing",
  responseTimeText: "Within 24 hours",
  emailLabel: "hello@loomandhearthstudio.com",
  hoursLabel: "Monday to Friday, 9am  6pm CET",
  locationLabel: "Morocco sourcing studio - U.S. launch market",
} as const;

export const faqItems: FaqItem[] = [
  {
    id: "faq-1",
    group: "Shipping",
    question: "Will I receive tracking?",
    answer: "Yes, tracking is provided once your order ships.",
    sortOrder: 1,
  },
  {
    id: "faq-2",
    group: "Shipping",
    question: "Do I need to handle customs?",
    answer: "No, we take care of duties and customs.",
    sortOrder: 2,
  },
  {
    id: "faq-3",
    group: "Holds",
    question: "Can you reserve a rug for me?",
    answer:
      "We can place a temporary hold for account holders while you review a piece. Longer or paid holds can be arranged case by case.",
    sortOrder: 3,
  },
  {
    id: "faq-4",
    group: "Inquiry",
    question: "Can I see the rug before purchasing?",
    answer: "Yes, we send a video of the exact piece before payment.",
    sortOrder: 4,
  },
] as const;

export const lookbookItems: LookbookItem[] = [
  {
    id: "lookbook-1",
    title: "Modern Moroccan Living Room with Beni Ourain Rug",
    description:
      "A refined living room featuring a handwoven Beni Ourain rug paired with warm wood tones and natural light. Designed for a calm, textured, and grounded interior.",
    ctaLabel: "Shop Beni Ourain Rugs",
    href: "/shop/rugs",
    imageSrc:
      "https://images.pexels.com/photos/31371121/pexels-photo-31371121.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=960",
    imageAlt:
      "A warm Moroccan living room with layered seating, natural light, and a visible handcrafted rug anchoring the space.",
  },
  {
    id: "lookbook-2",
    title: "Handwoven Moroccan Rug Texture Detail",
    description:
      "Close-up view of traditional Moroccan weaving techniques, highlighting natural wool fibers, texture depth, and artisanal craftsmanship.",
    ctaLabel: "Explore Handmade Rugs",
    href: "/shop/rugs",
    imageSrc:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    imageAlt:
      "A close, textural view of a handmade Moroccan rug in a softly lit interior setting.",
  },
  {
    id: "lookbook-3",
    title: "Layered Moroccan Interior with Vintage Textiles",
    description:
      "A curated interior blending vintage Moroccan rugs, soft textiles, and earthy tones to create a rich, layered living environment.",
    ctaLabel: "Shop Vintage Rugs",
    href: "/shop/vintage",
    imageSrc:
      "https://images.pexels.com/photos/36167991/pexels-photo-36167991.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1200",
    imageAlt:
      "A layered interior scene with Moroccan textiles, a pouf, and warm earthy materials styled together.",
  },
  {
    id: "lookbook-4",
    title: "Minimal Moroccan Styling with Neutral Decor",
    description:
      "A minimalist approach to Moroccan decor using neutral palettes, soft textures, and subtle handcrafted elements for a modern aesthetic.",
    ctaLabel: "Discover Home Styling",
    href: "/shop/decor",
    imageSrc:
      "https://images.pexels.com/photos/31371152/pexels-photo-31371152/free-photo-of-warm-moroccan-sunlight-on-traditional-cushions.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    imageAlt:
      "A minimal Moroccan decor vignette with neutral textiles and handcrafted accents in warm sunlight.",
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
      "All orders ship directly from Morocco with Aramex or DHL.",
      "We offer international delivery with duties included in the final price.",
      "Rugs are rolled, wrapped in polypropylene, and boxed for international transit so they arrive protected and presentation-ready.",
    ].join("\n\n"),
    seoTitle: "Shipping policy | Loom & Hearth Studio",
    seoDescription:
      "Shipping policy for Loom & Hearth Studio orders shipped from Morocco with duties included for international delivery.",
  },
  {
    slug: "returns-policy",
    title: "Returns policy",
    body: [
      "Damaged items",
      "If your item arrives damaged, contact us within 48 hours of delivery with photos of the package and the item. If the damage is confirmed, we will arrange a replacement or a refund.",
    ].join("\n\n"),
    seoTitle: "Returns policy | Loom & Hearth Studio",
    seoDescription: "Returns policy information for the Loom & Hearth Studio launch.",
  },
  {
    slug: "privacy-policy",
    title: "Privacy policy",
    body: [
      "Loom & Hearth Studio collects the information required to operate the current launch storefront and order flow. That may include customer contact details, shipping details, cart and checkout information, and payment-related order references needed to process and support a purchase.",
      "The current launch stack includes Stripe Checkout for payment processing, Postmark for transactional order confirmation email delivery, and PostgreSQL with Prisma for persisted order data. Payment card details are handled by Stripe Checkout rather than being stored directly by Loom & Hearth Studio in this repo??????????????????????????????????????s current implementation.",
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


