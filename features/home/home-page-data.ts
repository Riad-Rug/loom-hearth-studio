import { siteConfig } from "@/config/site";

export const homepageSectionOrderKeys = [
  "hero",
  "badges",
  "featured",
  "proof",
  "howItWorks",
  "brandStory",
  "designDirection",
  "guide",
  "faq",
  "newsletter",
] as const;

export const homepageSectionKeys = [...homepageSectionOrderKeys, "categories", "footer"] as const;

export type HomePageSectionKey = (typeof homepageSectionKeys)[number];
export type HomePageOrderedSectionKey = (typeof homepageSectionOrderKeys)[number];

export const homepageSectionDefinitions: Record<
  HomePageSectionKey,
  { label: string; description: string }
> = {
  hero: {
    label: "Hero",
    description: "Lead heading, summary, calls to action, and the primary hero image.",
  },
  badges: {
    label: "Value badges",
    description: "Four supporting proof points shown directly under the hero.",
  },
  categories: {
    label: "Categories",
    description: "Merchandising cards for the main collection categories.",
  },
  brandStory: {
    label: "Brand story",
    description: "Editorial card linking back to the studio story.",
  },
  designDirection: {
    label: "Design direction",
    description: "Editorial card that frames the visual point of view.",
  },
  featured: {
    label: "Featured collections",
    description: "Three featured collection or product direction cards.",
  },
  proof: {
    label: "Buyer proof",
    description: "Comparison points that explain why shoppers should buy from this store.",
  },
  howItWorks: {
    label: "How it works",
    description: "Purchase flow and color-verification steps shown on the homepage.",
  },
  guide: {
    label: "Educational guide",
    description: "SEO-supporting educational copy block on the homepage.",
  },
  newsletter: {
    label: "Newsletter",
    description: "Signup prompt with editable copy and call to action.",
  },
  faq: {
    label: "FAQ",
    description: "Pre-purchase questions that reduce buyer hesitation before the footer.",
  },
  footer: {
    label: "Footer",
    description: "Structured footer intro and navigation groups used site-wide.",
  },
};

export type HomePageLink = {
  label: string;
  href: string;
};

export type HomePageSeoFields = {
  seoTitle: string;
  metaDescription: string;
};

export type HomePageImage = {
  src: string;
  alt: string;
  publicId: string;
  width: number | null;
  height: number | null;
};

export type HomePageButton = {
  label: string;
  href: string;
  visible: boolean;
};

export type HomePageSectionSettings = {
  visible: boolean;
  seo: HomePageSeoFields;
};

export type HomePageBadgeItem = {
  id: string;
  label: string;
  visible: boolean;
};

export type HomePageImageCard = {
  id: string;
  title: string;
  description: string;
  href: string;
  visible: boolean;
  eyebrow?: string;
  priceLabel?: string;
  image: HomePageImage;
};

export type HomePageFaqItem = {
  id: string;
  question: string;
  answer: string;
  visible: boolean;
};

export type HomePageNarrativeSection = HomePageSectionSettings & {
  eyebrow: string;
  title: string;
  paragraph: string;
  linkLabel: string;
  href: string;
};

export type HomePageContent = {
  brand: {
    logoText: string;
    logoImageUrl: string;
    logoImageAlt: string;
    tagline: string;
  };
  pageSeo: {
    title: string;
    description: string;
  };
  sectionOrder: HomePageOrderedSectionKey[];
  hero: HomePageSectionSettings & {
    eyebrow: string;
    title: string;
    paragraph: string;
    primaryCta: HomePageButton;
    secondaryCta: HomePageButton;
    image: HomePageImage;
  };
  badges: HomePageSectionSettings & {
    items: HomePageBadgeItem[];
  };
  categories: HomePageSectionSettings & {
    eyebrow: string;
    title: string;
    paragraph: string;
    cards: HomePageImageCard[];
  };
  brandStory: HomePageNarrativeSection;
  designDirection: HomePageNarrativeSection;
  featured: HomePageSectionSettings & {
    eyebrow: string;
    title: string;
    paragraph: string;
    cards: HomePageImageCard[];
  };
  proof: HomePageSectionSettings;
  howItWorks: HomePageSectionSettings;
  guide: HomePageSectionSettings & {
    eyebrow: string;
    title: string;
    paragraph: string;
  };
  newsletter: HomePageSectionSettings & {
    eyebrow: string;
    title: string;
    paragraph: string;
    inputLabel: string;
    inputPlaceholder: string;
    ctaLabel: string;
  };
  faq: HomePageSectionSettings & {
    eyebrow: string;
    title: string;
    paragraph: string;
    items: HomePageFaqItem[];
  };
  footer: HomePageSectionSettings & {
    introTitle: string;
    introBody: string;
    introMeta: string;
    exploreHeading: string;
    exploreLinks: HomePageLink[];
    supportHeading: string;
    supportLinks: HomePageLink[];
    collectionsHeading: string;
    collectionLinks: HomePageLink[];
  };
};

