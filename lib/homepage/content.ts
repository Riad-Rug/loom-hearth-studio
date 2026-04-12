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
  next.hero.secondaryCta = { ...next.hero.secondaryCta, label: "Our Story", href: "/about" };
  next.hero.seo = {
    ...next.hero.seo,
    seoTitle: "Loom & Hearth Studio  Handcrafted Moroccan Rugs",
    metaDescription:
      "Hand-knotted Moroccan rugs, poufs, cactus silk pillows, and decor sourced directly across Morocco. Family business. 80 years in the trade. Free shipping to the US, Canada, and Australia.",
  };

  next.badges.items = next.badges.items.map((item) => {
    if (item.id === "badge-1") return { ...item, label: "Direct from Morocco" };
    if (item.id === "badge-2") {
      return {
        ...item,
        label: "Free shipping to the United States, Canada, and Australia",
      };
    }
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
    "Loom & Hearth Studio is a family operation. My mother manages our bazaar in the Semmarine souk in Marrakech  a business with close to 80 years of history in the trade. We travel together across Morocco  to villages in the Atlas Mountains, to smaller workshops, to early morning markets where weavers and collectors trade before dawn  to find pieces that cannot be sourced from a catalogue. We work directly with the people who make them. We cut out the intermediaries who have historically taken the margin that should go to the artisans. That is the sourcing model. It is not scalable in the way a catalogue business is. That is the point.";
  next.brandStory.linkLabel = "Read the full story";

  next.designDirection.eyebrow = "DESIGN DIRECTION";
  next.designDirection.title = "Pieces chosen for what they are made of. Not for how they photograph.";
  next.designDirection.paragraph =
    "The collection stays focused: hand-knotted Moroccan rugs, rug-based poufs, pillows, and a small selection of supporting decor. Every piece is evaluated on construction  pile density, knot structure, material weight, and colour consistency across the field. A rug that photographs well but sheds heavily or compresses under foot traffic within two years is not a piece we will sell.";
  next.designDirection.linkLabel = "VIEW THE LOOKBOOK";

  next.featured.eyebrow = "FEATURED DIRECTIONS";
  next.featured.title = "Start with the three pieces at the centre of the collection.";
  next.featured.paragraph =
    "Shop the three directions that define the launch: Moroccan rugs, rug-made poufs, and cactus silk pillows.";
  next.featured.cards = next.featured.cards.map((card) => {
    if (card.id === "featured-rugs") {
      return {
        ...card,
        description: "Hand-knotted Moroccan rugs. Selected for pile density, knot count, and durability underfoot.",
      };
    }

    if (card.id === "featured-poufs") {
      return {
        ...card,
        description: "Leather and rug-made poufs. Evaluated for construction quality and filling density.",
      };
    }

    if (card.id === "featured-pillows") {
      return {
        ...card,
        description: "Flat-woven cactus silk. Low-shed, with strong colour saturation and a quieter surface than wool pile.",
      };
    }

    return card;
  });

  next.guide.eyebrow = "KNOW WHAT YOU ARE BUYING";
  next.guide.title = "What separates a hand-knotted Moroccan rug from everything else on the market.";
  next.guide.paragraph =
    "A hand-knotted Moroccan rug is built knot by knot onto a warp structure. The weight of the finished piece reflects how densely it was knotted  and density is the primary indicator of how the rug will perform over time. Machine-made and tufted rugs use a backing adhesive to hold the pile. That adhesive degrades. The knot structure in a hand-knotted rug does not. A well-knotted piece bought today should still be in the room  and worth something  in thirty years.";

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
