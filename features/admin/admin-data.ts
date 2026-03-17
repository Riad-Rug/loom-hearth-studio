export type AdminModuleKey =
  | "dashboard"
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
    title: "Dashboard shell",
    description:
      "Static admin dashboard placeholder only. Real authentication, role enforcement, and operational metrics are not implemented in this slice.",
    cards: [
      {
        title: "Role presentation",
        body: "Admin, Editor, and Viewer roles are part of the PRD, but this slice only notes them as placeholder UI.",
      },
      {
        title: "Operational overview",
        body: "Reserved for future high-level order, customer, and content status summaries.",
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
      "Persisted launch orders can now be retrieved here for visibility. Order mutations, fulfillment actions, and broader operations remain out of scope.",
    cards: [
      {
        title: "Order list",
        body: "Persisted orders are retrieved through the admin orders boundary.",
      },
      {
        title: "Status handling",
        body: "Reserved for paid, shipped, delivered, cancelled, and refunded state visibility.",
      },
    ],
  },
  customers: {
    eyebrow: "Admin customers",
    title: "Customers module shell",
    description:
      "Reserved for future customer management once auth and persistence are validated.",
    cards: [
      {
        title: "Customer records",
        body: "Placeholder customer list and profile area only.",
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
    title: "Newsletter module shell",
    description:
      "Reserved for newsletter tooling after the provider decision is validated.",
    cards: [
      {
        title: "Audience tools",
        body: "Placeholder audience and campaign UI only.",
      },
      {
        title: "Provider integration",
        body: "No Mailchimp/Klaviyo or other provider wiring is implemented in this slice.",
      },
    ],
  },
  promos: {
    eyebrow: "Admin promos",
    title: "Promotions module shell",
    description:
      "Reserved for future promo code and campaign management.",
    cards: [
      {
        title: "Promo definitions",
        body: "Placeholder discount and code configuration surface only.",
      },
      {
        title: "Campaign visibility",
        body: "Reserved for future merchandising and campaign status UI.",
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
