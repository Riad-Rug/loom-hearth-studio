import type { Metadata } from "next";

import { HomePageView } from "@/features/home/home-page-view";
import { getHomepageContent } from "@/lib/homepage/content";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Home",
  description:
    "Editorial storefront homepage for handcrafted Moroccan rugs and home decor.",
  path: "/",
});

export default async function HomePage() {
  const content = await getHomepageContent();

  return <HomePageView content={content} />;
}