const allowedImageHosts = new Set([
  "images.pexels.com",
  "images.unsplash.com",
  "res.cloudinary.com",
]);

const defaultHomePageContent: HomePageContent = {
  brand: {
    logoText: siteConfig.name,
    logoImageUrl: "/brand/logo.png",
    logoImageAlt: `${siteConfig.name} logo`,
    tagline: siteConfig.tagline,
  },
  pageSeo: {
    title: "Loom & Hearth Studio  Handcrafted Moroccan Rugs",
    description:
      "Hand-knotted Moroccan rugs, poufs, cactus silk pillows, and decor sourced directly across Morocco. Family business. 80 years in the trade. Free shipping to the US, Canada, and Australia.",
  },
  sectionOrder: [...homepageSectionOrderKeys],
  hero: {
    visible: true,
    seo: {
      seoTitle: "Loom & Hearth Studio  Handcrafted Moroccan Rugs",
      metaDescription:
        "Hand-knotted Moroccan rugs, poufs, cactus silk pillows, and decor sourced directly across Morocco. Family business. 80 years in the trade. Free shipping to the US, Canada, and Australia.",
    },
    eyebrow: "COLOUR VERIFIED BEFORE PAYMENT",
    title: "Hand-knotted Moroccan rugs from a family that has worked this trade for 80 years.",
    paragraph:
      "Hand-knotted rugs, poufs, cactus silk pillows, and handcrafted decor  selected in person across Morocco, not pulled from an export catalogue.",
    primaryCta: {
      label: "SHOP RUGS",
      href: "/shop/rugs",
      visible: true,
    },
    secondaryCta: {
      label: "VIEW THE LOOKBOOK",
      href: "/lookbook",
      visible: true,
    },
    image: {
      src: "https://images.pexels.com/photos/31371121/pexels-photo-31371121.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=960",
      alt: "A Moroccan sitting room with wool textiles, carved wood, and handmade furnishings",
      publicId: "",
      width: null,
      height: null,
    },
  },
  badges: {
    visible: true,
    seo: {
      seoTitle: "Moroccan home decor value highlights | Loom & Hearth Studio",
      metaDescription:
        "Direct sourcing, launch-market shipping to the United States, Canada, and Australia, and a confirm-before-capture model shape the homepage value highlights.",
    },
    items: [
      { id: "badge-1", label: "Direct from Morocco", visible: true },
      {
        id: "badge-2",
        label: "Free shipping to the United States, Canada, and Australia",
        visible: true,
      },
      { id: "badge-3", label: "Colour verified before payment is captured", visible: true },
      { id: "badge-4", label: "14-day returns", visible: true },
    ],
  },
  categories: {
    visible: true,
    seo: {
      seoTitle: "Shop Moroccan rugs, poufs, pillows, and decor by category.",
      metaDescription:
        "Browse Moroccan rugs, vintage rugs, rug-made poufs, cactus silk pillows, and decor through a structured category section on the homepage.",
    },
    eyebrow: "SHOP BY CATEGORY",
    title: "The full collection  rugs, poufs, pillows, decor, and vintage finds.",
    paragraph:
      "The collection is built around hand-knotted Moroccan rugs selected for construction quality, pile density, and weight. Supporting pieces  rug-made poufs, cactus silk pillows, and handcrafted decor  are chosen to work alongside them.",
    cards: [
      {
        id: "category-rugs",
        title: "Moroccan Rugs",
        href: "/shop/rugs",
        visible: true,
        description:
          "Hand-knotted rugs selected for pile density, construction depth, and weight underfoot.",
        image: {
          src: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
          alt: "Handmade Moroccan rug in a warm neutral living room with soft natural light",
          publicId: "",
          width: null,
          height: null,
        },
      },
      {
        id: "category-poufs",
        title: "Poufs",
        href: "/shop/poufs",
        visible: true,
        description:
          "Rug-made and leather poufs. Functional seating with a quieter footprint than upholstered furniture.",
        image: {
          src: "https://images.pexels.com/photos/36167991/pexels-photo-36167991.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1200",
          alt: "Moroccan leather pouf styled in a tactile interior with warm linen textures",
          publicId: "",
          width: null,
          height: null,
        },
      },
      {
        id: "category-pillows",
        title: "Pillows",
        href: "/shop/pillows",
        visible: true,
        description:
          "Cactus silk and rug-based pillows. Flat-woven, low-shed, with strong colour saturation.",
        image: {
          src: "https://images.pexels.com/photos/31371152/pexels-photo-31371152/free-photo-of-warm-moroccan-sunlight-on-traditional-cushions.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          alt: "Cactus silk pillows in Moroccan sunlight with woven textiles",
          publicId: "",
          width: null,
          height: null,
        },
      },
      {
        id: "category-decor",
        title: "Decor",
        href: "/shop/decor",
        visible: true,
        description:
          "Handcrafted Moroccan objects selected for shelves, consoles, and flat surfaces.",
        image: {
          src: "https://images.pexels.com/photos/31371121/pexels-photo-31371121.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=960",
          alt: "Moroccan decor with carved wood, ceramics, and woven textiles",
          publicId: "",
          width: null,
          height: null,
        },
      },
      {
        id: "category-vintage",
        title: "Vintage Rugs",
        href: "/shop/rugs/vintage",
        visible: true,
        description:
          "One-of-one vintage Moroccan rugs. Selected for construction integrity, visible age, and pile condition.",
        image: {
          src: "https://images.pexels.com/photos/28582589/pexels-photo-28582589.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1600",
          alt: "Vintage Moroccan rugs displayed in a warm showroom with visible patina and texture",
          publicId: "",
          width: null,
          height: null,
        },
      },
    ],
  },
  brandStory: {
    visible: true,
    seo: {
      seoTitle: "Brand story | Loom & Hearth Studio",
      metaDescription:
        "Read how Loom & Hearth Studio builds the collection through direct sourcing in Morocco and a sharp point of view on craft and material quality.",
    },
    eyebrow: "WHO WE ARE",
    title: "Sourced across Morocco. Selected in person. Shipped directly to you.",
    paragraph:
      "Loom & Hearth Studio is a family operation. My mother manages our bazaar in the Semmarine souk in Marrakech  a business with close to 80 years of history in the trade. We travel together across Morocco  to villages in the Atlas Mountains, to smaller workshops, to early morning markets where weavers and collectors trade before dawn  to find pieces that cannot be sourced from a catalogue. We work directly with the people who make them. We cut out the intermediaries who have historically taken the margin that should go to the artisans. That is the sourcing model. It is not scalable in the way a catalogue business is. That is the point.",
    linkLabel: "READ THE FULL STORY",
    href: "/about",
  },
  designDirection: {
    visible: true,
    seo: {
      seoTitle: "Design direction | Loom & Hearth Studio",
      metaDescription:
        "See the design direction behind the collection: stacked textiles, wool, wood, quiet contrast, and handcrafted accents with lasting weight.",
    },
    eyebrow: "DESIGN DIRECTION",
    title: "Pieces chosen for what they are made of. Not for how they photograph.",
    paragraph:
      "The collection stays focused: hand-knotted Moroccan rugs, rug-based poufs, pillows, and a small selection of supporting decor. Every piece is evaluated on construction  pile density, knot structure, material weight, and colour consistency across the field. A rug that photographs well but sheds heavily or compresses under foot traffic within two years is not a piece we will sell.",
    linkLabel: "VIEW THE LOOKBOOK",
    href: "/lookbook",
  },
  featured: {
    visible: true,
    seo: {
      seoTitle: "Featured Moroccan collections | Loom & Hearth Studio",
      metaDescription:
        "Start with the signature homepage categories: Moroccan rugs, rug-made poufs, cactus silk pillows, handcrafted decor, and vintage finds.",
    },
    eyebrow: "SHOP FIRST",
    title: "Choose the category first, then the exact piece.",
    paragraph: "Rugs, poufs, pillows, decor, and vintage finds in one edited collection.",
    cards: [
      {
        id: "featured-rugs",
        title: "One-of-One Moroccan Rugs",
        description:
          "Hand-knotted Moroccan rugs selected for pile density, weight, and long-term durability.",
        priceLabel: "SHOP RUGS",
        href: "/shop/rugs",
        visible: true,
        image: {
          src: "https://images.pexels.com/photos/36202808/pexels-photo-36202808.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=1200",
          alt: "Close crop of a colorful handwoven Moroccan rug showing its geometric pattern and wool texture",
          publicId: "",
          width: null,
          height: null,
        },
      },
      {
        id: "featured-poufs",
        title: "Rug-Made and Leather Poufs",
        description:
          "Poufs selected for construction quality, filling density, and everyday use.",
        priceLabel: "SHOP POUFS",
        href: "/shop/poufs",
        visible: true,
        image: {
          src: "https://images.pexels.com/photos/36167991/pexels-photo-36167991.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=1200",
          alt: "A Moroccan leather pouf shown in full view with clean natural styling",
          publicId: "",
          width: null,
          height: null,
        },
      },
      {
        id: "featured-pillows",
        title: "Cactus Silk Pillows",
        description:
          "Flat-woven cactus silk. Low-shed, with strong colour saturation and a quieter surface than wool pile.",
        priceLabel: "SHOP PILLOWS",
        href: "/shop/pillows",
        visible: true,
        image: {
          src: "https://images.pexels.com/photos/11537258/pexels-photo-11537258.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=1200",
          alt: "Square crop of colorful Moroccan throw pillows and woven textiles in natural light",
          publicId: "",
          width: null,
          height: null,
        },
      },
      {
        id: "featured-decor",
        title: "Handcrafted Decor",
        description: "Handcrafted Moroccan objects selected for shelves, consoles, and flat surfaces.",
        priceLabel: "SHOP DECOR",
        href: "/shop/decor",
        visible: true,
        image: {
          src: "https://images.pexels.com/photos/31371121/pexels-photo-31371121.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=960",
          alt: "Moroccan decor with carved wood, ceramics, and woven textiles",
          publicId: "",
          width: null,
          height: null,
        },
      },
      {
        id: "featured-vintage",
        title: "Vintage Moroccan Rugs",
        description:
          "One-of-one vintage Moroccan rugs selected for construction integrity, visible age, and pile condition.",
        priceLabel: "SHOP VINTAGE",
        href: "/shop/rugs/vintage",
        visible: true,
        image: {
          src: "https://images.pexels.com/photos/28582589/pexels-photo-28582589.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1600",
          alt: "Vintage Moroccan rugs displayed in a warm showroom with visible patina and texture",
          publicId: "",
          width: null,
          height: null,
        },
      },
    ],
  },
  proof: {
    visible: true,
    seo: {
      seoTitle: "Why buy Moroccan rugs here | Loom & Hearth Studio",
      metaDescription:
        "Learn how Loom & Hearth Studio sources exact Moroccan pieces, verifies color before payment capture, and sells one-of-one handmade inventory.",
    },
  },
  howItWorks: {
    visible: true,
    seo: {
      seoTitle: "How ordering works | Loom & Hearth Studio",
      metaDescription:
        "See how Loom & Hearth Studio confirms color, destination details, and delivery conditions before capturing payment for handmade Moroccan pieces.",
    },
  },
  guide: {
    visible: true,
    seo: {
      seoTitle: "What makes Moroccan rugs unique? | Loom & Hearth Studio",
      metaDescription:
        "Learn what makes Moroccan rugs distinctive, from handwoven texture and plush wool to vintage patina, movement, and visible age.",
    },
    eyebrow: "KNOW WHAT YOU ARE BUYING",
    title: "What separates a hand-knotted Moroccan rug from everything else on the market.",
    paragraph:
      "A hand-knotted Moroccan rug is built knot by knot onto a warp structure. The weight of the finished piece reflects how densely it was knotted  and density is the primary indicator of how the rug will perform over time. Machine-made and tufted rugs use a backing adhesive to hold the pile. That adhesive degrades. The knot structure in a hand-knotted rug does not. A well-knotted piece bought today should still be in the room  and worth something  in thirty years.",
  },
  newsletter: {
    visible: true,
    seo: {
      seoTitle: "Newsletter signup | Loom & Hearth Studio",
      metaDescription:
        "Join for a free Moroccan rug sourcing guide, plus new arrivals, vintage finds, lookbook updates, and early access to handcrafted releases.",
    },
    eyebrow: "JOIN THE LIST",
    title: "New arrivals, sourcing stories, and first access to pieces before wider release.",
    paragraph:
      "Join for a free sourcing guide: 10 things to check before buying a Moroccan rug. You will also get new arrivals, sourcing stories, and first access to pieces before wider release. No filler.",
    inputLabel: "Email address",
    inputPlaceholder: "Your email address",
    ctaLabel: "JOIN",
  },
  faq: {
    visible: true,
    seo: {
      seoTitle: "Moroccan rug buying questions | Loom & Hearth Studio",
      metaDescription:
        "Answers to common questions about exact-piece Moroccan rugs, room fit, shipping, duties, returns, and what is included in the price.",
    },
    eyebrow: "BEFORE YOU BUY",
    title: "Questions buyers ask before choosing a one-of-one rug.",
    paragraph:
      "A rug is a considered purchase. These are the details we confirm before you commit.",
    items: [
      {
        id: "faq-exact-rug",
        question: "Is my rug really the exact one I will receive?",
        answer:
          "Yes. One-of-one rugs are listed as exact pieces, not representative samples. Before payment is captured, we confirm the actual rug with you through the inquiry and verification flow.",
        visible: true,
      },
      {
        id: "faq-space-fit",
        question: "What if it does not work in my space?",
        answer:
          "Ask before committing. We can review room photos, dimensions, light, and nearby finishes to help judge scale and color. If it still is not right after delivery, eligible pieces have a 14-day return window.",
        visible: true,
      },
      {
        id: "faq-shipping",
        question: "How long does shipping take?",
        answer:
          "Pieces ship from Morocco in 5 to 7 business days after final confirmation. Delivery is tracked through DHL for supported launch markets.",
        visible: true,
      },
      {
        id: "faq-price-included",
        question: "What is included in the price?",
        answer:
          "The listed price includes the piece, pre-shipment verification, DHL tracked delivery, and duties to the United States, Canada, and Australia. Prices are shown in USD.",
        visible: true,
      },
      {
        id: "faq-color",
        question: "How do I know the color is accurate?",
        answer:
          "We review color before payment is captured and can show the piece in natural, warm, and cool light so you are not relying on a single styled photograph.",
        visible: true,
      },
      {
        id: "faq-handmade-variation",
        question: "Will a handmade rug have irregularities?",
        answer:
          "Yes, and that is part of the value when the structure is sound. Handmade and vintage pieces can show variation in edge line, pile height, tone, and age. Condition notes are reviewed against the exact piece.",
        visible: true,
      },
    ],
  },
  footer: {
    visible: true,
    seo: {
      seoTitle: "Footer navigation | Loom & Hearth Studio",
      metaDescription:
        "Structured footer content covering primary navigation, support links, and collection shortcuts for the Loom & Hearth Studio storefront.",
    },
    introTitle: siteConfig.name,
    introBody: "",
    introMeta: "Prices in USD. Free shipping to the US, Canada, and Australia.",
    exploreHeading: "Explore",
    exploreLinks: [
      { href: "/shop", label: "Shop" },
      { href: "/lookbook", label: "Lookbook" },
      { href: "/about", label: "About" },
      { href: "/sourcing", label: "Sourcing" },
      { href: "/blog", label: "Journal" },
      { href: "/trade", label: "Trade" },
    ],
    supportHeading: "Support",
    supportLinks: siteConfig.supportNav.map((item) => ({ ...item })),
    collectionsHeading: "Collections",
    collectionLinks: [
      { href: "/shop/rugs", label: "Moroccan rugs" },
      { href: "/shop/rugs/vintage", label: "Vintage rugs" },
      { href: "/shop/poufs", label: "Poufs" },
      { href: "/shop/pillows", label: "Pillows" },
      { href: "/shop/decor", label: "Home decor" },
    ],
  },
};

