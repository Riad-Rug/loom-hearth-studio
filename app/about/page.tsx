import type { Metadata } from "next";

import { AboutPageView } from "@/features/content-pages/about-page-view";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description: "About Loom & Hearth Studio and its editorial storefront direction.",
  path: "/about",
});

export default function AboutPage() {
  return <AboutPageView />;
}
