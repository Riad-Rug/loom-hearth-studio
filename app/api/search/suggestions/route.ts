import { NextResponse } from "next/server";

import { buildCatalogSearchSuggestions } from "@/lib/catalog/search";
import { listCatalogProductCards } from "@/lib/catalog/service";

const SUGGESTION_LIMIT = 6;

export async function GET(request: Request) {
  const query = (new URL(request.url).searchParams.get("q") ?? "").trim().slice(0, 80);

  if (query.length < 2) {
    return NextResponse.json({ query, suggestions: [] });
  }

  try {
    const products = await listCatalogProductCards();
    const suggestions = buildCatalogSearchSuggestions(products, query, SUGGESTION_LIMIT);

    return NextResponse.json({ query, suggestions });
  } catch {
    return NextResponse.json(
      { query, suggestions: [], message: "Could not load search suggestions." },
      { status: 500 },
    );
  }
}
