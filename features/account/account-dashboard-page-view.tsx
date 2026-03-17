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
  type AccountDashboardData,
  type AccountProfileSummaryView,
} from "@/lib/account/dashboard-shared";
import { createAccountDashboardRouteViewModel } from "@/lib/account/dashboard-route";
import {
  accountProfileUpdateTodo,
  createAccountProfileUpdatePayload,
  createInitialAccountProfileUpdateState,
} from "@/lib/account/profile-update";

import styles from "./account.module.css";

export function AccountDashboardPageView(props: {
  dashboardData: AccountDashboardData | null;
  profileSummaryView: AccountProfileSummaryView | null;
}) {
  const placeholderUser = {
    id: "account-session-placeholder",
    email: "customer@example.com",
  };
  const accessDecision = getAccountAccessDecision({
    user: placeholderUser,
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
    accountGuardTodo,
    accountDashboardDataTodo,
    signOutRequestTodo,
    accountProfileUpdateTodo,
  });

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
          message:
            "Enter a full name and valid email address to create the placeholder profile update request.",
        });
        return;
      }

      setProfileUpdateState({
        status: "success",
        payload,
        message:
          "Placeholder profile update request created. Real authenticated profile persistence is not implemented.",
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
        <p className={styles.eyebrow}>Session boundary</p>
        <h2>{routeViewModel.session.title}</h2>
        <p>{routeViewModel.session.statusLine}</p>
        <p>{routeViewModel.session.accessLine}</p>
        <p>{routeViewModel.session.redirectTargetLine}</p>
        <p>{routeViewModel.session.modeLine}</p>
        {routeViewModel.session.todoLines.map((line) => (
          <p key={line}>{line}</p>
        ))}
        <button className={styles.primaryAction} type="button" onClick={handleSignOutRequest}>
          {routeViewModel.signOut.actionLabel}
        </button>
        <p>{routeViewModel.signOut.stateLine}</p>
        {routeViewModel.signOut.message ? <p>{routeViewModel.signOut.message}</p> : null}
        {routeViewModel.signOut.redirectTargetLine ? (
          <p>{routeViewModel.signOut.redirectTargetLine}</p>
        ) : null}
        <p>{signOutRequestTodo}</p>
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
                        placeholder="Customer name placeholder"
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
                        placeholder="Optional phone placeholder"
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
                      Save profile UI placeholder
                    </button>
                    <div className={styles.sessionNote}>
                      <strong>{routeViewModel.profileUpdate.title}</strong>
                      <span>{routeViewModel.profileUpdate.stateLine}</span>
                      {routeViewModel.profileUpdate.message ? (
                        <span>{routeViewModel.profileUpdate.message}</span>
                      ) : null}
                      {routeViewModel.profileUpdate.payloadLine ? (
                        <span>{routeViewModel.profileUpdate.payloadLine}</span>
                      ) : null}
                      <span>{accountProfileUpdateTodo}</span>
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
          <p>{routeViewModel.gate.redirectTargetLine}</p>
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
