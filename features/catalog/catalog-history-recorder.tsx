"use client";

import { useEffect } from "react";

import { recordCategoryInterest, recordSearchInteraction } from "@/lib/catalog/recommendation-history";
import type { ProductCategory } from "@/types/domain";

type CatalogHistoryRecorderProps = {
  category?: ProductCategory;
  query?: string;
  resultCategories?: ProductCategory[];
};

export function CatalogHistoryRecorder({
  category,
  query,
  resultCategories = [],
}: CatalogHistoryRecorderProps) {
  useEffect(() => {
    if (category) {
      recordCategoryInterest(category, 2);
    }
  }, [category]);

  useEffect(() => {
    if (query) {
      recordSearchInteraction(query, resultCategories);
    }
  }, [query, resultCategories]);

  return null;
}
