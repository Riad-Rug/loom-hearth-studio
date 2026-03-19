import type { Route } from "next";
import Link from "next/link";

import { adminModules, type AdminModuleKey } from "@/features/admin/admin-data";
import {
  adminGuardTodo,
  createAdminGatePresentation,
  createAdminModuleRouteViewModel,
  getAdminAccessDecision,
} from "@/lib/auth";
import { requireAuthenticatedAdminUser } from "@/lib/auth/service";

import styles from "./admin.module.css";

type AdminModulePageViewProps = {
  moduleKey: AdminModuleKey;
  moduleOverride?: {
    eyebrow: string;
    title: string;
    description: string;
    cards: { title: string; body: string; lines?: string[] }[];
  };
};

type DashboardAction = {
  title: string;
  body: string;
  href: Route;
  label: string;
  tone?: "primary" | "secondary";
};

const dashboardPrimaryActions: DashboardAction[] = [
  {
    title: "Homepage manager",
    body: "Edit the storefront homepage.",
    href: "/admin/homepage",
    label: "Open homepage",
    tone: "primary",
  },
  {
    title: "Add product",
    body: "Start a new catalog entry.",
    href: "/admin/products/new",
    label: "Create item",
    tone: "primary",
  },
  {
    title: "View products",
    body: "Open the catalog list.",
    href: "/admin/products",
    label: "Open catalog",
  },
  {
    title: "Review orders",
    body: "Check persisted launch orders.",
    href: "/admin/orders",
    label: "Open orders",
  },
  {
    title: "View customers",
    body: "Browse customer summaries.",
    href: "/admin/customers",
    label: "Open customers",
  },
];

const dashboardSecondaryActions: DashboardAction[] = [
  {
    title: "Blog",
    body: "Editorial workspace.",
    href: "/admin/blog",
    label: "Open",
  },
  {
    title: "Newsletter",
    body: "Audience tooling.",
    href: "/admin/newsletter",
    label: "Open",
  },
  {
    title: "Promos",
    body: "Campaign management.",
    href: "/admin/promos",
    label: "Open",
  },
  {
    title: "SEO",
    body: "Metadata controls.",
    href: "/admin/seo",
    label: "Open",
  },
  {
    title: "Analytics",
    body: "Reporting surface.",
    href: "/admin/analytics",
    label: "Open",
  },
];

function renderDashboardView(routeViewModel: {
  header: {
    eyebrow: string;
    title: string;
    description: string;
  };
}) {
  return (
    <>
      <header className={styles.moduleHeaderCompact}>
        <p className={styles.eyebrow}>{routeViewModel.header.eyebrow}</p>
        <h2>{routeViewModel.header.title}</h2>
      </header>

      <div className={styles.dashboardStatusBar}>
        <span className={styles.statusPill}>Signed in as admin</span>
        <span className={styles.statusPill}>Access allowed</span>
        <span className={styles.statusPill}>10 modules available</span>
      </div>

      <section className={styles.dashboardSection}>
        <div className={styles.sectionHeaderCompact}>
          <p className={styles.eyebrow}>Quick actions</p>
          <h3>Core admin work</h3>
        </div>
        <div className={styles.quickActionGrid}>
          {dashboardPrimaryActions.map((action) => (
            <article key={action.title} className={styles.quickActionCard}>
              <div className={styles.quickActionCopy}>
                <h4>{action.title}</h4>
                <p>{action.body}</p>
              </div>
              <Link
                className={`${styles.inlineActionLink} ${
                  action.tone === "primary" ? styles.inlineActionLinkPrimary : ""
                }`}
                href={action.href}
              >
                {action.label}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.dashboardSection}>
        <div className={styles.sectionHeaderCompact}>
          <p className={styles.eyebrow}>Secondary modules</p>
          <h3>Content and marketing</h3>
        </div>
        <div className={styles.secondaryActionGrid}>
          {dashboardSecondaryActions.map((action) => (
            <article key={action.title} className={styles.secondaryActionCard}>
              <div className={styles.secondaryActionCopy}>
                <h4>{action.title}</h4>
                <p>{action.body}</p>
              </div>
              <Link className={styles.secondaryActionLink} href={action.href}>
                {action.label}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <p className={styles.dashboardMetaInline}>
        Launch-safe control surface only. Metrics, automation, and deeper role tooling are not implemented here.
      </p>
    </>
  );
}

export async function AdminModulePageView({
  moduleKey,
  moduleOverride,
}: AdminModulePageViewProps) {
  const module = moduleOverride ?? adminModules[moduleKey];
  const authenticatedUser = await requireAuthenticatedAdminUser();
  const accessDecision = getAdminAccessDecision({
    user: authenticatedUser,
    moduleKey,
  });
  const gatePresentation = createAdminGatePresentation(accessDecision);
  const routeViewModel = createAdminModuleRouteViewModel({
    moduleKey,
    module,
    accessDecision,
    gatePresentation,
    adminGuardTodo,
  });

  return (
    <section className={styles.moduleShell}>
      {routeViewModel.accessStatus === "allowed" ? (
        moduleKey === "dashboard" ? (
          renderDashboardView(routeViewModel)
        ) : (
          <>
            <header className={styles.moduleHeader}>
              <p className={styles.eyebrow}>{routeViewModel.header.eyebrow}</p>
              <h2>{routeViewModel.header.title}</h2>
              <p>{routeViewModel.header.description}</p>
            </header>

            <div className={styles.roleNote}>
              <strong>{routeViewModel.roleNote.title}</strong>
              {routeViewModel.roleNote.lines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </div>

            <div className={styles.cardGrid}>
              {routeViewModel.cards.map((card) => (
                <article key={card.id} className={styles.card}>
                  <p className={styles.cardEyebrow}>{card.eyebrow}</p>
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                  {card.lines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </article>
              ))}
            </div>
          </>
        )
      ) : (
        <div className={styles.gatePanel}>
          <strong>{routeViewModel.gate.title}</strong>
          <p>{routeViewModel.gate.body}</p>
          <p>{routeViewModel.gate.redirectLabel}</p>
        </div>
      )}
    </section>
  );
}
