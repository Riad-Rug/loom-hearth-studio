import type { Metadata } from "next";

import { HomePageView } from "@/features/home/home-page-view";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Home",
  description:
    "Editorial storefront homepage for handcrafted Moroccan rugs and home decor.",
  path: "/",
});

export default function HomePage() {
  return <HomePageView />;
}
