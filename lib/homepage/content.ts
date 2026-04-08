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

  next.hero.title = "Moroccan rugs sourced directly from Marrakech — not from a catalogue.";
  next.hero.paragraph =
    "Hand-knotted rugs, rug-made poufs, cactus silk pillows, and handcrafted decor — sourced in person in Morocco, not pulled from an export catalogue.";
  next.hero.primaryCta = { ...next.hero.primaryCta, label: "SHOP NOW" };
  next.hero.secondaryCta = { ...next.hero.secondaryCta, label: "Our Story", href: "/about" };

  next.badges.items = next.badges.items.map((item) => {
    if (item.id === "badge-1") return { ...item, label: "Direct from Morocco" };
    if (item.id === "badge-2") {
      return {
        ...item,
        label: "Free shipping to the USA, Europe, Canada, and Australia",
      };
    }
    if (item.id === "badge-3") return { ...item, label: "Destination confirmed before capture" };
    if (item.id === "badge-4") return { ...item, label: "14-day returns" };
    return item;
  });

  next.categories.eyebrow = "SHOP BY CATEGORY";
  next.categories.title = "Moroccan rugs, poufs, pillows, decor, and vintage \u2014 the full collection.";
  next.categories.paragraph =
    "Start with the pieces at the center of the collection: handcrafted Moroccan rugs, one of one vintage rugs, rug-made poufs, cactus silk pillows, and decor selected for wool texture, visible construction, and colour contrast.";
  next.categories.cards = next.categories.cards.map((card) => {
    if (card.id === "category-rugs") {
      return {
        ...card,
        description: "Handcrafted Moroccan rugs chosen for texture, material depth, and lasting scale in the room.",
      };
    }

    if (card.id === "category-poufs") {
      return {
        ...card,
        description: "Rug-made and leather poufs. Functional seating with a softer, less formal footprint in the room.",
      };
    }

    if (card.id === "category-vintage") {
      return {
        ...card,
        description: "One of one vintage Moroccan rugs selected for construction quality, patina, and visible age.",
      };
    }

    return card;
  });

  next.brandStory.title = "Sourced directly in Marrakech. Selected in person.";
  next.brandStory.paragraph =
    "Loom & Hearth Studio sources its collection directly through a family bazaar in Marrakech — a business with roots close to 80 years in the Semmarine souk. We select rugs, rug-made poufs, pillows, and decor in person. Not from export catalogues. Not through cooperatives.";

  next.designDirection.title = "Pieces with weight. For rooms that do not look like a catalogue.";
  next.designDirection.paragraph =
    "The collection is focused: hand-knotted Moroccan rugs, rug-based poufs, pillows, and a small selection of supporting decor. Each piece is chosen for what it is made of and how it is made — not for how it photographs.";

  next.featured.paragraph =
    "Shop the three directions that define the launch: Moroccan rugs, rug-made poufs, and cactus silk pillows.";

  next.featured.cards = next.featured.cards.map((card) => {
    if (card.id === "featured-rugs") {
      return {
        ...card,
        description: "Hand-knotted Moroccan rugs selected for pile quality, construction, and performance underfoot.",
      };
    }

    if (card.id === "featured-poufs") {
      return {
        ...card,
        description: "Leather and rug-made poufs. Selected for construction quality and function.",
      };
    }

    if (card.id === "featured-pillows") {
      return {
        ...card,
        description: "Cactus silk pillows — flat-woven, low-shed, with good colour saturation and a quieter surface than wool pile.",
      };
    }

    return card;
  });

  next.guide.title = "What separates a hand-knotted Moroccan rug from everything else on the market.";
  next.guide.paragraph =
    "A hand-knotted Moroccan rug is built knot by knot onto a warp structure. That process takes weeks for a single piece and produces a construction that holds up under foot traffic in a way machine-made and tufted rugs do not. Beni Ourain rugs are knotted by Amazigh weavers in the Middle Atlas Mountains using natural undyed wool. The ivory field and sparse geometric pattern are structural — a result of the wool's colour and the weaver's design, not dye. Pile height typically runs 15–25mm. Vintage Moroccan rugs carry abrash: colour variation that occurs when natural dye interacts with light and use over time. It is not a defect. It is a visible record of how the piece was made.";

  next.newsletter.title = "Get first access to new Moroccan rugs, vintage finds, and studio releases.";

  next.footer.introBody =
    "Handcrafted Moroccan rugs, vintage rugs, poufs, pillows, and home decor — sourced directly from Marrakech.";
  next.footer.introMeta =
    "Free shipping to the USA, Europe, Canada, and Australia. Prices in USD. Destination and delivery conditions are confirmed before payment is captured.";

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





