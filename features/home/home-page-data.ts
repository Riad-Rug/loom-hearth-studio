import { siteConfig } from "@/config/site";

export type HomePageLink = {
  label: string;
  href: string;
};

export type HomePageImageCard = {
  title: string;
  description: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
};

export type HomePageContent = {
  brand: {
    logoText: string;
    logoImageUrl: string;
    logoImageAlt: string;
    tagline: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    paragraph: string;
    primaryCtaLabel: string;
    primaryCtaLink: string;
    secondaryCtaLabel: string;
    secondaryCtaLink: string;
    imageSrc: string;
    imageAlt: string;
  };
  trustItems: string[];
  categoriesSection: {
    eyebrow: string;
    title: string;
    paragraph: string;
    cards: HomePageImageCard[];
  };
  brandStory: {
    eyebrow: string;
    title: string;
    paragraph: string;
    href: string;
  };
  designDirection: {
    eyebrow: string;
    title: string;
    paragraph: string;
    href: string;
  };
  featuredDirections: {
    eyebrow: string;
    title: string;
    intro: string;
    cards: HomePageImageCard[];
  };
  moroccanRugsGuide: {
    eyebrow: string;
    title: string;
    paragraph: string;
  };
  newsletter: {
    eyebrow: string;
    title: string;
    paragraph: string;
    inputLabel: string;
    inputPlaceholder: string;
    ctaLabel: string;
  };
  footer: {
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
    logoImageUrl: "",
    logoImageAlt: `${siteConfig.name} logo`,
    tagline: siteConfig.tagline,
  },
  hero: {
    eyebrow: "Loom & Hearth Studio",
    title: "Shop handcrafted Moroccan rugs, poufs, pillows, and home decor.",
    paragraph:
      "Discover Moroccan rugs, vintage rugs, rug-made poufs, cactus silk pillows, and handcrafted decor selected for warmth, texture, and collected character. From plush Beni Ourain-inspired pieces to one-of-one vintage finds, each piece is chosen to bring artisanal depth into everyday interiors.",
    primaryCtaLabel: "Shop Moroccan rugs",
    primaryCtaLink: "/shop/rugs",
    secondaryCtaLabel: "View the lookbook",
    secondaryCtaLink: "/lookbook",
    imageSrc:
      "https://images.pexels.com/photos/31371121/pexels-photo-31371121.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=960",
    imageAlt:
      "A refined Moroccan sitting room with warm textiles, carved wood, and a quiet artisanal feel",
  },
  trustItems: [
    "Direct from Morocco",
    "United States delivery",
    "Duties included",
    "Curated launch selection",
  ],
  categoriesSection: {
    eyebrow: "Categories",
    title: "Shop Moroccan rugs, poufs, pillows, and decor by category.",
    paragraph:
      "Start with the pieces at the center of the collection: handcrafted Moroccan rugs, one-of-one vintage rugs, rug-made poufs, cactus silk pillows, and decor selected for warmth, texture, and character.",
    cards: [
      {
        title: "Moroccan Rugs",
        href: "/shop/rugs",
        description:
          "Handcrafted Moroccan rugs chosen for texture, material depth, and lasting presence in the room.",
        imageSrc:
          "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
        imageAlt:
          "Handmade Moroccan rug in a warm neutral living room with soft natural light",
      },
      {
        title: "Poufs",
        href: "/shop/poufs",
        description:
          "Rug-made and leather poufs that bring flexible function and a softer, more collected look.",
        imageSrc:
          "https://images.pexels.com/photos/36167991/pexels-photo-36167991.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1200",
        imageAlt: "Moroccan leather pouf styled in a tactile interior with warm linen textures",
      },
      {
        title: "Pillows",
        href: "/shop/pillows",
        description:
          "Cactus silk and rug-based pillows for color, contrast, and layered texture.",
        imageSrc:
          "https://images.pexels.com/photos/31371152/pexels-photo-31371152/free-photo-of-warm-moroccan-sunlight-on-traditional-cushions.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        imageAlt: "Cactus silk pillows layered in warm Moroccan sunlight with woven textiles",
      },
      {
        title: "Decor",
        href: "/shop/decor",
        description:
          "Handcrafted Moroccan decor selected to finish shelves, consoles, tables, and quiet corners.",
        imageSrc:
          "https://images.pexels.com/photos/31371121/pexels-photo-31371121.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=960",
        imageAlt:
          "Moroccan decor in a warm interior with carved wood, ceramics, and layered styling",
      },
      {
        title: "Vintage Rugs",
        href: "/shop/vintage",
        description:
          "One-of-one vintage Moroccan rugs chosen for patina, history, and collected appeal.",
        imageSrc:
          "https://images.pexels.com/photos/28582589/pexels-photo-28582589.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1600",
        imageAlt:
          "Vintage Moroccan rugs displayed in a warm showroom with visible patina and texture",
      },
    ],
  },
  brandStory: {
    eyebrow: "Brand story",
    title: "Rooted in Moroccan craft, material character, and pieces chosen in person.",
    paragraph:
      "Loom & Hearth Studio builds its collection through direct sourcing in Morocco and a clear eye for rugs, rug-made poufs, pillows, and decor with real presence.",
    href: "/about",
  },
  designDirection: {
    eyebrow: "Design direction",
    title: "Created for interiors that feel layered, warm, and collected.",
    paragraph:
      "The collection brings together tactile rugs, quiet contrast, and handcrafted accents that help a room feel more grounded and individual.",
    href: "/lookbook",
  },
  featuredDirections: {
    eyebrow: "Featured directions",
    title: "Start with the signature pieces of the collection.",
    intro:
      "Explore the three directions that define the launch: Moroccan rugs, rug-made poufs, and cactus silk pillows.",
    cards: [
      {
        title: "Moroccan rugs",
        description:
          "Handwoven Moroccan rugs selected for warmth, texture, and a stronger sense of home.",
        href: "/shop/rugs",
        imageSrc:
          "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
        imageAlt:
          "A plush cream rug with black Beni Ourain style patterning in a calm neutral interior",
      },
      {
        title: "Poufs",
        description:
          "Leather and rug-made poufs selected for texture, function, and character.",
        href: "/shop/poufs",
        imageSrc:
          "https://images.pexels.com/photos/36167991/pexels-photo-36167991.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1200",
        imageAlt:
          "A brown leather pouf styled in a light, tactile interior with soft linen textures",
      },
      {
        title: "Cactus silk pillows",
        description:
          "Handcrafted pillows that add softness, color, and a more layered finish to the room.",
        href: "/shop/pillows",
        imageSrc:
          "https://images.pexels.com/photos/31371152/pexels-photo-31371152/free-photo-of-warm-moroccan-sunlight-on-traditional-cushions.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        imageAlt:
          "Handmade Moroccan cushions in warm sunlight with layered woven textiles and soft neutral tones",
      },
    ],
  },
  moroccanRugsGuide: {
    eyebrow: "Moroccan rugs guide",
    title: "What makes Moroccan rugs unique?",
    paragraph:
      "Moroccan rugs are valued for their handwoven texture, individual character, and the way they bring warmth into a room without feeling generic. Some styles, like Beni Ourain rugs, are known for plush wool and quieter patterning, while vintage Moroccan rugs often bring faded color, movement, and a stronger sense of history. Together, they offer a more collected alternative to mass-market floor coverings.",
  },
  newsletter: {
    eyebrow: "Newsletter",
    title: "Get first access to new Moroccan rugs, vintage finds, and studio releases.",
    paragraph:
      "Join the list for new arrivals, lookbook updates, and early access to handcrafted pieces before wider release.",
    inputLabel: "Email address",
    inputPlaceholder: "name@example.com",
    ctaLabel: "Join the list",
  },
  footer: {
    introTitle: siteConfig.name,
    introBody: "Handcrafted Moroccan rugs, vintage rugs, poufs, pillows, and curated home decor.",
    introMeta: "Curated for a United States launch in USD.",
    exploreHeading: "Explore",
    exploreLinks: siteConfig.primaryNav.map((item) => ({ ...item })),
    supportHeading: "Support",
    supportLinks: siteConfig.supportNav.map((item) => ({ ...item })),
    collectionsHeading: "Collections",
    collectionLinks: [
      { href: "/shop/rugs", label: "Moroccan rugs" },
      { href: "/shop/vintage", label: "Vintage rugs" },
      { href: "/shop/poufs", label: "Poufs" },
      { href: "/shop/pillows", label: "Pillows" },
      { href: "/shop/decor", label: "Home decor" },
    ],
  },
};

