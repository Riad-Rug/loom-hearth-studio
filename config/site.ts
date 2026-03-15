export const siteConfig = {
  name: "Loom & Hearth Studio",
  description:
    "Premium ecommerce storefront scaffold for handcrafted Moroccan rugs and home decor.",
  siteUrl: "https://example.com",
  locale: "en-US",
  currency: "USD",
  market: "US",
  tagline: "Handcrafted Moroccan rugs and home decor",
  announcement: "United States launch. USD only.",
  primaryNav: [
    { href: "/shop", label: "Shop" },
    { href: "/lookbook", label: "Lookbook" },
    { href: "/blog", label: "Journal" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ],
  supportNav: [
    { href: "/faq", label: "FAQ" },
    { href: "/shipping-policy", label: "Shipping" },
    { href: "/returns-policy", label: "Returns" },
    { href: "/privacy-policy", label: "Privacy" },
    { href: "/terms-and-conditions", label: "Terms" },
  ],
} as const;
