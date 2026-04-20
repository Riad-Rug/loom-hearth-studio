import { unstable_noStore as noStore } from "next/cache";

import {
  createDefaultHomePageContent,
  sanitizeHomePageContent,
  type HomePageContent,
} from "@/features/home/home-page-data";
import { buildCloudinaryUrl } from "@/lib/cloudinary/url";
import { createHomepageContentRepository } from "@/lib/db/repositories/homepage-content-repository";

export async function getHomepageContentState(): Promise<{
  content: HomePageContent;
  source: "database" | "defaults";
  updatedAt: Date | null;
}> {
  noStore();

  const record = await createHomepageContentRepository().get();

  if (!record) {
    return {
      content: normalizeHomepageCopyAudit(createDefaultHomePageContent()),
      source: "defaults",
      updatedAt: null,
    };
  }

  return {
    content: normalizeHomepageCopyAudit(normalizeHomepageCloudinaryImages(sanitizeHomePageContent(record.content))),
    source: "database",
    updatedAt: record.updatedAt,
  };
}

export async function getHomepageContent() {
  return (await getHomepageContentState()).content;
}

export async function saveHomepageContent(content: HomePageContent) {
  await createHomepageContentRepository().save(content);
}

function normalizeHomepageCopyAudit(content: HomePageContent): HomePageContent {
  const next = structuredClone(content);

  next.brand.tagline = "Handcrafted Moroccan rugs and home decor";

  next.pageSeo.title = "Loom & Hearth Studio  Handcrafted Moroccan Rugs";
  next.pageSeo.description =
    "Hand-knotted Moroccan rugs, poufs, cactus silk pillows, and decor sourced directly across Morocco. Family business. 80 years in the trade. Free shipping to the US, Canada, and Australia.";

  next.hero.title = "Hand-knotted Moroccan rugs from a family that has worked this trade for 80 years.";
  next.hero.paragraph =
    "Hand-knotted rugs, poufs, cactus silk pillows, and handcrafted decor selected in person across Morocco, not pulled from an export catalogue.";
  next.hero.primaryCta = { ...next.hero.primaryCta, label: "SHOP RUGS" };
  next.hero.secondaryCta = { ...next.hero.secondaryCta, label: "Browse All Pieces", href: "/shop" };
  next.hero.seo = {
    ...next.hero.seo,
    seoTitle: "Loom & Hearth Studio  Handcrafted Moroccan Rugs",
    metaDescription:
      "Hand-knotted Moroccan rugs, poufs, cactus silk pillows, and decor sourced directly across Morocco. Family business. 80 years in the trade. Free shipping to the US, Canada, and Australia.",
  };

  next.badges.items = next.badges.items.map((item) => {
    if (item.id === "badge-1") return { ...item, label: "Direct from Morocco" };
    if (item.id === "badge-2") return { ...item, label: "Free shipping to the US, Canada, and Australia" };
    if (item.id === "badge-3") return { ...item, label: "Colour verified before payment is captured" };
    if (item.id === "badge-4") return { ...item, label: "14-day returns" };
    return item;
  });

  next.categories.eyebrow = "SHOP BY CATEGORY";
  next.categories.title = "The full collection  rugs, poufs, pillows, decor, and vintage finds.";
  next.categories.paragraph =
    "The collection is built around hand-knotted Moroccan rugs selected for construction quality, pile density, and weight. Supporting pieces  rug-made poufs, cactus silk pillows, and handcrafted decor  are chosen to work alongside them.";
  next.categories.cards = next.categories.cards.map((card) => {
    if (card.id === "category-rugs") {
      return {
        ...card,
        description: "Hand-knotted rugs selected for pile density, construction depth, and weight underfoot.",
      };
    }

    if (card.id === "category-poufs") {
      return {
        ...card,
        description: "Rug-made and leather poufs. Functional seating with a quieter footprint than upholstered furniture.",
      };
    }

    if (card.id === "category-pillows") {
      return {
        ...card,
        description: "Cactus silk and rug-based pillows. Flat-woven, low-shed, with strong colour saturation.",
      };
    }

    if (card.id === "category-decor") {
      return {
        ...card,
        description: "Handcrafted Moroccan objects selected for shelves, consoles, and flat surfaces.",
      };
    }

    if (card.id === "category-vintage") {
      return {
        ...card,
        description: "One-of-one vintage Moroccan rugs. Selected for construction integrity, visible age, and pile condition.",
      };
    }

    return card;
  });

  next.brandStory.eyebrow = "WHO WE ARE";
  next.brandStory.title = "Sourced across Morocco. Selected in person. Shipped directly to you.";
  next.brandStory.paragraph =
    "Loom & Hearth Studio is a family operation connected to a Marrakech bazaar with close to 80 years in the trade. We source in person across Morocco, working directly with the people who make and collect these pieces instead of buying from export catalogues.";
  next.brandStory.linkLabel = "Read the full story";

  next.designDirection.eyebrow = "DESIGN DIRECTION";
  next.designDirection.title = "Pieces chosen for what they are made of. Not for how they photograph.";
  next.designDirection.paragraph =
    "Every piece is evaluated on construction: pile density, knot structure, material weight, and colour consistency across the field. A rug that photographs well but will not hold up under real foot traffic is not a piece we will sell.";
  next.designDirection.linkLabel = "VIEW THE LOOKBOOK";

  next.featured.eyebrow = "SHOP FIRST";
  next.featured.title = "Start with the pieces shoppers ask about first.";
  next.featured.paragraph =
    "Browse the highest-intent parts of the collection before reading deeper into the sourcing story.";
  next.featured.cards = next.featured.cards.map((card) => {
    if (card.id === "featured-rugs") {
      return {
        ...card,
        eyebrow: "New arrivals",
        title: "One-of-one Moroccan rugs",
        description: "Hand-knotted Moroccan rugs selected for pile density, weight, and long-term durability.",
        priceLabel: "Shop available pieces",
      };
    }

    if (card.id === "featured-poufs") {
      return {
        ...card,
        eyebrow: "Functional accents",
        title: "Rug-made and leather poufs",
        description: "Poufs selected for construction quality, filling density, and everyday use.",
        priceLabel: "Browse poufs",
      };
    }

    if (card.id === "featured-pillows") {
      return {
        ...card,
        eyebrow: "Layered texture",
        title: "Cactus silk pillows",
        description: "Flat-woven cactus silk. Low-shed, with strong colour saturation and a quieter surface than wool pile.",
        priceLabel: "Browse pillows",
      };
    }

    return card;
  });

  next.guide.eyebrow = "KNOW WHAT YOU ARE BUYING";
  next.guide.title = "What separates a hand-knotted Moroccan rug from everything else on the market.";
  next.guide.paragraph =
    "A hand-knotted Moroccan rug is built knot by knot onto a warp structure. Dense knotting, material weight, and stable construction are the signs that a piece can keep performing for years instead of flattening, shedding, or relying on degrading adhesive backing.";

  next.newsletter.eyebrow = "JOIN THE LIST";
  next.newsletter.title = "New arrivals, sourcing stories, and first access to pieces before wider release.";
  next.newsletter.paragraph =
    "We publish twice a month. New pieces, what we found on the last sourcing trip, and guides on what to look for when buying a Moroccan rug. No filler.";
  next.newsletter.inputPlaceholder = "Your email address";
  next.newsletter.ctaLabel = "JOIN";

  next.footer.introBody =
    "Handcrafted Moroccan rugs, vintage rugs, poufs, pillows, and home decor  sourced directly across Morocco and shipped to the United States, Canada, and Australia.";
  next.footer.introMeta =
    "Free shipping to all three markets. Inquiries from other countries are reviewed case by case. Prices in USD. Destination and delivery conditions are confirmed before payment is captured.";

  return next;
}
function normalizeHomepageCloudinaryImages(content: HomePageContent): HomePageContent {
  const next = structuredClone(content);

  next.hero.image = normalizeCloudinaryImage(next.hero.image);
  next.categories.cards = next.categories.cards.map((card) => ({
    ...card,
    image: normalizeCloudinaryImage(card.image),
  }));
  next.featured.cards = next.featured.cards.map((card) => ({
    ...card,
    image: normalizeCloudinaryImage(card.image),
  }));

  return next;
}

function normalizeCloudinaryImage(image: HomePageContent["hero"]["image"]) {
  if (!image.publicId.trim()) {
    return image;
  }

  if (usesDemoCloudinaryUrl(image.src)) {
    return {
      ...image,
      src: buildCloudinaryUrl(image.publicId),
    };
  }

  return image;
}

function usesDemoCloudinaryUrl(value: string) {
  try {
    const url = new URL(value);
    return url.hostname === "res.cloudinary.com" && url.pathname.startsWith("/demo/image/upload/");
  } catch {
    return false;
  }
}
