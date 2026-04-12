import { unstable_noStore as noStore } from "next/cache";

import { createSeoSettingRepository } from "@/lib/db/repositories/seo-setting-repository";

export type SeoSettingInput = {
  entityType: string;
  entityKey: string;
  title: string | null;
  description: string | null;
  canonicalUrl: string | null;
  robotsIndex: boolean | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImageUrl: string | null;
};

export async function listSeoSettings() {
  noStore();
  return createSeoSettingRepository().list();
}

export async function getSeoSetting(input: { entityType: string; entityKey: string }) {
  noStore();
  return createSeoSettingRepository().getByEntity(input);
}

export async function saveSeoSetting(input: SeoSettingInput) {
  return createSeoSettingRepository().save(input);
}