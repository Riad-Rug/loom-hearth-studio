import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { AboutPageView } from "@/features/content-pages/about-page-view";
import { buildManagedMetadata } from "@/lib/seo/metadata";
import { personSchema } from "@/lib/seo/schema";

export async function generateMetadata(): Promise<Metadata> {
  return buildManagedMetadata({
    entityType: "static_page",
    entityKey: "about",
    title: "About Loom & Hearth: Moroccan Rugs Sourced in Person",
    description:
      "The founder sources every Moroccan rug and handmade piece himself, from souks to mountain workshops, and photographs it in Casablanca before you pay.",
    path: "/about",
  });
}

export default function AboutPage() {
  return (
    <>
      <JsonLd data={personSchema()} />
      <AboutPageView />
    </>
  );
}