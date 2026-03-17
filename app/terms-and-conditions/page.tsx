import type { Metadata } from "next";

import { PolicyPageView } from "@/features/content-pages/policy-page-view";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Terms and Conditions",
  description: "Terms and conditions for the Loom & Hearth Studio launch storefront.",
  path: "/terms-and-conditions",
});

export default function TermsAndConditionsPage() {
  return <PolicyPageView slug="terms-and-conditions" />;
}
