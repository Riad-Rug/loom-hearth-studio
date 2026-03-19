import type { Metadata } from "next";

import { ContactPageView } from "@/features/content-pages/contact-page-view";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Contact Loom & Hearth Studio",
  description:
    "Contact Loom & Hearth Studio for inquiries about handmade Moroccan rugs, custom sourcing, vintage textiles, and curated home decor.",
  path: "/contact",
});

export default function ContactPage() {
  return <ContactPageView />;
}