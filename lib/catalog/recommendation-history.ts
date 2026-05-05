"use client";

import type { ProductCategory } from "@/types/domain";

const STORAGE_KEY = "loom-hearth:recommendation-history:v1";
const MAX_RECENT_SEARCHES = 6;

type RecommendationHistoryState = {
  categoryScores: Partial<Record<ProductCategory, number>>;
  recentSearches: string[];
  updatedAt: string;
};

const emptyState: RecommendationHistoryState = {
  categoryScores: {},
  recentSearches: [],
  updatedAt: "",
};

export function recordCategoryInterest(category: ProductCategory, weight = 1) {
  const state = readHistoryState();
  state.categoryScores[category] = (state.categoryScores[category] ?? 0) + weight;
  state.updatedAt = new Date().toISOString();
  writeHistoryState(state);
}

export function recordSearchInteraction(query: string, resultCategories: ProductCategory[]) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return;
  }

  const state = readHistoryState();
  const categoryWeights = new Map<ProductCategory, number>();

  resultCategories.forEach((category) => {
    categoryWeights.set(category, (categoryWeights.get(category) ?? 0) + 1);
  });

  for (const [category, count] of categoryWeights.entries()) {
    state.categoryScores[category] = (state.categoryScores[category] ?? 0) + count * 2;
  }

  state.recentSearches = [normalizedQuery, ...state.recentSearches.filter((item) => item !== normalizedQuery)].slice(
    0,
    MAX_RECENT_SEARCHES,
  );
  state.updatedAt = new Date().toISOString();
  writeHistoryState(state);
}

export function getTopRecommendationHistoryCategory() {
  const state = readHistoryState();
  const rankedCategories = Object.entries(state.categoryScores)
    .filter((entry): entry is [ProductCategory, number] => typeof entry[1] === "number")
    .sort((left, right) => right[1] - left[1]);

  return rankedCategories[0]?.[0] ?? null;
}

function readHistoryState(): RecommendationHistoryState {
  if (typeof window === "undefined") {
    return emptyState;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return { ...emptyState, categoryScores: {}, recentSearches: [] };
    }

    const parsed = JSON.parse(raw) as RecommendationHistoryState;

    return {
      categoryScores: parsed.categoryScores ?? {},
      recentSearches: Array.isArray(parsed.recentSearches) ? parsed.recentSearches : [],
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : "",
    };
  } catch {
    return { ...emptyState, categoryScores: {}, recentSearches: [] };
  }
}

function writeHistoryState(state: RecommendationHistoryState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
