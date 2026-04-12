import type { Metadata } from "next";

import { AboutPageView } from "@/features/content-pages/about-page-view";
import { buildManagedMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildManagedMetadata({
    entityType: "static_page",
    entityKey: "about",
    title: "About",
    description:
      "About Loom & Hearth Studio, its Marrakech sourcing roots, and its approach to handcrafted Moroccan rugs and home decor.",
    path: "/about",
  });
}

export default function AboutPage() {
  return <AboutPageView />;
}