export function createDefaultHomePageContent(): HomePageContent {
  return {
    brand: { ...defaultHomePageContent.brand },
    hero: { ...defaultHomePageContent.hero },
    trustItems: [...defaultHomePageContent.trustItems],
    categoriesSection: {
      ...defaultHomePageContent.categoriesSection,
      cards: defaultHomePageContent.categoriesSection.cards.map((card) => ({ ...card })),
    },
    brandStory: { ...defaultHomePageContent.brandStory },
    designDirection: { ...defaultHomePageContent.designDirection },
    featuredDirections: {
      ...defaultHomePageContent.featuredDirections,
      cards: defaultHomePageContent.featuredDirections.cards.map((card) => ({ ...card })),
    },
    moroccanRugsGuide: { ...defaultHomePageContent.moroccanRugsGuide },
    newsletter: { ...defaultHomePageContent.newsletter },
    footer: {
      ...defaultHomePageContent.footer,
      exploreLinks: defaultHomePageContent.footer.exploreLinks.map((link) => ({ ...link })),
      supportLinks: defaultHomePageContent.footer.supportLinks.map((link) => ({ ...link })),
      collectionLinks: defaultHomePageContent.footer.collectionLinks.map((link) => ({ ...link })),
    },
  };
}

export function sanitizeHomePageContent(input: unknown): HomePageContent {
  const source = asRecord(input);
  const defaults = createDefaultHomePageContent();

  return {
    brand: {
      logoText: readString(source.brand, "logoText", defaults.brand.logoText),
      logoImageUrl: readString(source.brand, "logoImageUrl", defaults.brand.logoImageUrl),
      logoImageAlt: readString(source.brand, "logoImageAlt", defaults.brand.logoImageAlt),
      tagline: readString(source.brand, "tagline", defaults.brand.tagline),
    },
    hero: {
      eyebrow: readString(source.hero, "eyebrow", defaults.hero.eyebrow),
      title: readString(source.hero, "title", defaults.hero.title),
      paragraph: readString(source.hero, "paragraph", defaults.hero.paragraph),
      primaryCtaLabel: readString(source.hero, "primaryCtaLabel", defaults.hero.primaryCtaLabel),
      primaryCtaLink: readString(source.hero, "primaryCtaLink", defaults.hero.primaryCtaLink),
      secondaryCtaLabel: readString(
        source.hero,
        "secondaryCtaLabel",
        defaults.hero.secondaryCtaLabel,
      ),
      secondaryCtaLink: readString(source.hero, "secondaryCtaLink", defaults.hero.secondaryCtaLink),
      imageSrc: readString(source.hero, "imageSrc", defaults.hero.imageSrc),
      imageAlt: readString(source.hero, "imageAlt", defaults.hero.imageAlt),
    },
    trustItems: readStringArray(source.trustItems, defaults.trustItems),
    categoriesSection: {
      eyebrow: readString(source.categoriesSection, "eyebrow", defaults.categoriesSection.eyebrow),
      title: readString(source.categoriesSection, "title", defaults.categoriesSection.title),
      paragraph: readString(
        source.categoriesSection,
        "paragraph",
        defaults.categoriesSection.paragraph,
      ),
      cards: readImageCardArray(source.categoriesSection, "cards", defaults.categoriesSection.cards),
    },
    brandStory: readNarrativeSection(source.brandStory, defaults.brandStory),
    designDirection: readNarrativeSection(source.designDirection, defaults.designDirection),
    featuredDirections: {
      eyebrow: readString(
        source.featuredDirections,
        "eyebrow",
        defaults.featuredDirections.eyebrow,
      ),
      title: readString(source.featuredDirections, "title", defaults.featuredDirections.title),
      intro: readString(source.featuredDirections, "intro", defaults.featuredDirections.intro),
      cards: readImageCardArray(
        source.featuredDirections,
        "cards",
        defaults.featuredDirections.cards,
      ),
    },
    moroccanRugsGuide: {
      eyebrow: readString(
        source.moroccanRugsGuide,
        "eyebrow",
        defaults.moroccanRugsGuide.eyebrow,
      ),
      title: readString(source.moroccanRugsGuide, "title", defaults.moroccanRugsGuide.title),
      paragraph: readString(
        source.moroccanRugsGuide,
        "paragraph",
        defaults.moroccanRugsGuide.paragraph,
      ),
    },
    newsletter: {
      eyebrow: readString(source.newsletter, "eyebrow", defaults.newsletter.eyebrow),
      title: readString(source.newsletter, "title", defaults.newsletter.title),
      paragraph: readString(source.newsletter, "paragraph", defaults.newsletter.paragraph),
      inputLabel: readString(source.newsletter, "inputLabel", defaults.newsletter.inputLabel),
      inputPlaceholder: readString(
        source.newsletter,
        "inputPlaceholder",
        defaults.newsletter.inputPlaceholder,
      ),
      ctaLabel: readString(source.newsletter, "ctaLabel", defaults.newsletter.ctaLabel),
    },
    footer: {
      introTitle: readString(source.footer, "introTitle", defaults.footer.introTitle),
      introBody: readString(source.footer, "introBody", defaults.footer.introBody),
      introMeta: readString(source.footer, "introMeta", defaults.footer.introMeta),
      exploreHeading: readString(source.footer, "exploreHeading", defaults.footer.exploreHeading),
      exploreLinks: readLinkArray(source.footer, "exploreLinks", defaults.footer.exploreLinks),
      supportHeading: readString(source.footer, "supportHeading", defaults.footer.supportHeading),
      supportLinks: readLinkArray(source.footer, "supportLinks", defaults.footer.supportLinks),
      collectionsHeading: readString(
        source.footer,
        "collectionsHeading",
        defaults.footer.collectionsHeading,
      ),
      collectionLinks: readLinkArray(
        source.footer,
        "collectionLinks",
        defaults.footer.collectionLinks,
      ),
    },
  };
}

