import {
  getRugStyleCollection,
  rugStyleCollections,
  type RugStyleCollectionSlug,
} from "@/features/catalog/rug-style-collections";
import type { ProductCategory } from "@/types/domain";

/**
 * Which part of the catalog a post is about. Posts carry no product field, so
 * the association is read from what the author already wrote: the shop links
 * inside the body first (the last one, since a closing call to action points at
 * what the post is really about), then a rug style named in the slug or title, then the
 * post's own blog category.
 */
export type BlogProductAssociation =
  | { kind: "rugStyle"; style: RugStyleCollectionSlug }
  | { kind: "category"; category: ProductCategory };

type AssociationSource = {
  body: string;
  slug: string;
  title: string;
  categorySlug: string;
};

const shopCategories: readonly ProductCategory[] = ["rugs", "poufs", "pillows", "decor", "vintage"];
const shopLinkPattern = /\]\(\s*(?:https?:\/\/[^/)\s]+)?\/shop\/([^)\s#?]+)/gu;

export function deriveBlogProductAssociation(post: AssociationSource): BlogProductAssociation | null {
  const fromLinks = [...post.body.matchAll(shopLinkPattern)]
    .map((match) => associationFromShopPath(match[1] ?? ""))
    .filter((association) => association !== null);

  if (fromLinks.length > 0) {
    return fromLinks[fromLinks.length - 1] ?? null;
  }

  const words = slugify(`${post.slug} ${post.title}`);

  for (const style of Object.keys(rugStyleCollections) as RugStyleCollectionSlug[]) {
    if (words.includes(`-${style}-`)) {
      return styleAssociation(style);
    }
  }

  if (words.includes("-pouf")) {
    return { kind: "category", category: "poufs" };
  }

  if (words.includes("-pillow")) {
    return { kind: "category", category: "pillows" };
  }

  if (post.categorySlug === "rugs") {
    return { kind: "category", category: "rugs" };
  }

  return null;
}

function associationFromShopPath(path: string): BlogProductAssociation | null {
  const [first, second] = path.split("/").filter(Boolean);

  if (first === "rugs" && second && getRugStyleCollection(second)) {
    return styleAssociation(second as RugStyleCollectionSlug);
  }

  const category = shopCategories.find((candidate) => candidate === first);

  return category ? { kind: "category", category } : null;
}

function styleAssociation(style: RugStyleCollectionSlug): BlogProductAssociation {
  return style === "vintage"
    ? { kind: "category", category: "vintage" }
    : { kind: "rugStyle", style };
}

function slugify(value: string) {
  return `-${value
    .toLowerCase()
    .replace(/['’]/gu, "")
    .replace(/[^a-z0-9]+/gu, "-")}-`;
}
