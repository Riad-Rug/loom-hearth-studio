import type { Metadata } from "next";

import { PolicyPageView } from "@/features/content-pages/policy-page-view";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description: "Privacy policy placeholder page for Loom & Hearth Studio.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return <PolicyPageView slug="privacy-policy" />;
}
