import type { Metadata } from "next";

import { PolicyPageView } from "@/features/content-pages/policy-page-view";
import { buildManagedMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildManagedMetadata({
    entityType: "static_page",
    entityKey: "privacy-policy",
    title: "Privacy Policy",
    description: "Privacy policy for Loom & Hearth Studio.",
    path: "/privacy-policy",
  });
}

export default function PrivacyPolicyPage() {
  return <PolicyPageView slug="privacy-policy" />;
}