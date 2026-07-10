const productionSiteUrl = "https://www.loomandhearthstudio.com";
const previewHostnames = new Set(["loom-hearth-studio.vercel.app"]);
const apexHostname = "loomandhearthstudio.com";
const canonicalHostname = "www.loomandhearthstudio.com";

export function normalizePublicSiteUrl(value: string | undefined) {
  const candidate = value?.trim() || productionSiteUrl;

  try {
    const url = new URL(candidate);

    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
      return url.origin;
    }

    if (
      url.hostname === apexHostname ||
      url.hostname.endsWith(".vercel.app") ||
      previewHostnames.has(url.hostname)
    ) {
      return productionSiteUrl;
    }

    return url.origin;
  } catch {
    return productionSiteUrl;
  }
}

export function normalizePublicUrl(value: string, fallbackBase = siteConfig.siteUrl) {
  const url = new URL(value, fallbackBase);

  if (
    url.hostname === apexHostname ||
    url.hostname.endsWith(".vercel.app") ||
    previewHostnames.has(url.hostname)
  ) {
    const productionUrl = new URL(productionSiteUrl);
    url.protocol = productionUrl.protocol;
    url.hostname = canonicalHostname;
    url.port = productionUrl.port;
  }

  return url.toString();
}

export const siteConfig = {
  name: "Loom & Hearth",
  description:
    "Handmade Moroccan rugs, poufs, pillows and antiques — one of each, sold direct from Casablanca.",
  siteUrl: normalizePublicSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  locale: "en-US",
  currency: "USD",
  market: "US",
  ogImagePath: "/og/default-placeholder.jpg",
  tagline:
    "Handmade Moroccan rugs, poufs, pillows and antiques — one of each, sold direct from Casablanca.",
  announcementDesktop:
    "SEE YOUR EXACT PIECE IN DAYLIGHT PHOTOS BEFORE YOU PAY · FREE SHIPPING OVER $150 · US · CA · AU · SHIPS FROM CASABLANCA",
  announcementMobile: "APPROVE YOUR PIECE BEFORE YOU PAY · FREE SHIPPING OVER $150 · US · CA · AU",
  primaryNav: [
    { href: "/shop/rugs", label: "Rugs" },
    { href: "/shop/poufs", label: "Poufs" },
    { href: "/shop/pillows", label: "Pillows" },
    { href: "/shop/decor", label: "Decor & Antiques" },
    { href: "/blog", label: "Journal" },
    { href: "/about", label: "About" },
  ],
  supportNav: [
    { href: "/contact", label: "Contact" },
    { href: "/faq", label: "FAQ" },
    { href: "/sourcing", label: "Sourcing" },
    { href: "/trade", label: "Trade" },
    { href: "/shipping-policy", label: "Shipping" },
    { href: "/returns-policy", label: "Returns" },
    { href: "/privacy-policy", label: "Privacy" },
    { href: "/terms-and-conditions", label: "Terms" },
    { href: "/accessibility-statement", label: "Accessibility" },
  ],
} as const;

