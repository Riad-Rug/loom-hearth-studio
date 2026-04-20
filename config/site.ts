export const siteConfig = {
  name: "Loom & Hearth Studio",
  description:
    "Premium Moroccan rugs, poufs, pillows, and home decor sourced in Marrakech and shipped from Morocco.",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.loomandhearthstudio.com",
  locale: "en-US",
  currency: "USD",
  market: "US",
  ogImagePath: "/og/default-placeholder.jpg",
  tagline: "Handcrafted Moroccan rugs and home decor",
  announcementItems: [
    "FREE SHIPPING TO THE UNITED STATES, CANADA, AND AUSTRALIA",
    "COLOUR VERIFIED BEFORE PAYMENT IS CAPTURED",
    "SHIPS FROM MOROCCO",
  ],
  primaryNav: [
    { href: "/shop", label: "Shop" },
    { href: "/lookbook", label: "Lookbook" },
    {
      label: "Story",
      items: [
        { href: "/about", label: "About" },
        { href: "/sourcing", label: "Sourcing" },
        { href: "/blog", label: "Journal" },
      ],
    },
    { href: "/trade", label: "Trade" },
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

