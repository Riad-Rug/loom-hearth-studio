import type { Metadata } from "next";

import { TestimonialsPageView } from "@/features/content-pages/testimonials-page-view";
import { buildManagedMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildManagedMetadata({
    entityType: "static_page",
    entityKey: "testimonials",
    title: "Customer Reviews",
    description: "Reviews will appear here as Loom & Hearth orders are delivered.",
    path: "/testimonials",
    noIndex: true,
  });
}

export default function TestimonialsPage() {
  return <TestimonialsPageView />;
}