export function createDefaultHomePageContent(): HomePageContent {
  return structuredClone(defaultHomePageContent);
}

export function sanitizeHomePageContent(input: unknown): HomePageContent {
  const source = asRecord(input);
  const defaults = createDefaultHomePageContent();
  const legacyHero = asRecord(source.hero);
  const legacyCategories = asRecord(source.categoriesSection);
  const legacyFeatured = asRecord(source.featuredDirections);
  const legacyGuide = asRecord(source.moroccanRugsGuide);

  return {
    brand: {
      logoText: readString(source.brand, "logoText", defaults.brand.logoText),
      logoImageUrl: readString(source.brand, "logoImageUrl", defaults.brand.logoImageUrl),
      logoImageAlt: readString(source.brand, "logoImageAlt", defaults.brand.logoImageAlt),
      tagline: readString(source.brand, "tagline", defaults.brand.tagline),
    },
    pageSeo: {
      title: readString(source.pageSeo, "title", defaults.pageSeo.title),
      description: readString(source.pageSeo, "description", defaults.pageSeo.description),
    },
    sectionOrder: readSectionOrder(source.sectionOrder, defaults.sectionOrder),
    hero: {
      ...readSectionSettings(source.hero, defaults.hero),
      visible: true,
      eyebrow: readString(source.hero, "eyebrow", defaults.hero.eyebrow),
      title: readString(source.hero, "title", defaults.hero.title),
      paragraph: readString(source.hero, "paragraph", defaults.hero.paragraph),
      primaryCta: readButton(
        legacyHero.primaryCta,
        defaults.hero.primaryCta,
        readString(source.hero, "primaryCtaLabel", defaults.hero.primaryCta.label),
        readString(source.hero, "primaryCtaLink", defaults.hero.primaryCta.href),
      ),
      secondaryCta: readButton(
        legacyHero.secondaryCta,
        defaults.hero.secondaryCta,
        readString(source.hero, "secondaryCtaLabel", defaults.hero.secondaryCta.label),
        readString(source.hero, "secondaryCtaLink", defaults.hero.secondaryCta.href),
      ),
      image: readImage(
        legacyHero.image,
        defaults.hero.image,
        readString(source.hero, "imageSrc", defaults.hero.image.src),
        readString(source.hero, "imageAlt", defaults.hero.image.alt),
      ),
    },
    badges: {
      ...readSectionSettings(source.badges, defaults.badges),
      items: readBadgeArray(
        source.badges,
        "items",
        defaults.badges.items,
        source.trustItems,
      ),
    },
    categories: {
      ...readSectionSettings(legacyCategories.cards ? legacyCategories : source.categories, defaults.categories),
      eyebrow: readString(source.categories ?? source.categoriesSection, "eyebrow", defaults.categories.eyebrow),
      title: readString(source.categories ?? source.categoriesSection, "title", defaults.categories.title),
      paragraph: readString(source.categories ?? source.categoriesSection, "paragraph", defaults.categories.paragraph),
      cards: readImageCardArray(
        source.categories ?? source.categoriesSection,
        "cards",
        defaults.categories.cards,
      ),
    },
    brandStory: readNarrativeSection(source.brandStory, defaults.brandStory),
    designDirection: readNarrativeSection(source.designDirection, defaults.designDirection),
    featured: {
      ...readSectionSettings(legacyFeatured.cards ? legacyFeatured : source.featured, defaults.featured),
      eyebrow: readString(source.featured ?? source.featuredDirections, "eyebrow", defaults.featured.eyebrow),
      title: readString(source.featured ?? source.featuredDirections, "title", defaults.featured.title),
      paragraph: readString(source.featured ?? source.featuredDirections, "paragraph", readString(source.featuredDirections, "intro", defaults.featured.paragraph)),
      cards: readImageCardArray(
        source.featured ?? source.featuredDirections,
        "cards",
        defaults.featured.cards,
      ),
    },
    proof: readSectionSettings(source.proof, defaults.proof),
    howItWorks: readSectionSettings(source.howItWorks, defaults.howItWorks),
    guide: {
      ...readSectionSettings(legacyGuide.title ? legacyGuide : source.guide, defaults.guide),
      eyebrow: readString(source.guide ?? source.moroccanRugsGuide, "eyebrow", defaults.guide.eyebrow),
      title: readString(source.guide ?? source.moroccanRugsGuide, "title", defaults.guide.title),
      paragraph: readString(source.guide ?? source.moroccanRugsGuide, "paragraph", defaults.guide.paragraph),
    },
    newsletter: {
      ...readSectionSettings(source.newsletter, defaults.newsletter),
      eyebrow: readString(source.newsletter, "eyebrow", defaults.newsletter.eyebrow),
      title: readString(source.newsletter, "title", defaults.newsletter.title),
      paragraph: readString(source.newsletter, "paragraph", defaults.newsletter.paragraph),
      inputLabel: readString(source.newsletter, "inputLabel", defaults.newsletter.inputLabel),
      inputPlaceholder: readString(source.newsletter, "inputPlaceholder", defaults.newsletter.inputPlaceholder),
      ctaLabel: readString(source.newsletter, "ctaLabel", defaults.newsletter.ctaLabel),
    },
    faq: {
      ...readSectionSettings(source.faq, defaults.faq),
      eyebrow: readString(source.faq, "eyebrow", defaults.faq.eyebrow),
      title: readString(source.faq, "title", defaults.faq.title),
      paragraph: readString(source.faq, "paragraph", defaults.faq.paragraph),
      items: readFaqArray(source.faq, "items", defaults.faq.items),
    },
    footer: {
      ...readSectionSettings(source.footer, defaults.footer),
      introTitle: readString(source.footer, "introTitle", defaults.footer.introTitle),
      introBody: readString(source.footer, "introBody", defaults.footer.introBody),
      introMeta: readString(source.footer, "introMeta", defaults.footer.introMeta),
      exploreHeading: readString(source.footer, "exploreHeading", defaults.footer.exploreHeading),
      exploreLinks: dedupeLinks(readLinkArray(source.footer, "exploreLinks", defaults.footer.exploreLinks)),
      supportHeading: readString(source.footer, "supportHeading", defaults.footer.supportHeading),
      supportLinks: dedupeLinks(readLinkArray(source.footer, "supportLinks", defaults.footer.supportLinks)),
      collectionsHeading: readString(source.footer, "collectionsHeading", defaults.footer.collectionsHeading),
      collectionLinks: dedupeLinks(readLinkArray(source.footer, "collectionLinks", defaults.footer.collectionLinks)),
    },
  };
}

