import type { Metadata } from "next";

import { ContactPageView } from "@/features/content-pages/contact-page-view";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description: "Contact Loom & Hearth Studio through the static contact page shell.",
  path: "/contact",
});

export default function ContactPage() {
  return <ContactPageView />;
}
