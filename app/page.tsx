import type { Metadata } from "next";

import { HomePageView } from "@/features/home/home-page-view";
import { getHomepageContent } from "@/lib/homepage/content";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getHomepageContent();

  return buildMetadata({
    title: content.pageSeo.title || content.hero.seo.seoTitle || content.hero.title,
    description:
      content.pageSeo.description || content.hero.seo.metaDescription || content.hero.paragraph,
    path: "/",
  });
}

export default async function HomePage() {
  const content = await getHomepageContent();

  return <HomePageView content={content} />;
}