export function validateHomePageContent(content: HomePageContent) {
  const imageAssets = [
    { label: "Brand logo", image: { src: content.brand.logoImageUrl, alt: content.brand.logoImageAlt } },
    { label: "Hero image", image: content.hero.image },
    ...content.categories.cards.map((card) => ({ label: `${card.title} image`, image: card.image })),
    ...content.featured.cards.map((card) => ({ label: `${card.title} image`, image: card.image })),
  ].filter((item) => item.image.src.trim());

  if (imageAssets.some((item) => !isAllowedImageUrl(item.image.src))) {
    return {
      status: "invalid" as const,
      message:
        "Homepage image URLs must use HTTPS and one of the currently supported hosts: Cloudinary, Pexels, or Unsplash.",
    };
  }

  const missingAlt = imageAssets.find((item) => !item.image.alt.trim());

  if (missingAlt) {
    return {
      status: "invalid" as const,
      message: `${missingAlt.label} requires alt text before homepage content can be saved.`,
    };
  }

  const links = [
    content.hero.primaryCta.href,
    content.hero.secondaryCta.href,
    content.brandStory.href,
    content.designDirection.href,
    ...content.categories.cards.map((card) => card.href),
    ...content.featured.cards.map((card) => card.href),
    ...content.footer.exploreLinks.map((link) => link.href),
    ...content.footer.supportLinks.map((link) => link.href),
    ...content.footer.collectionLinks.map((link) => link.href),
  ];

  if (links.some((value) => value.trim() && !isSafeLink(value))) {
    return {
      status: "invalid" as const,
      message: "Homepage links must be internal paths or full HTTPS URLs.",
    };
  }

  return {
    status: "valid" as const,
    value: content,
  };
}

