import type { Metadata } from "next";

import { TradePageView } from "@/features/trade/trade-page-view";
import { buildManagedMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildManagedMetadata({
    entityType: "static_page",
    entityKey: "trade",
    title: "Trade Program for Interior Designers: Moroccan Rugs & Decor",
    description:
      "Trade pricing and sourcing support for designers buying Moroccan rugs, poufs, pillows and antiques. Direct studio contact, photos and video of the exact piece, US shipping.",
    path: "/trade",
  });
}

export default function TradePage() {
  return <TradePageView />;
}
