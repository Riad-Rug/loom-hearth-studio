import type { Route } from "next";
import Link from "next/link";

import { accountDashboardSections } from "@/features/account/account-data";
import { accountGuardTodo, getAccountAccessDecision } from "@/lib/auth";

import styles from "./account.module.css";

export function AccountDashboardPageView() {
  const accessDecision = getAccountAccessDecision({
    user: {
      id: "account-session-placeholder",
      email: "customer@example.com",
    },
    routeKind: "dashboard",
  });

  return (
    <div className={styles.page}>
      <section className={styles.dashboardHero}>
        <div>
          <p className={styles.eyebrow}>Account</p>
          <h1>Customer dashboard shell</h1>
          <p className={styles.lede}>
            This dashboard is placeholder-only. It preserves the account area required by the
            PRD without implementing authentication, order retrieval, or profile management.
          </p>
        </div>
        <div className={styles.dashboardEmptyState}>
          <strong>No live account data yet</strong>
          <p>
            Empty-state presentation only. Real customer data, order history, and account
            actions are not implemented in this slice.
          </p>
        </div>
      </section>

      <section className={styles.sessionCard}>
        <p className={styles.eyebrow}>Session boundary</p>
        <h2>Account auth/session placeholder</h2>
        <p>
          Status: {accessDecision.sessionSummary.status}. Authenticated:{" "}
          {accessDecision.sessionSummary.isAuthenticated ? "yes" : "no"}.
        </p>
        <p>Access: {accessDecision.status}</p>
        <p>Redirect target: {accessDecision.redirectTarget}</p>
        <p>Mode: {accessDecision.sessionSummary.roleLabel}</p>
        <p>{accessDecision.sessionSummary.todo}</p>
        <p>{accountGuardTodo}</p>
      </section>

      {accessDecision.status === "allowed" ? (
        <section className={styles.dashboardGrid}>
          {accountDashboardSections.map((section) => (
            <article key={section.id} className={styles.dashboardCard}>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </article>
          ))}
        </section>
      ) : (
        <section className={styles.sessionCard}>
          <h2>Account gate placeholder</h2>
          <p>This route is reserved for placeholder signed-in customer sessions only.</p>
          <p>Boundary redirect target: {accessDecision.redirectTarget}</p>
        </section>
      )}

      <section className={styles.dashboardLinks}>
        <Link className={styles.secondaryAction} href={"/account/login" as Route}>
          Return to login
        </Link>
        <Link className={styles.secondaryAction} href={"/account/register" as Route}>
          View register shell
        </Link>
      </section>
    </div>
  );
}