function readSectionOrder(value: unknown, fallback: HomePageOrderedSectionKey[]) {
  const items = Array.isArray(value) ? value : [];
  const next = items.filter(isOrderedSectionKey);

  return next.length === homepageSectionOrderKeys.length
    ? [...next]
    : [...fallback];
}

function readSectionSettings<T extends HomePageSectionSettings>(
  value: unknown,
  fallback: T,
): HomePageSectionSettings {
  return {
    visible: readBoolean(value, "visible", fallback.visible),
    seo: readSeoFields(asRecord(value).seo, fallback.seo),
  };
}

function readSeoFields(value: unknown, fallback: HomePageSeoFields): HomePageSeoFields {
  return {
    seoTitle: readString(value, "seoTitle", fallback.seoTitle),
    metaDescription: readString(value, "metaDescription", fallback.metaDescription),
  };
}

function readNarrativeSection(
  value: unknown,
  fallback: HomePageNarrativeSection,
): HomePageNarrativeSection {
  return {
    ...readSectionSettings(value, fallback),
    eyebrow: readString(value, "eyebrow", fallback.eyebrow),
    title: readString(value, "title", fallback.title),
    paragraph: readString(value, "paragraph", fallback.paragraph),
    linkLabel: readString(value, "linkLabel", fallback.linkLabel),
    href: readString(value, "href", fallback.href),
  };
}

