import type { Route } from "next";
import Link from "next/link";

import { accountDashboardSections } from "@/features/account/account-data";
import { createAuthSessionState, createSessionSummary } from "@/lib/auth";

import styles from "./account.module.css";

export function AccountDashboardPageView() {
  const sessionSummary = createSessionSummary(createAuthSessionState(null, "account"));

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
          Status: {sessionSummary.status}. Authenticated:{" "}
          {sessionSummary.isAuthenticated ? "yes" : "no"}.
        </p>
        <p>Mode: {sessionSummary.roleLabel}</p>
        <p>{sessionSummary.todo}</p>
      </section>

      <section className={styles.dashboardGrid}>
        {accountDashboardSections.map((section) => (
          <article key={section.id} className={styles.dashboardCard}>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </article>
        ))}
      </section>

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
