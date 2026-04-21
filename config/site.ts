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
  name: "Loom & Hearth Studio",
  description:
    "Premium Moroccan rugs, poufs, pillows, and home decor sourced in Marrakech and shipped from Morocco.",
  siteUrl: normalizePublicSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  locale: "en-US",
  currency: "USD",
  market: "US",
  ogImagePath: "/og/default-placeholder.jpg",
  tagline: "Handcrafted Moroccan rugs and home decor",
  announcementItems: [
    "COLOUR VERIFIED BEFORE PAYMENT IS CAPTURED",
    "FREE SHIPPING TO THE UNITED STATES, CANADA, AND AUSTRALIA",
    "SHIPS FROM MOROCCO",
  ],
  primaryNav: [
    { href: "/shop", label: "SHOP" },
    { href: "/lookbook", label: "LOOKBOOK" },
    {
      label: "STORY",
      items: [
        { href: "/about", label: "About" },
        { href: "/sourcing", label: "Sourcing" },
        { href: "/blog", label: "Journal" },
      ],
    },
    { href: "/trade", label: "TRADE" },
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