function readButton(
  value: unknown,
  fallback: HomePageButton,
  legacyLabel: string,
  legacyHref: string,
): HomePageButton {
  return {
    label: readString(value, "label", legacyLabel || fallback.label),
    href: readString(value, "href", legacyHref || fallback.href),
    visible: readBoolean(value, "visible", fallback.visible),
  };
}

function readImage(
  value: unknown,
  fallback: HomePageImage,
  legacySrc?: string,
  legacyAlt?: string,
): HomePageImage {
  return {
    src: readString(value, "src", legacySrc || fallback.src),
    alt: readString(value, "alt", legacyAlt || fallback.alt),
    publicId: readString(value, "publicId", fallback.publicId),
    width: readNullableNumber(value, "width", fallback.width),
    height: readNullableNumber(value, "height", fallback.height),
  };
}

function readBadgeArray(
  value: unknown,
  key: string,
  fallback: HomePageBadgeItem[],
  legacyValue?: unknown,
): HomePageBadgeItem[] {
  const source = asRecord(value)[key];
  const items = Array.isArray(source) ? source : [];
  const legacyItems = Array.isArray(legacyValue) ? legacyValue : [];

  return fallback.map((defaultItem, index) => {
    const current = asRecord(items[index]);
    const legacyLabel = typeof legacyItems[index] === "string" ? String(legacyItems[index]) : "";

    return {
      id: readString(current, "id", defaultItem.id),
      label: readString(current, "label", legacyLabel || defaultItem.label),
      visible: readBoolean(current, "visible", defaultItem.visible),
    };
  });
}

