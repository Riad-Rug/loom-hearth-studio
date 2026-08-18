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

  const recentOrder = props.dashboardData?.overview.recentOrder ?? null;
  const overviewContactHref = (recentOrder?.contactHref ?? "/contact") as Route;
  const overviewContactLabel = recentOrder
    ? `Questions about order ${recentOrder.orderNumber}?`
    : "Contact us about an order";

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
          <button className={styles.signOutAction} type="button" onClick={handleSignOutRequest}>
            {routeViewModel.signOut.actionLabel}
          </button>
          {routeViewModel.signOut.message ? <p>{routeViewModel.signOut.message}</p> : null}
        </div>
      </section>

      <section className={styles.dashboardGrid}>
        {accountDashboardSections.map((section) => {
          const sectionView = routeViewModel.sections.find(
            (candidate) => candidate.id === section.id,
          );

          return (
            <article
              key={section.id}
              className={`${styles.dashboardCard} ${
                section.id === "profile" ? styles.profileCard : ""
              }`}
            >
              <h2>{section.title}</h2>
              <p>{section.body}</p>
              {sectionView?.summaryBody ? <strong>{sectionView.summaryBody}</strong> : null}
              {sectionView?.summaryMeta ? <span>{sectionView.summaryMeta}</span> : null}
              {section.id === "overview" ? (
                <div className={styles.quickLinkList}>
                  <Link className={styles.inlineDashboardLink} href={"/shop" as Route}>
                    Browse the collection
                  </Link>
                  <Link className={styles.inlineDashboardLink} href={overviewContactHref}>
                    {overviewContactLabel}
                  </Link>
                </div>
              ) : null}
              {section.id === "orders" ? (
                <div className={styles.orderHistoryList}>
                  {props.dashboardData?.orders.items.map((order) => (
                    <div key={order.id} className={styles.orderHistoryItem}>
                      <div className={styles.orderHistoryItemHeader}>
                        <strong>{order.orderNumber}</strong>
                        <span>{order.placedAtLabel}</span>
                      </div>
                      <span className={styles.orderStatusLine}>{order.statusLabel}</span>

                      {order.reservationPanel ? (
                        <div className={styles.reservationPanel}>
                          <strong>{order.reservationPanel.title}</strong>
                          {order.reservationPanel.lines.map((line) => (
                            <p key={line}>{line}</p>
                          ))}
                        </div>
                      ) : null}

                      <div className={styles.orderLineItemList}>
                        {order.items.map((item) => (
                          <div key={item.id} className={styles.orderLineItem}>
                            {item.imageSrc ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                className={styles.orderLineItemImage}
                                src={item.imageSrc}
                                alt={item.imageAlt ?? item.name}
                                width={64}
                                height={64}
                                loading="lazy"
                              />
                            ) : null}
                            <div className={styles.orderLineItemDetails}>
                              {item.href ? (
                                <Link className={styles.inlineDashboardLink} href={item.href as Route}>
                                  {item.name}
                                </Link>
                              ) : (
                                <span>{item.name}</span>
                              )}
                              {item.variantLabel ? (
                                <span className={styles.orderLineItemMeta}>{item.variantLabel}</span>
                              ) : null}
                              <span className={styles.orderLineItemMeta}>{item.quantityLabel}</span>
                            </div>
                            <span className={styles.orderLineItemPrice}>{item.priceLabel}</span>
                          </div>
                        ))}
                      </div>

                      <div className={styles.orderTotalsList}>
                        <div>
                          <span>Subtotal</span>
                          <span>{order.totals.subtotalLabel}</span>
                        </div>
                        <div>
                          <span>Shipping</span>
                          <span>{order.totals.shippingLabel}</span>
                        </div>
                        <div>
                          <span>Tax</span>
                          <span>{order.totals.taxLabel}</span>
                        </div>
                        {order.totals.discountLabel ? (
                          <div>
                            <span>Discount</span>
                            <span>{order.totals.discountLabel}</span>
                          </div>
                        ) : null}
                        <div className={styles.orderTotalsGrandTotal}>
                          <span>Total</span>
                          <span>{order.totalLabel}</span>
                        </div>
                      </div>

                      <Link className={styles.inlineDashboardLink} href={order.contactHref as Route}>
                        Questions about this order? Reply to your confirmation email, or contact us and
                        mention order {order.orderNumber}.
                      </Link>
                    </div>
                  ))}
                </div>
              ) : null}
              {section.id === "profile" ? (
                <form
                  className={styles.formStack}
                  onSubmit={(event) => {
                    event.preventDefault();
                    handleProfileUpdateRequest();
                  }}
                >
                  <label className={styles.field}>
                    <span>Full name</span>
                    <input
                      placeholder="Full name"
                      type="text"
                      autoComplete="name"
                      value={profileFullName}
                      onChange={(event) => setProfileFullName(event.target.value)}
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Email address</span>
                    <input
                      placeholder="name@example.com"
                      type="email"
                      autoComplete="email"
                      value={profileEmail}
                      onChange={(event) => setProfileEmail(event.target.value)}
                    />
                  </label>
                  <label className={styles.field}>
                    <span>Phone</span>
                    <input
                      placeholder="Phone number (optional)"
                      type="tel"
                      autoComplete="tel"
                      value={profilePhone}
                      onChange={(event) => setProfilePhone(event.target.value)}
                    />
                  </label>
                  <button
                    className={`${styles.primaryAction} ${styles.formPrimaryAction}`}
                    type="submit"
                    disabled={profileUpdateState.status === "submitting"}
                  >
                    Save details
                  </button>
                  {routeViewModel.profileUpdate.stateLine ? (
                    <p className={styles.formSupportCopy} role="status">
                      {routeViewModel.profileUpdate.stateLine}
                    </p>
                  ) : null}
                  {routeViewModel.profileUpdate.message ? (
                    <p
                      className={styles.formSupportCopy}
                      role={profileUpdateState.status === "failure" ? "alert" : "status"}
                    >
                      {routeViewModel.profileUpdate.message}
                    </p>
                  ) : null}
                </form>
              ) : null}
            </article>
          );
        })}
      </section>
    </div>
  );
}
