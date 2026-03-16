"use client";

import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";

import { accountDashboardSections } from "@/features/account/account-data";
import {
  accountGuardTodo,
  createInitialSignOutRequestState,
  createPlaceholderSignOutRequestState,
  getAccountAccessDecision,
  signOutRequestTodo,
} from "@/lib/auth";
import {
  accountDashboardDataTodo,
  getPlaceholderAccountDashboardData,
} from "@/lib/account/dashboard";

import styles from "./account.module.css";

export function AccountDashboardPageView() {
  const placeholderUser = {
    id: "account-session-placeholder",
    email: "customer@example.com",
  };
  const accessDecision = getAccountAccessDecision({
    user: placeholderUser,
    routeKind: "dashboard",
  });
  const dashboardData = getPlaceholderAccountDashboardData(placeholderUser);
  const [signOutState, setSignOutState] = useState(createInitialSignOutRequestState());

  function handleSignOutRequest() {
    setSignOutState({
      status: "submitting",
      message: null,
      redirectTarget: null,
    });

    window.setTimeout(() => {
      setSignOutState(
        createPlaceholderSignOutRequestState({
          isAuthenticated: accessDecision.sessionSummary.isAuthenticated,
        }),
      );
    }, 350);
  }

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
          {dashboardData ? (
            <>
              <strong>{dashboardData.overview.greeting}</strong>
              <p>{dashboardData.overview.statusLabel}</p>
              <p>{dashboardData.overview.accountEmail}</p>
            </>
          ) : (
            <>
              <strong>No live account data yet</strong>
              <p>
                Empty-state presentation only. Real customer data, order history, and account
                actions are not implemented in this slice.
              </p>
            </>
          )}
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
        <p>{accountDashboardDataTodo}</p>
        <button className={styles.primaryAction} type="button" onClick={handleSignOutRequest}>
          Sign out UI placeholder
        </button>
        <p>Sign-out request state: {signOutState.status}</p>
        {signOutState.message ? <p>{signOutState.message}</p> : null}
        {signOutState.redirectTarget ? <p>Sign-out redirect target: {signOutState.redirectTarget}</p> : null}
        <p>{signOutRequestTodo}</p>
      </section>

      {accessDecision.status === "allowed" ? (
        <section className={styles.dashboardGrid}>
          {accountDashboardSections.map((section) => {
            const summaryBody =
              section.id === "overview"
                ? dashboardData?.overview.statusLabel
                : section.id === "orders"
                  ? dashboardData?.orders.orderCountLabel
                  : dashboardData?.profile.email;

            const summaryMeta =
              section.id === "overview"
                ? dashboardData?.overview.accountEmail
                : section.id === "orders"
                  ? dashboardData?.orders.latestOrderLabel
                  : dashboardData?.profile.phoneLabel;

            return (
              <article key={section.id} className={styles.dashboardCard}>
                <h2>{section.title}</h2>
                <p>{section.body}</p>
                {summaryBody ? <strong>{summaryBody}</strong> : null}
                {summaryMeta ? <span>{summaryMeta}</span> : null}
              </article>
            );
          })}
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
