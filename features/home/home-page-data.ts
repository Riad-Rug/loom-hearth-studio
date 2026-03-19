import { siteConfig } from "@/config/site";

export const homepageSectionOrderKeys = [
  "hero",
  "badges",
  "categories",
  "brandStory",
  "designDirection",
  "featured",
  "guide",
  "newsletter",
] as const;

export const homepageSectionKeys = [...homepageSectionOrderKeys, "footer"] as const;

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
  guide: {
    label: "Educational guide",
    description: "SEO-supporting educational copy block on the homepage.",
  },
  newsletter: {
    label: "Newsletter",
    description: "Signup prompt with editable copy and call to action.",
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
  image: HomePageImage;
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
    logoImageUrl: "",
    logoImageAlt: `${siteConfig.name} logo`,
    tagline: siteConfig.tagline,
  },
  pageSeo: {
    title: "Shop handcrafted Moroccan rugs, poufs, pillows, and decor.",
    description:
      "Editorial storefront homepage for handcrafted Moroccan rugs, vintage rugs, poufs, pillows, and home decor.",
  },
  sectionOrder: [...homepageSectionOrderKeys],
  hero: {
    visible: true,
    seo: {
      seoTitle: "Shop handcrafted Moroccan rugs, poufs, pillows, and decor.",
      metaDescription:
        "Discover handcrafted Moroccan rugs, vintage finds, poufs, pillows, and decor selected for warmth, texture, and collected character.",
    },
    eyebrow: "Loom & Hearth Studio",
    title: "Shop handcrafted Moroccan rugs, poufs, pillows, and home decor.",
    paragraph:
      "Discover Moroccan rugs, vintage rugs, rug-made poufs, cactus silk pillows, and handcrafted decor selected for warmth, texture, and collected character. From plush Beni Ourain-inspired pieces to one-of-one vintage finds, each piece is chosen to bring artisanal depth into everyday interiors.",
    primaryCta: {
      label: "Shop Moroccan rugs",
      href: "/shop/rugs",
      visible: true,
    },
    secondaryCta: {
      label: "View the lookbook",
      href: "/lookbook",
      visible: true,
    },
    image: {
      src: "https://images.pexels.com/photos/31371121/pexels-photo-31371121.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=960",
      alt: "A refined Moroccan sitting room with warm textiles, carved wood, and a quiet artisanal feel",
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
        "Direct sourcing, United States delivery, duties included, and a tightly curated launch selection shape the homepage value highlights.",
    },
    items: [
      { id: "badge-1", label: "Direct from Morocco", visible: true },
      { id: "badge-2", label: "United States delivery", visible: true },
      { id: "badge-3", label: "Duties included", visible: true },
      { id: "badge-4", label: "Curated launch selection", visible: true },
    ],
  },
  categories: {
    visible: true,
    seo: {
      seoTitle: "Shop Moroccan rugs, poufs, pillows, and decor by category.",
      metaDescription:
        "Browse Moroccan rugs, vintage rugs, rug-made poufs, cactus silk pillows, and decor through a structured category section on the homepage.",
    },
    eyebrow: "Categories",
    title: "Shop Moroccan rugs, poufs, pillows, and decor by category.",
    paragraph:
      "Start with the pieces at the center of the collection: handcrafted Moroccan rugs, one-of-one vintage rugs, rug-made poufs, cactus silk pillows, and decor selected for warmth, texture, and character.",
    cards: [
      {
        id: "category-rugs",
        title: "Moroccan Rugs",
        href: "/shop/rugs",
        visible: true,
        description:
          "Handcrafted Moroccan rugs chosen for texture, material depth, and lasting presence in the room.",
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
          "Rug-made and leather poufs that bring flexible function and a softer, more collected look.",
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
          "Cactus silk and rug-based pillows for color, contrast, and layered texture.",
        image: {
          src: "https://images.pexels.com/photos/31371152/pexels-photo-31371152/free-photo-of-warm-moroccan-sunlight-on-traditional-cushions.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          alt: "Cactus silk pillows layered in warm Moroccan sunlight with woven textiles",
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
          "Handcrafted Moroccan decor selected to finish shelves, consoles, tables, and quiet corners.",
        image: {
          src: "https://images.pexels.com/photos/31371121/pexels-photo-31371121.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=960",
          alt: "Moroccan decor in a warm interior with carved wood, ceramics, and layered styling",
          publicId: "",
          width: null,
          height: null,
        },
      },
      {
        id: "category-vintage",
        title: "Vintage Rugs",
        href: "/shop/vintage",
        visible: true,
        description:
          "One-of-one vintage Moroccan rugs chosen for patina, history, and collected appeal.",
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
        "Read how Loom & Hearth Studio builds the collection through direct sourcing in Morocco and a sharp point of view on craft and material character.",
    },
    eyebrow: "Brand story",
    title: "Rooted in Moroccan craft, material character, and pieces chosen in person.",
    paragraph:
      "Loom & Hearth Studio builds its collection through direct sourcing in Morocco and a clear eye for rugs, rug-made poufs, pillows, and decor with real presence.",
    linkLabel: "Read the story",
    href: "/about",
  },
  designDirection: {
    visible: true,
    seo: {
      seoTitle: "Design direction | Loom & Hearth Studio",
      metaDescription:
        "See the design direction behind the collection: layered interiors, warm materials, quiet contrast, and handcrafted accents with lasting presence.",
    },
    eyebrow: "Design direction",
    title: "Created for interiors that feel layered, warm, and collected.",
    paragraph:
      "The collection brings together tactile rugs, quiet contrast, and handcrafted accents that help a room feel more grounded and individual.",
    linkLabel: "View the lookbook",
    href: "/lookbook",
  },
  featured: {
    visible: true,
    seo: {
      seoTitle: "Featured Moroccan collections | Loom & Hearth Studio",
      metaDescription:
        "Start with the signature homepage directions: Moroccan rugs, rug-made poufs, and cactus silk pillows curated for warmth and texture.",
    },
    eyebrow: "Featured directions",
    title: "Start with the signature pieces of the collection.",
    paragraph:
      "Explore the three directions that define the launch: Moroccan rugs, rug-made poufs, and cactus silk pillows.",
    cards: [
      {
        id: "featured-rugs",
        title: "Moroccan rugs",
        description:
          "Handwoven Moroccan rugs selected for warmth, texture, and a stronger sense of home.",
        href: "/shop/rugs",
        visible: true,
        image: {
          src: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
          alt: "A plush cream rug with black Beni Ourain style patterning in a calm neutral interior",
          publicId: "",
          width: null,
          height: null,
        },
      },
      {
        id: "featured-poufs",
        title: "Poufs",
        description:
          "Leather and rug-made poufs selected for texture, function, and character.",
        href: "/shop/poufs",
        visible: true,
        image: {
          src: "https://images.pexels.com/photos/36167991/pexels-photo-36167991.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1200",
          alt: "A brown leather pouf styled in a light, tactile interior with soft linen textures",
          publicId: "",
          width: null,
          height: null,
        },
      },
      {
        id: "featured-pillows",
        title: "Cactus silk pillows",
        description:
          "Handcrafted pillows that add softness, color, and a more layered finish to the room.",
        href: "/shop/pillows",
        visible: true,
        image: {
          src: "https://images.pexels.com/photos/31371152/pexels-photo-31371152/free-photo-of-warm-moroccan-sunlight-on-traditional-cushions.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          alt: "Handmade Moroccan cushions in warm sunlight with layered woven textiles and soft neutral tones",
          publicId: "",
          width: null,
          height: null,
        },
      },
    ],
  },
  guide: {
    visible: true,
    seo: {
      seoTitle: "What makes Moroccan rugs unique? | Loom & Hearth Studio",
      metaDescription:
        "Learn what makes Moroccan rugs distinctive, from handwoven texture and plush wool to vintage patina, movement, and a stronger sense of history.",
    },
    eyebrow: "Moroccan rugs guide",
    title: "What makes Moroccan rugs unique?",
    paragraph:
      "Moroccan rugs are valued for their handwoven texture, individual character, and the way they bring warmth into a room without feeling generic. Some styles, like Beni Ourain rugs, are known for plush wool and quieter patterning, while vintage Moroccan rugs often bring faded color, movement, and a stronger sense of history. Together, they offer a more collected alternative to mass-market floor coverings.",
  },
  newsletter: {
    visible: true,
    seo: {
      seoTitle: "Newsletter signup | Loom & Hearth Studio",
      metaDescription:
        "Join the Loom & Hearth Studio list for new Moroccan rugs, vintage finds, lookbook updates, and early access to handcrafted releases.",
    },
    eyebrow: "Newsletter",
    title: "Get first access to new Moroccan rugs, vintage finds, and studio releases.",
    paragraph:
      "Join the list for new arrivals, lookbook updates, and early access to handcrafted pieces before wider release.",
    inputLabel: "Email address",
    inputPlaceholder: "name@example.com",
    ctaLabel: "Join the list",
  },
  footer: {
    visible: true,
    seo: {
      seoTitle: "Footer navigation | Loom & Hearth Studio",
      metaDescription:
        "Structured footer content covering primary navigation, support links, and collection shortcuts for the Loom & Hearth Studio storefront.",
    },
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
    footer: {
      ...readSectionSettings(source.footer, defaults.footer),
      introTitle: readString(source.footer, "introTitle", defaults.footer.introTitle),
      introBody: readString(source.footer, "introBody", defaults.footer.introBody),
      introMeta: readString(source.footer, "introMeta", defaults.footer.introMeta),
      exploreHeading: readString(source.footer, "exploreHeading", defaults.footer.exploreHeading),
      exploreLinks: readLinkArray(source.footer, "exploreLinks", defaults.footer.exploreLinks),
      supportHeading: readString(source.footer, "supportHeading", defaults.footer.supportHeading),
      supportLinks: readLinkArray(source.footer, "supportLinks", defaults.footer.supportLinks),
      collectionsHeading: readString(source.footer, "collectionsHeading", defaults.footer.collectionsHeading),
      collectionLinks: readLinkArray(source.footer, "collectionLinks", defaults.footer.collectionLinks),
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

function readString(source: unknown, key: string, fallback: string) {
  const value = asRecord(source)[key];

  return typeof value === "string" ? value.trim() : fallback;
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
