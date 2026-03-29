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
      content: createDefaultHomePageContent(),
      source: "defaults",
      updatedAt: null,
    };
  }

  return {
    content: normalizeHomepageDutiesCopy(normalizeHomepageCloudinaryImages(sanitizeHomePageContent(record.content))),
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

function normalizeHomepageDutiesCopy(content: HomePageContent): HomePageContent {
  const next = structuredClone(content);

  if (next.badges.seo.metaDescription.includes("duties included")) {
    next.badges.seo.metaDescription =
      "Direct sourcing, United States delivery, no unexpected import charges for US orders, and a tightly curated launch selection shape the homepage value highlights.";
  }

  next.badges.items = next.badges.items.map((item) =>
    item.id === "badge-3" && item.label === "Duties included"
      ? { ...item, label: "No unexpected import charges for US orders" }
      : item,
  );

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
