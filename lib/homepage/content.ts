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
  next.hero.eyebrow = "COLOUR VERIFIED BEFORE PAYMENT";
  next.hero.paragraph =
    "Hand-knotted rugs, poufs, cactus silk pillows, and handcrafted decor selected in person across Morocco, not pulled from an export catalogue.";
  next.hero.primaryCta = { ...next.hero.primaryCta, label: "SHOP RUGS" };
  next.hero.secondaryCta = { ...next.hero.secondaryCta, label: "VIEW THE LOOKBOOK", href: "/lookbook" };
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
  next.brandStory.linkLabel = "READ THE FULL STORY";

  next.designDirection.eyebrow = "DESIGN DIRECTION";
  next.designDirection.title = "Pieces chosen for what they are made of. Not for how they photograph.";
  next.designDirection.paragraph =
    "Every piece is evaluated on construction: pile density, knot structure, material weight, and colour consistency across the field. A rug that photographs well but will not hold up under real foot traffic is not a piece we will sell.";
  next.designDirection.linkLabel = "VIEW THE LOOKBOOK";

  next.featured.eyebrow = "SHOP FIRST";
  next.featured.title = "Choose the category first, then the exact piece.";
  next.featured.paragraph = "Rugs, poufs, pillows, decor, and vintage finds in one edited collection.";
  next.featured.cards = [
    {
      ...(next.featured.cards.find((card) => card.id === "featured-rugs") ?? next.featured.cards[0]),
      id: "featured-rugs",
      title: "One-of-One Moroccan Rugs",
      description: "Hand-knotted Moroccan rugs selected for pile density, weight, and long-term durability.",
      priceLabel: "SHOP RUGS",
      href: "/shop/rugs",
      visible: true,
      image: {
        ...(next.featured.cards.find((card) => card.id === "featured-rugs")?.image ?? next.hero.image),
        src: "https://images.pexels.com/photos/36202808/pexels-photo-36202808.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=1200",
        alt: "Close crop of a colorful handwoven Moroccan rug showing its geometric pattern and wool texture",
      },
    },
    {
      ...(next.featured.cards.find((card) => card.id === "featured-poufs") ?? next.featured.cards[0]),
      id: "featured-poufs",
      title: "Rug-Made and Leather Poufs",
      description: "Poufs selected for construction quality, filling density, and everyday use.",
      priceLabel: "SHOP POUFS",
      href: "/shop/poufs",
      visible: true,
      image: {
        ...(next.featured.cards.find((card) => card.id === "featured-poufs")?.image ?? next.hero.image),
        src: "https://images.pexels.com/photos/36167991/pexels-photo-36167991.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=1200",
        alt: "A Moroccan leather pouf shown in full view with clean natural styling",
      },
    },
    {
      ...(next.featured.cards.find((card) => card.id === "featured-pillows") ?? next.featured.cards[0]),
      id: "featured-pillows",
      title: "Cactus Silk Pillows",
      description: "Flat-woven cactus silk. Low-shed, with strong colour saturation and a quieter surface than wool pile.",
      priceLabel: "SHOP PILLOWS",
      href: "/shop/pillows",
      visible: true,
      image: {
        ...(next.featured.cards.find((card) => card.id === "featured-pillows")?.image ?? next.hero.image),
        src: "https://images.pexels.com/photos/11537258/pexels-photo-11537258.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=1200",
        alt: "Square crop of colorful Moroccan throw pillows and woven textiles in natural light",
      },
    },
    {
      ...(next.featured.cards.find((card) => card.id === "featured-decor") ?? next.categories.cards.find((card) => card.id === "category-decor") ?? next.featured.cards[0]),
      id: "featured-decor",
      title: "Handcrafted Decor",
      description: "Handcrafted Moroccan objects selected for shelves, consoles, and flat surfaces.",
      priceLabel: "SHOP DECOR",
      href: "/shop/decor",
      visible: true,
      image:
        next.featured.cards.find((card) => card.id === "featured-decor")?.image ??
        next.categories.cards.find((card) => card.id === "category-decor")?.image ??
        next.hero.image,
    },
    {
      ...(next.featured.cards.find((card) => card.id === "featured-vintage") ?? next.categories.cards.find((card) => card.id === "category-vintage") ?? next.featured.cards[0]),
      id: "featured-vintage",
      title: "Vintage Moroccan Rugs",
      description:
        "One-of-one vintage Moroccan rugs selected for construction integrity, visible age, and pile condition.",
      priceLabel: "SHOP VINTAGE",
      href: "/shop/vintage",
      visible: true,
      image:
        next.featured.cards.find((card) => card.id === "featured-vintage")?.image ??
        next.categories.cards.find((card) => card.id === "category-vintage")?.image ??
        next.hero.image,
    },
  ];

  next.guide.eyebrow = "KNOW WHAT YOU ARE BUYING";
  next.guide.title = "What separates a hand-knotted Moroccan rug from everything else on the market.";
  next.guide.paragraph =
    "A hand-knotted Moroccan rug is built knot by knot onto a warp structure. Dense knotting, material weight, and stable construction are the signs that a piece can keep performing for years instead of flattening, shedding, or relying on degrading adhesive backing.";

  next.newsletter.eyebrow = "JOIN THE LIST";
  next.newsletter.title = "New arrivals, sourcing stories, and first access to pieces before wider release.";
  next.newsletter.paragraph =
    "Join for a free sourcing guide: 10 things to check before buying a Moroccan rug. You will also get new arrivals, sourcing stories, and first access to pieces before wider release. No filler.";
  next.newsletter.inputPlaceholder = "Your email address";
  next.newsletter.ctaLabel = "JOIN";

  next.faq.eyebrow = "BEFORE YOU BUY";
  next.faq.title = "Questions buyers ask before choosing a one-of-one rug.";
  next.faq.paragraph =
    "A rug is a considered purchase. These are the details we confirm before you commit.";
  next.faq.items = next.faq.items.map((item) => {
    if (item.id === "faq-exact-rug") {
      return {
        ...item,
        question: "Is my rug really the exact one I will receive?",
        answer:
          "Yes. One-of-one rugs are listed as exact pieces, not representative samples. Before payment is captured, we confirm the actual rug with you through the inquiry and verification flow.",
      };
    }

    if (item.id === "faq-space-fit") {
      return {
        ...item,
        question: "What if it does not work in my space?",
        answer:
          "Ask before committing. We can review room photos, dimensions, light, and nearby finishes to help judge scale and color. If it still is not right after delivery, eligible pieces have a 14-day return window.",
      };
    }

    if (item.id === "faq-shipping") {
      return {
        ...item,
        question: "How long does shipping take?",
        answer:
          "Pieces ship from Morocco in 5 to 7 business days after final confirmation. Delivery is tracked through DHL for supported launch markets.",
      };
    }

    if (item.id === "faq-price-included") {
      return {
        ...item,
        question: "What is included in the price?",
        answer:
          "The listed price includes the piece, pre-shipment verification, DHL tracked delivery, and duties to the United States, Canada, and Australia. Prices are shown in USD.",
      };
    }

    if (item.id === "faq-color") {
      return {
        ...item,
        question: "How do I know the color is accurate?",
        answer:
          "We review color before payment is captured and can show the piece in natural, warm, and cool light so you are not relying on a single styled photograph.",
      };
    }

    if (item.id === "faq-handmade-variation") {
      return {
        ...item,
        question: "Will a handmade rug have irregularities?",
        answer:
          "Yes, and that is part of the value when the structure is sound. Handmade and vintage pieces can show variation in edge line, pile height, tone, and age. Condition notes are reviewed against the exact piece.",
      };
    }

    return item;
  });

  next.footer.introBody = "";
  next.footer.introMeta = "Prices in USD. Free shipping to the US, Canada, and Australia.";

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
