export type AdminModuleKey =
  | "dashboard"
  | "homepage"
  | "products"
  | "orders"
  | "customers"
  | "blog"
  | "newsletter"
  | "promos"
  | "seo"
  | "analytics";

export const adminNav = [
  { key: "dashboard", label: "Dashboard", href: "/admin" },
  { key: "homepage", label: "Homepage", href: "/admin/homepage" },
  { key: "products", label: "Products", href: "/admin/products" },
  { key: "orders", label: "Orders", href: "/admin/orders" },
  { key: "customers", label: "Customers", href: "/admin/customers" },
  { key: "blog", label: "Blog", href: "/admin/blog" },
  { key: "newsletter", label: "Newsletter", href: "/admin/newsletter" },
  { key: "promos", label: "Promos", href: "/admin/promos" },
  { key: "seo", label: "SEO", href: "/admin/seo" },
  { key: "analytics", label: "Analytics", href: "/admin/analytics" },
] as const;

export const adminModules: Record<
  AdminModuleKey,
  {
    eyebrow: string;
    title: string;
    description: string;
    cards: { title: string; body: string }[];
  }
> = {
  dashboard: {
    eyebrow: "Admin",
    title: "Control center",
    description: "Focused shortcuts for launch-safe admin work.",
    cards: [
      {
        title: "Quick actions",
        body: "Primary admin routes are surfaced directly in the dashboard.",
      },
      {
        title: "Secondary modules",
        body: "Content and marketing surfaces remain accessible without crowding the page.",
      },
    ],
  },
  homepage: {
    eyebrow: "Admin homepage",
    title: "Homepage manager",
    description:
      "Edit the storefront homepage, brand presentation, and footer content from a persisted admin-managed record.",
    cards: [
      {
        title: "Section-based editing",
        body: "Hero, trust, categories, featured directions, newsletter, and footer content are grouped into practical editing blocks.",
      },
      {
        title: "Persisted content",
        body: "Homepage content now saves through Prisma/PostgreSQL instead of being scattered across static code paths.",
      },
    ],
  },
  products: {
    eyebrow: "Admin products",
    title: "Products module shell",
    description:
      "Reserved for future product management across rug and multi-unit models.",
    cards: [
      {
        title: "Catalog management",
        body: "Placeholder area for product listing, creation, and editing workflows.",
      },
      {
        title: "Media and merchandising",
        body: "Reserved for Cloudinary-backed media and merchandising controls later.",
      },
    ],
  },
  orders: {
    eyebrow: "Admin orders",
    title: "Orders module shell",
    description:
      "Persisted launch orders can now be retrieved here for visibility, and launch-safe status updates are supported. Fulfillment actions and broader operations remain out of scope.",
    cards: [
      {
        title: "Order list",
        body: "Persisted orders are retrieved through the admin orders boundary.",
      },
      {
        title: "Status handling",
        body: "Launch-safe persisted order status updates are available without adding broader workflow automation.",
      },
    ],
  },
  customers: {
    eyebrow: "Admin customers",
    title: "Customers module shell",
    description:
      "Persisted customer-related launch data can now be retrieved from order history. Customer mutations and auth-backed profile management remain out of scope.",
    cards: [
      {
        title: "Customer records",
        body: "Persisted customer summaries are retrieved through the admin customers boundary.",
      },
      {
        title: "Customer communication",
        body: "Reserved for future compose/contact tooling after email decisions are validated.",
      },
    ],
  },
  blog: {
    eyebrow: "Admin blog",
    title: "Blog module shell",
    description:
      "Reserved for editorial publishing workflows tied to the PRD blog surface.",
    cards: [
      {
        title: "Post editor",
        body: "Placeholder article editing surface only.",
      },
      {
        title: "Category management",
        body: "Reserved for future blog taxonomy and publishing controls.",
      },
    ],
  },
  newsletter: {
    eyebrow: "Admin newsletter",
    title: "Newsletter",
    description:
      "Audience records, Mailchimp sync status, and subscriber health are managed here.",
    cards: [
      {
        title: "Audience tools",
        body: "Subscriber records and sync status are available in the dedicated newsletter page.",
      },
      {
        title: "Provider integration",
        body: "Mailchimp is the active provider for outward audience sync.",
      },
    ],
  },
  promos: {
    eyebrow: "Admin promos",
    title: "Promotions",
    description:
      "Promo code creation, activation, and launch-safe discount rules are managed here.",
    cards: [
      {
        title: "Promo definitions",
        body: "Percent and fixed discounts can be created and toggled from the dedicated promos page.",
      },
      {
        title: "Campaign visibility",
        body: "Promo usage and activation state are available for launch operations.",
      },
    ],
  },
  seo: {
    eyebrow: "Admin SEO",
    title: "SEO module shell",
    description:
      "Reserved for future metadata and route-level SEO controls aligned to the PRD.",
    cards: [
      {
        title: "Metadata controls",
        body: "Placeholder title, description, and route SEO UI only.",
      },
      {
        title: "Indexing guidance",
        body: "Reserved for sitemap, canonical, and metadata review tooling later.",
      },
    ],
  },
  analytics: {
    eyebrow: "Admin analytics",
    title: "Analytics module shell",
    description:
      "Reserved for future reporting dashboards once analytics decisions are validated.",
    cards: [
      {
        title: "Performance visibility",
        body: "Placeholder chart and KPI area only.",
      },
      {
        title: "Commerce reporting",
        body: "Reserved for future order, customer, and content analytics surfaces.",
      },
    ],
  },
};
