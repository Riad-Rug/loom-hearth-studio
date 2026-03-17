"use client";

import type { ReactNode } from "react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { adminNav } from "@/features/admin/admin-data";
import {
  adminGuardTodo,
  createAdminShellRouteViewModel,
  getAdminAccessDecision,
  type AuthenticatedUser,
} from "@/lib/auth";

import styles from "./admin.module.css";

type AdminShellProps = {
  children: ReactNode;
  authenticatedUser: AuthenticatedUser;
};

export function AdminShell({ children, authenticatedUser }: AdminShellProps) {
  const pathname = usePathname();
  const accessDecision = getAdminAccessDecision({
    user: authenticatedUser,
    moduleKey: "dashboard",
  });
  const routeViewModel = createAdminShellRouteViewModel({
    pathname,
    accessDecision,
    adminGuardTodo,
    adminNav,
  });

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarIntro}>
          <p className={styles.eyebrow}>{routeViewModel.intro.eyebrow}</p>
          <h1>{routeViewModel.intro.title}</h1>
          <p>{routeViewModel.intro.body}</p>
        </div>
        <div className={styles.sessionPanel}>
          <strong>{routeViewModel.session.title}</strong>
          {routeViewModel.session.lines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </div>
        <nav className={styles.nav} aria-label={routeViewModel.navigation.ariaLabel}>
          {routeViewModel.navigation.items.map((item) => (
            <Link
              key={item.href}
              className={`${styles.navLink} ${item.isActive ? styles.navLinkActive : ""}`}
              href={item.href as Route}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className={styles.content}>
        {accessDecision.status === "allowed" ? (
          children
        ) : (
          <section className={styles.gatePanel}>
            <strong>{routeViewModel.gate.title}</strong>
            <p>{routeViewModel.gate.body}</p>
            <p>{routeViewModel.gate.redirectTargetLine}</p>
          </section>
        )}
      </div>
    </div>
  );
}
