import type { EntityStatus, MediaAsset, SeoFields } from "@/types/domain/common";

export type BlogPost = SeoFields & {
  id: string;
  slug: string;
  categorySlug: string;
  title: string;
  excerpt: string;
  body: string;
  featuredImage?: MediaAsset;
  publishedAt?: string;
  status: EntityStatus;
};

export type BlogAuthor = {
  name: string;
  bio: string;
  photoUrl?: string | null;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
};

export type Testimonial = {
  id: string;
  quote: string;
  customerName: string;
  location?: string;
  avatarUrl?: string;
  sortOrder: number;
};

export type LookbookEntry = {
  id: string;
  title: string;
  description?: string;
  media: MediaAsset[];
  sortOrder: number;
};

export type PolicyPage = SeoFields & {
  slug:
    | "shipping-policy"
    | "returns-policy"
    | "privacy-policy"
    | "terms-and-conditions";
  title: string;
  body: string;
};
