import { allRugsNavLink } from "@/features/catalog/rug-style-collections";
import { storePromise } from "@/lib/order/store-promise";

const promiseMedia = storePromise.approvalMedia.toUpperCase();
const promiseOrigin = storePromise.shipsFromCity.toUpperCase();
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
  alternateName: "Loom & Hearth Studio",
  description:
    `Handmade Moroccan rugs, poufs, pillows and antiques — one of each, sold direct from ${storePromise.shipsFromCity}.`,
  siteUrl: normalizePublicSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  locale: "en-US",
  currency: "USD",
  market: "US",
  ogImagePath: "/og/default-placeholder.jpg",
  tagline:
    `Handmade Moroccan rugs, poufs, pillows and antiques — one of each, sold direct from ${storePromise.shipsFromCity}.`,
  announcementDesktop: `SEE YOUR EXACT PIECE IN ${promiseMedia} BEFORE YOU PAY · FREE SHIPPING ON ORDERS OF $${storePromise.freeShippingThresholdUsd} OR MORE · SHIPS FROM ${promiseOrigin}`,
  announcementMobile: `${promiseMedia} FIRST · FREE SHIPPING $${storePromise.freeShippingThresholdUsd}+`,
  primaryNav: [
    {
      label: "Collection",
      href: "/shop",
      items: [
        { href: "/shop", label: "The Full Collection" },
        {
          href: "/shop/rugs",
          label: "Rugs",
          // SiteHeader replaces these with the live Type and Region pages that
          // have a rug to buy, so a keyword-exact anchor to each is in the
          // rendered HTML of every page (components/layout/site-header.tsx).
          items: [allRugsNavLink],
        },
        { href: "/shop/vintage", label: "Vintage Rugs" },
        { href: "/shop/poufs", label: "Poufs" },
        { href: "/shop/pillows", label: "Pillows" },
        { href: "/shop/decor", label: "Decor & Antiques" },
      ],
    },
    { href: "/trade", label: "Trade" },
    { href: "/blog", label: "Blog" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ],
  // Single source of truth for the owner's public profiles: the footer icons and
  // the Organization JSON-LD sameAs array both read from here. Clearing a value
  // to an empty string hides that channel everywhere, no other code change needed.
  socialLinks: {
    instagram: "https://www.instagram.com/loom.andhearth/",
    youtube: "https://www.youtube.com/@LoomandHearthStudio",
    tiktok: "https://www.tiktok.com/@loom.hearth",
  },
  supportNav: [
    { href: "/contact", label: "Contact" },
    { href: "/faq", label: "FAQ" },
    { href: "/trade", label: "Trade" },
    { href: "/shipping-policy", label: "Shipping" },
    { href: "/returns-policy", label: "Returns" },
    { href: "/privacy-policy", label: "Privacy" },
    { href: "/terms-and-conditions", label: "Terms" },
    { href: "/accessibility-statement", label: "Accessibility" },
  ],
} as const;