function readImageCardArray(
  value: unknown,
  key: string,
  fallback: HomePageImageCard[],
): HomePageImageCard[] {
  const source = asRecord(value)[key];
  const items = Array.isArray(source) ? source : [];

  return fallback.map((defaultCard, index) => {
    const card = asRecord(items[index]);

    return {
      id: readString(card, "id", defaultCard.id),
      title: readString(card, "title", defaultCard.title),
      description: readString(card, "description", defaultCard.description),
      href: readString(card, "href", defaultCard.href),
      visible: readBoolean(card, "visible", defaultCard.visible),
      eyebrow: readOptionalString(card, "eyebrow", defaultCard.eyebrow),
      priceLabel: readOptionalString(card, "priceLabel", defaultCard.priceLabel),
      image: readImage(
        card.image,
        defaultCard.image,
        readString(card, "imageSrc", defaultCard.image.src),
        readString(card, "imageAlt", defaultCard.image.alt),
      ),
    };
  });
}

function readLinkArray(value: unknown, key: string, fallback: HomePageLink[]) {
  const source = asRecord(value)[key];
  const items = Array.isArray(source) ? source : [];

  return fallback.map((defaultLink, index) => {
    const link = asRecord(items[index]);

    return {
      label: readString(link, "label", defaultLink.label),
      href: readString(link, "href", defaultLink.href),
    };
  });
}