export function validateHomePageContent(content: HomePageContent) {
  const imageUrls = [
    content.brand.logoImageUrl,
    content.hero.imageSrc,
    ...content.categoriesSection.cards.map((card) => card.imageSrc),
    ...content.featuredDirections.cards.map((card) => card.imageSrc),
  ].filter(Boolean);

  if (imageUrls.some((value) => !isAllowedImageUrl(value))) {
    return {
      status: "invalid" as const,
      message:
        "Homepage image URLs must use HTTPS and one of the currently supported hosts: Cloudinary, Pexels, or Unsplash.",
    };
  }

  const links = [
    content.hero.primaryCtaLink,
    content.hero.secondaryCtaLink,
    content.brandStory.href,
    content.designDirection.href,
    ...content.categoriesSection.cards.map((card) => card.href),
    ...content.featuredDirections.cards.map((card) => card.href),
    ...content.footer.exploreLinks.map((link) => link.href),
    ...content.footer.supportLinks.map((link) => link.href),
    ...content.footer.collectionLinks.map((link) => link.href),
  ];

  if (links.some((value) => !isSafeLink(value))) {
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

function readNarrativeSection(
  value: unknown,
  fallback: HomePageContent["brandStory"],
): HomePageContent["brandStory"] {
  const source = asRecord(value);

  return {
    eyebrow: readString(source, "eyebrow", fallback.eyebrow),
    title: readString(source, "title", fallback.title),
    paragraph: readString(source, "paragraph", fallback.paragraph),
    href: readString(source, "href", fallback.href),
  };
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
      title: readString(card, "title", defaultCard.title),
      description: readString(card, "description", defaultCard.description),
      href: readString(card, "href", defaultCard.href),
      imageSrc: readString(card, "imageSrc", defaultCard.imageSrc),
      imageAlt: readString(card, "imageAlt", defaultCard.imageAlt),
    };
  });
}

function readLinkArray(value: unknown, key: string, fallback: HomePageLink[]): HomePageLink[] {
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

function readStringArray(value: unknown, fallback: string[]) {
  const items = Array.isArray(value) ? value : [];

  return fallback.map((defaultValue, index) =>
    typeof items[index] === "string" ? items[index].trim() : defaultValue,
  );
}

function readString(source: unknown, key: string, fallback: string) {
  const value = asRecord(source)[key];

  return typeof value === "string" ? value.trim() : fallback;
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
