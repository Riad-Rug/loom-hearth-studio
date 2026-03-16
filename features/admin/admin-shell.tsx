import type { ReactNode } from "react";
import type { Route } from "next";
import Link from "next/link";

import { adminNav } from "@/features/admin/admin-data";
import { adminGuardTodo, getAdminAccessDecision } from "@/lib/auth";

import styles from "./admin.module.css";

type AdminShellProps = {
  children: ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  const accessDecision = getAdminAccessDecision({
    user: {
      id: "admin-session-placeholder",
      email: "admin@example.com",
      role: "admin",
    },
    moduleKey: "dashboard",
  });

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarIntro}>
          <p className={styles.eyebrow}>Admin</p>
          <h1>Back office shell</h1>
          <p>
            Placeholder-only admin shell. Route protection and role enforcement are not
            implemented.
          </p>
        </div>
        <div className={styles.sessionPanel}>
          <strong>Session boundary</strong>
          <span>Status: {accessDecision.sessionSummary.status}</span>
          <span>Role: {accessDecision.sessionSummary.roleLabel}</span>
          <span>Access: {accessDecision.status}</span>
          <span>Redirect target: {accessDecision.redirectTarget}</span>
          <span>{accessDecision.sessionSummary.todo}</span>
          <span>{adminGuardTodo}</span>
        </div>
        <nav className={styles.nav} aria-label="Admin navigation">
          {adminNav.map((item) => (
            <Link key={item.href} className={styles.navLink} href={item.href as Route}>
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
            <strong>Admin access placeholder gate</strong>
            <p>
              Admin routes require a placeholder-authenticated admin surface session with a
              supported PRD role.
            </p>
            <p>Boundary redirect target: {accessDecision.redirectTarget}</p>
          </section>
        )}
      </div>
    </div>
  );
}
