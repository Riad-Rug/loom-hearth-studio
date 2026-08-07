import { siteConfig } from "@/config/site";
import { allowedImageHostnames } from "@/lib/media/allowed-image-hosts";

export const homepageSectionOrderKeys = [
  "hero",
  "brandStory",
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
  categories: {
    label: "Categories",
    description: "Merchandising cards for the main collection categories.",
  },
  brandStory: {
    label: "Brand story",
    description: "Editorial card linking back to the studio story.",
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

export type HomePageNarrativeSection = HomePageSectionSettings & {
  eyebrow: string;
  title: string;
  paragraph: string;
  linkLabel: string;
  href: string;
};

export type HomePageContent = {
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
  categories: HomePageSectionSettings & {
    eyebrow: string;
    title: string;
    paragraph: string;
    cards: HomePageImageCard[];
  };
  brandStory: HomePageNarrativeSection;
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

const allowedImageHosts = new Set<string>(allowedImageHostnames);

const defaultHomePageContent: HomePageContent = {
  pageSeo: {
    title: "Loom & Hearth | Handmade Moroccan Rugs",
    description:
      "Handmade Moroccan rugs, poufs, pillows and antiques — one of each, sold direct from Casablanca.",
  },
  sectionOrder: [...homepageSectionOrderKeys],
  hero: {
    visible: true,
    seo: {
      seoTitle: "Loom & Hearth | Handmade Moroccan Rugs",
      metaDescription:
        "Handmade Moroccan rugs, poufs, pillows and antiques — one of each, sold direct from Casablanca.",
    },
    eyebrow: "DIRECT FROM CASABLANCA",
    title: "Woven by hand in the Atlas. Warm underfoot in your home.",
    paragraph:
      "One-of-a-kind rugs, poufs and antiques, found and shipped by one person in Morocco — from $30.",
    primaryCta: {
      label: "SHOP RUGS",
      href: "/shop/rugs",
      visible: true,
    },
    secondaryCta: {
      label: "SHOP EVERYTHING",
      href: "/shop",
      visible: true,
    },
    image: {
      src: "",
      alt: "Texture photograph placeholder for Loom & Hearth.",
      publicId: "",
      width: null,
      height: null,
    },
  },
  categories: {
    visible: true,
    seo: {
      seoTitle: "Shop Moroccan rugs, poufs, pillows, and decor by category.",
      metaDescription:
        "Browse Moroccan rugs, vintage rugs, rug-made poufs, cactus silk pillows, and decor through a structured category section on the homepage.",
    },
    eyebrow: "SHOP BY CATEGORY",
    title: "Handmade Moroccan rugs, poufs, pillows, decor, and antiques.",
    paragraph:
      "Every piece is sourced one at a time and sold as the exact item shown. Moroccan rugs lead the collection, then poufs, pillows, decor, and antiques follow around them.",
    cards: [
      {
        id: "category-rugs",
        title: "Moroccan Rugs",
        href: "/shop/rugs",
        visible: true,
        description:
          "Hand-knotted rugs selected for pile density, construction depth, and weight underfoot.",
        image: {
          src: "",
          alt: "Moroccan rugs photo placeholder",
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
          src: "",
          alt: "Moroccan poufs photo placeholder",
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
          src: "",
          alt: "Moroccan pillows photo placeholder",
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
        href: "/shop/vintage",
        visible: true,
        description:
          "ONE OF A KIND vintage Moroccan rugs. Selected for construction integrity, visible age, and pile condition.",
        image: {
          src: "",
          alt: "Vintage Moroccan rugs photo placeholder",
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
      "New handmade Moroccan rugs, poufs, pillows and antiques arrive in small batches. Join the list to see them before they sell through.",
    inputLabel: "Email address",
    inputPlaceholder: "Your email address",
    ctaLabel: "JOIN",
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
    introMeta: "Prices in USD. Free shipping across the US.",
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

  return {
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
    { label: "Hero image", image: content.hero.image },
    ...content.categories.cards.map((card) => ({ label: `${card.title} image`, image: card.image })),
  ].filter((item) => item.image.src.trim());

  const invalidImage = imageAssets.find((item) => !isAllowedImageUrl(item.image.src));

  if (invalidImage) {
    return {
      status: "invalid" as const,
      message: `${invalidImage.label} must use HTTPS and one of the currently supported hosts (Cloudinary, Pexels, or Unsplash), or a local path starting with "/".`,
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
    ...content.categories.cards.map((card) => card.href),
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
  return (value.startsWith("/") && !value.startsWith("//")) || value.startsWith("https://");
}

function isAllowedImageUrl(value: string) {
  if (value.startsWith("/")) {
    return !value.startsWith("//");
  }

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




