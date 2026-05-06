import type { Metadata } from "next";

import { TradePageView } from "@/features/trade/trade-page-view";
import { buildManagedMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildManagedMetadata({
    entityType: "static_page",
    entityKey: "trade",
    title: "Trade",
    description:
      "Trade pricing, sourcing support, and direct studio contact for interior designers working with Loom & Hearth Studio.",
    path: "/trade",
  });
}

export default function TradePage() {
  return <TradePageView />;
}
