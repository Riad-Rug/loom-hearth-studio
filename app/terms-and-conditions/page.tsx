import type { Metadata } from "next";

import { PolicyPageView } from "@/features/content-pages/policy-page-view";
import { buildManagedMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildManagedMetadata({
    entityType: "static_page",
    entityKey: "terms-and-conditions",
    title: "Terms and Conditions",
    description: "Terms and conditions for Loom & Hearth Studio orders and site use.",
    path: "/terms-and-conditions",
  });
}

export default function TermsAndConditionsPage() {
  return <PolicyPageView slug="terms-and-conditions" />;
}