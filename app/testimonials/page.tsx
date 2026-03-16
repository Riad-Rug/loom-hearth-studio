import type { Metadata } from "next";

import { TestimonialsPageView } from "@/features/content-pages/testimonials-page-view";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Testimonials",
  description: "Customer testimonials placeholder page for Loom & Hearth Studio.",
  path: "/testimonials",
});

export default function TestimonialsPage() {
  return <TestimonialsPageView />;
}
