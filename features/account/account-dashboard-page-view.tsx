"use client";

import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";
import { signOut } from "next-auth/react";

import { accountDashboardSections } from "@/features/account/account-data";
import {
  createInitialSignOutRequestState,
  getAccountAccessDecision,
  type AuthenticatedUser,
} from "@/lib/auth";
import {
  type AccountDashboardData,
  type AccountProfileSummaryView,
} from "@/lib/account/dashboard-shared";
import { createAccountDashboardRouteViewModel } from "@/lib/account/dashboard-route";
import {
  createAccountProfileUpdatePayload,
  createInitialAccountProfileUpdateState,
} from "@/lib/account/profile-update";

import styles from "./account.module.css";

export function AccountDashboardPageView(props: {
  authenticatedUser: AuthenticatedUser;
  dashboardData: AccountDashboardData | null;
  profileSummaryView: AccountProfileSummaryView | null;
}) {
  const accessDecision = getAccountAccessDecision({
    user: props.authenticatedUser,
    routeKind: "dashboard",
  });
  const [signOutState, setSignOutState] = useState(createInitialSignOutRequestState());
  const [profileFullName, setProfileFullName] = useState(
    props.dashboardData?.profile.fullName ?? "",
  );
  const [profileEmail, setProfileEmail] = useState(props.dashboardData?.profile.email ?? "");
  const [profilePhone, setProfilePhone] = useState(props.dashboardData?.profile.phone ?? "");
  const [profileUpdateState, setProfileUpdateState] = useState(
    createInitialAccountProfileUpdateState(),
  );
  const routeViewModel = createAccountDashboardRouteViewModel({
    accessDecision,
    dashboardData: props.dashboardData,
    profileSummaryView: props.profileSummaryView,
    signOutState,
    profileUpdateState,
    accountGuardTodo: "",
    accountDashboardDataTodo: "",
    signOutRequestTodo: "",
    accountProfileUpdateTodo: "",
  });

  async function handleSignOutRequest() {
    setSignOutState({
      status: "submitting",
      message: null,
      redirectTarget: null,
    });

    try {
      await signOut({
        redirect: false,
        callbackUrl: "/account/login",
      });

      setSignOutState({
        status: "success",
        message: "Signed out.",
        redirectTarget: "/account/login",
      });

      window.location.assign("/account/login");
    } catch {
      setSignOutState({
        status: "failure",
        message: "Sign-out failed before the session could be cleared.",
        redirectTarget: null,
      });
    }
  }

  function handleProfileUpdateRequest() {
    const payload = createAccountProfileUpdatePayload({
      fullName: profileFullName,
      email: profileEmail,
      phone: profilePhone,
    });

    setProfileUpdateState({
      status: "submitting",
      payload,
      message: null,
    });

    window.setTimeout(() => {
      if (!payload) {
        setProfileUpdateState({
          status: "failure",
          payload: null,
          message: "Enter your full name and a valid email address before saving.",
        });
        return;
      }

      setProfileUpdateState({
        status: "success",
        payload,
        message: "Your details are saved for this session.",
      });
    }, 350);
  }

  return (
    <div className={styles.page}>
      <section className={styles.dashboardHero}>
        <div>
          <p className={styles.eyebrow}>Account</p>
          <h1>{routeViewModel.hero.title}</h1>
          <p className={styles.lede}>{routeViewModel.hero.body}</p>
        </div>
        <div className={styles.dashboardEmptyState}>
          <strong>{routeViewModel.hero.emptyStateTitle}</strong>
          {routeViewModel.hero.emptyStateLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </section>

      <section className={styles.sessionCard}>
        <p className={styles.eyebrow}>Account</p>
        <h2>{routeViewModel.session.title}</h2>
        <p>{routeViewModel.session.statusLine}</p>
        {routeViewModel.session.accessLine ? <p>{routeViewModel.session.accessLine}</p> : null}
        <button className={styles.primaryAction} type="button" onClick={handleSignOutRequest}>
          {routeViewModel.signOut.actionLabel}
        </button>
        {routeViewModel.signOut.message ? <p>{routeViewModel.signOut.message}</p> : null}
      </section>

      {accessDecision.status === "allowed" ? (
        <section className={styles.dashboardGrid}>
          {accountDashboardSections.map((section) => {
            const sectionView = routeViewModel.sections.find(
              (candidate) => candidate.id === section.id,
            );

            return (
              <article key={section.id} className={styles.dashboardCard}>
                <h2>{section.title}</h2>
                <p>{section.body}</p>
                {sectionView?.summaryBody ? <strong>{sectionView.summaryBody}</strong> : null}
                {sectionView?.summaryMeta ? <span>{sectionView.summaryMeta}</span> : null}
                {section.id === "orders" ? (
                  <div className={styles.orderHistoryList}>
                    {props.dashboardData?.orders.items.map((order) => (
                      <div key={order.id} className={styles.orderHistoryItem}>
                        <strong>{order.orderNumber}</strong>
                        <span>{order.statusLabel}</span>
                        <span>{order.placedAtLabel}</span>
                        <span>{order.totalLabel}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
                {section.id === "profile" ? (
                  <div className={styles.formStack}>
                    {routeViewModel.profileSummaryView ? (
                      <div className={styles.profileSummaryList}>
                        <strong>{routeViewModel.profileSummaryView.fullNameLabel}</strong>
                        {routeViewModel.profileSummaryView.contactRows.map((row) => (
                          <div key={row.id} className={styles.profileSummaryItem}>
                            <span>{row.label}</span>
                            <strong
                              className={
                                row.tone === "muted" ? styles.mutedSummaryValue : undefined
                              }
                            >
                              {row.value}
                            </strong>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    <label className={styles.field}>
                      <span>Full name</span>
                      <input
                        placeholder="Full name"
                        type="text"
                        value={profileFullName}
                        onChange={(event) => setProfileFullName(event.target.value)}
                      />
                    </label>
                    <label className={styles.field}>
                      <span>Email address</span>
                      <input
                        placeholder="name@example.com"
                        type="email"
                        value={profileEmail}
                        onChange={(event) => setProfileEmail(event.target.value)}
                      />
                    </label>
                    <label className={styles.field}>
                      <span>Phone</span>
                      <input
                        placeholder="Phone number (optional)"
                        type="tel"
                        value={profilePhone}
                        onChange={(event) => setProfilePhone(event.target.value)}
                      />
                    </label>
                    <button
                      className={styles.primaryAction}
                      type="button"
                      onClick={handleProfileUpdateRequest}
                    >
                      Save details
                    </button>
                    <div className={styles.sessionNote}>
                      <strong>{routeViewModel.profileUpdate.title}</strong>
                      {routeViewModel.profileUpdate.stateLine ? (
                        <span>{routeViewModel.profileUpdate.stateLine}</span>
                      ) : null}
                      {routeViewModel.profileUpdate.message ? (
                        <span>{routeViewModel.profileUpdate.message}</span>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </section>
      ) : (
        <section className={styles.sessionCard}>
          <h2>{routeViewModel.gate.title}</h2>
          <p>{routeViewModel.gate.body}</p>
        </section>
      )}

      <section className={styles.dashboardLinks}>
        <Link className={styles.secondaryAction} href={"/account/login" as Route}>
          Return to sign in
        </Link>
        <Link className={styles.secondaryAction} href={"/account/register" as Route}>
          Create account
        </Link>
      </section>
    </div>
  );
}