function readFaqArray(
  value: unknown,
  key: string,
  fallback: HomePageFaqItem[],
): HomePageFaqItem[] {
  const source = asRecord(value)[key];
  const items = Array.isArray(source) ? source : [];

  return fallback.map((defaultItem, index) => {
    const item = asRecord(items[index]);

    return {
      id: readString(item, "id", defaultItem.id),
      question: readString(item, "question", defaultItem.question),
      answer: readString(item, "answer", defaultItem.answer),
      visible: readBoolean(item, "visible", defaultItem.visible),
    };
  });
}

function dedupeLinks(links: HomePageLink[]) {
  const seen = new Set<string>();

  return links.filter((link) => {
    const key = `${link.href.trim().toLowerCase()}|${link.label.trim().toLowerCase()}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);

    return true;
  });
}

function readString(source: unknown, key: string, fallback: string) {
  const value = asRecord(source)[key];

  return typeof value === "string" ? value.trim() : fallback;
}

function readOptionalString(source: unknown, key: string, fallback?: string) {
  const value = asRecord(source)[key];

  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function readBoolean(source: unknown, key: string, fallback: boolean) {
  const value = asRecord(source)[key];

  return typeof value === "boolean"
    ? value
    : typeof value === "string"
      ? value === "true"
      : fallback;
}

function readNullableNumber(source: unknown, key: string, fallback: number | null) {
  const value = asRecord(source)[key];

  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function isSafeLink(value: string) {
  return value.startsWith("/") || value.startsWith("https://");
}

function isAllowedImageUrl(value: string) {
  try {
    const parsed = new URL(value);

    return parsed.protocol === "https:" && allowedImageHosts.has(parsed.hostname);
  } catch {
    return false;
  }
}

function isOrderedSectionKey(value: unknown): value is HomePageOrderedSectionKey {
  return typeof value === "string" && homepageSectionOrderKeys.includes(value as HomePageOrderedSectionKey);
}



