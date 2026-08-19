"use client";

import { Fragment, useState, type Dispatch, type SetStateAction } from "react";

import {
  adminOrderStatusOptions,
  orderStatusTransitionNeedsConfirmation,
  type AdminOrderStatusOption,
} from "@/lib/admin/order-status";
import type {
  AdminOrderCostsUpdateResult,
  AdminOrderManagementItem,
  AdminOrderPhotosSentUpdateResult,
  AdminOrderStatusUpdateResult,
  AdminOrderTrackingUpdateResult,
  AdminOrdersModuleData,
} from "@/lib/admin/orders";

import styles from "./admin.module.css";

type StatusFilterOption = "all" | AdminOrderStatusOption;

const statusFilterOptions: StatusFilterOption[] = ["all", ...adminOrderStatusOptions];

type AdminOrdersModuleViewProps = AdminOrdersModuleData;

type UpdateState = {
  status: "idle" | "submitting" | "success" | "failure";
  message: string | null;
};

const EMPTY_UPDATE_STATE: UpdateState = {
  status: "idle",
  message: null,
};

type TrackingDraft = {
  trackingNumber: string;
  carrier: string;
};

type CostDraft = {
  productCostUsd: string;
  shippingCostUsd: string;
  packagingCostUsd: string;
  paymentFeeUsd: string;
  otherCostUsd: string;
};

const costDraftFieldKeys = [
  "productCostUsd",
  "shippingCostUsd",
  "packagingCostUsd",
  "paymentFeeUsd",
  "otherCostUsd",
] as const satisfies ReadonlyArray<keyof CostDraft>;

function createExpandableSetToggle(setState: Dispatch<SetStateAction<Set<string>>>) {
  return (orderId: string) => {
    setState((current) => {
      const next = new Set(current);

      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }

      return next;
    });
  };
}

export function AdminOrdersModuleView(props: AdminOrdersModuleViewProps) {
  const [items, setItems] = useState(props.items);
  const [summaryMetrics, setSummaryMetrics] = useState(props.summaryMetrics);
  const [selectedStatuses, setSelectedStatuses] = useState<Record<string, AdminOrderStatusOption>>(
    () =>
      Object.fromEntries(
        props.items.map((item): [string, AdminOrderStatusOption] => [item.id, item.status]),
      ),
  );
  const [updateStates, setUpdateStates] = useState<Record<string, UpdateState>>(() =>
    Object.fromEntries(
      props.items.map((item): [string, UpdateState] => [
        item.id,
        { status: "idle", message: null },
      ]),
    ),
  );
  const [photosSentStates, setPhotosSentStates] = useState<Record<string, UpdateState>>(() =>
    Object.fromEntries(
      props.items.map((item): [string, UpdateState] => [item.id, { status: "idle", message: null }]),
    ),
  );
  const [trackingUpdateStates, setTrackingUpdateStates] = useState<Record<string, UpdateState>>(() =>
    Object.fromEntries(
      props.items.map((item): [string, UpdateState] => [item.id, { status: "idle", message: null }]),
    ),
  );
  const [costsUpdateStates, setCostsUpdateStates] = useState<Record<string, UpdateState>>(() =>
    Object.fromEntries(
      props.items.map((item): [string, UpdateState] => [item.id, { status: "idle", message: null }]),
    ),
  );
  const [trackingDrafts, setTrackingDrafts] = useState<Record<string, TrackingDraft>>(() =>
    Object.fromEntries(
      props.items.map((item): [string, TrackingDraft] => [
        item.id,
        { trackingNumber: item.trackingNumber ?? "", carrier: item.carrier ?? "" },
      ]),
    ),
  );
  const [costDrafts, setCostDrafts] = useState<Record<string, CostDraft>>(() =>
    Object.fromEntries(
      props.items.map((item): [string, CostDraft] => [item.id, createCostDraftFromItem(item)]),
    ),
  );
  const [statusFilter, setStatusFilter] = useState<StatusFilterOption>("all");
  const [expandedHistoryOrderIds, setExpandedHistoryOrderIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [expandedTrackingOrderIds, setExpandedTrackingOrderIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [expandedCostsOrderIds, setExpandedCostsOrderIds] = useState<Set<string>>(() => new Set());

  const toggleHistory = createExpandableSetToggle(setExpandedHistoryOrderIds);
  const toggleTracking = createExpandableSetToggle(setExpandedTrackingOrderIds);
  const toggleCosts = createExpandableSetToggle(setExpandedCostsOrderIds);

  function expandTrackingPanel(orderId: string) {
    setExpandedTrackingOrderIds((current) => {
      if (current.has(orderId)) {
        return current;
      }

      const next = new Set(current);
      next.add(orderId);
      return next;
    });
  }

  async function handlePhotosSent(orderId: string, overwrite: boolean) {
    setPhotosSentStates((current) => ({
      ...current,
      [orderId]: { status: "submitting", message: null },
    }));

    try {
      const response = await fetch("/api/admin/orders/photos-sent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, overwrite }),
      });
      const result = (await response.json()) as AdminOrderPhotosSentUpdateResult;

      setPhotosSentStates((current) => ({
        ...current,
        [orderId]: {
          status: result.status === "updated" ? "success" : "failure",
          message: result.message,
        },
      }));

      if (result.order) {
        const photosSentAt = result.order.photosSentAt ?? null;

        setItems((current) =>
          current.map((item) =>
            item.id === orderId
              ? {
                  ...item,
                  photosSentAt,
                  photosSentAtLabel: photosSentAt ? formatTimestamp(photosSentAt) : null,
                }
              : item,
          ),
        );
      }
    } catch {
      setPhotosSentStates((current) => ({
        ...current,
        [orderId]: { status: "failure", message: "Update failed — try again." },
      }));
    }
  }

  // Thin wrapper around handlePhotosSent: recording for the first time needs
  // no confirmation, but re-recording moves the customer-visible "approve
  // by" deadline shown on their account page, so that path is gated behind
  // an explicit confirm and passes `overwrite: true` through to the server.
  async function handleRecordPhotosSent(orderId: string) {
    const currentItem = items.find((item) => item.id === orderId);
    const alreadySent = Boolean(currentItem?.photosSentAtLabel);

    if (
      alreadySent &&
      !window.confirm(
        `Photos were already recorded sent at ${currentItem?.photosSentAtLabel}. Re-recording will move the customer's visible "approve by" deadline shown on their account page. Continue?`,
      )
    ) {
      return;
    }

    await handlePhotosSent(orderId, alreadySent);
  }

  // Shared save logic behind both the standalone "Save tracking" action and
  // the combined "Save tracking & mark shipped" action. Returns whether the
  // save succeeded so a caller can decide whether it's safe to chain a
  // status update on top of it.
  async function saveTracking(orderId: string): Promise<boolean> {
    const draft = trackingDrafts[orderId];
    const trackingNumber = draft?.trackingNumber.trim() ?? "";
    const carrier = draft?.carrier.trim() ?? "";

    if (!trackingNumber || !carrier) {
      setTrackingUpdateStates((current) => ({
        ...current,
        [orderId]: {
          status: "failure",
          message: "Enter both a tracking number and a carrier.",
        },
      }));
      return false;
    }

    setTrackingUpdateStates((current) => ({
      ...current,
      [orderId]: { status: "submitting", message: null },
    }));

    try {
      const response = await fetch("/api/admin/orders/tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, trackingNumber, carrier }),
      });
      const result = (await response.json()) as AdminOrderTrackingUpdateResult;

      setTrackingUpdateStates((current) => ({
        ...current,
        [orderId]: {
          status: result.status === "updated" ? "success" : "failure",
          message: result.message,
        },
      }));

      if (result.order) {
        const order = result.order;

        setItems((current) =>
          current.map((item) =>
            item.id === orderId
              ? {
                  ...item,
                  trackingNumber: order.trackingNumber ?? null,
                  carrier: order.carrier ?? null,
                  shippedAtLabel: order.shippedAt ? formatTimestamp(order.shippedAt) : null,
                }
              : item,
          ),
        );
        setTrackingDrafts((current) => ({
          ...current,
          [orderId]: {
            trackingNumber: order.trackingNumber ?? "",
            carrier: order.carrier ?? "",
          },
        }));
      }

      return result.status === "updated";
    } catch {
      setTrackingUpdateStates((current) => ({
        ...current,
        [orderId]: { status: "failure", message: "Update failed — try again." },
      }));
      return false;
    }
  }

  async function handleTrackingSave(orderId: string) {
    await saveTracking(orderId);
  }

  async function handleCostsSave(orderId: string) {
    const draft = costDrafts[orderId];

    if (!draft) {
      return;
    }

    const payload: Record<string, string | number> = { orderId };
    let hasInvalidValue = false;
    let hasAnyValue = false;

    for (const key of costDraftFieldKeys) {
      const rawValue = draft[key].trim();

      if (!rawValue) {
        continue;
      }

      hasAnyValue = true;
      const parsedValue = Number(rawValue);

      if (!Number.isFinite(parsedValue) || parsedValue < 0) {
        hasInvalidValue = true;
        break;
      }

      payload[key] = parsedValue;
    }

    if (hasInvalidValue) {
      setCostsUpdateStates((current) => ({
        ...current,
        [orderId]: { status: "failure", message: "Cost values must be valid non-negative numbers." },
      }));
      return;
    }

    if (!hasAnyValue) {
      setCostsUpdateStates((current) => ({
        ...current,
        [orderId]: { status: "failure", message: "Enter at least one cost value to save." },
      }));
      return;
    }

    setCostsUpdateStates((current) => ({
      ...current,
      [orderId]: { status: "submitting", message: null },
    }));

    try {
      const response = await fetch("/api/admin/orders/costs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as AdminOrderCostsUpdateResult;

      setCostsUpdateStates((current) => ({
        ...current,
        [orderId]: {
          status: result.status === "updated" ? "success" : "failure",
          message: result.message,
        },
      }));

      if (result.order) {
        const order = result.order;

        const nextItems = items.map((item) => {
          if (item.id !== orderId) {
            return item;
          }

          const updatedItem: AdminOrderManagementItem = {
            ...item,
            productCostUsd: order.productCostUsd ?? null,
            shippingCostUsd: order.shippingCostUsd ?? null,
            packagingCostUsd: order.packagingCostUsd ?? null,
            paymentFeeUsd: order.paymentFeeUsd ?? null,
            otherCostUsd: order.otherCostUsd ?? null,
            costsUpdatedAtLabel: order.costsUpdatedAt ? formatTimestamp(order.costsUpdatedAt) : null,
          };

          return { ...updatedItem, ...deriveCostLabels(updatedItem) };
        });

        setItems(nextItems);
        setSummaryMetrics((currentMetrics) =>
          currentMetrics.map((metric) =>
            metric.label === "Estimated profit"
              ? { ...metric, ...computeEstimatedProfitMetric(nextItems) }
              : metric,
          ),
        );
        setCostDrafts((current) => ({
          ...current,
          [orderId]: createCostDraftFromOrderFields(order),
        }));
      }
    } catch {
      setCostsUpdateStates((current) => ({
        ...current,
        [orderId]: { status: "failure", message: "Update failed — try again." },
      }));
    }
  }

  // Shared submit logic behind both the standalone "Save" status action and
  // the combined "Save tracking & mark shipped" action. Returns whether the
  // update succeeded (or was a no-op because the order already had that
  // status).
  async function submitStatusUpdate(
    orderId: string,
    nextStatus: AdminOrderStatusOption,
  ): Promise<boolean> {
    setUpdateStates((current) => ({
      ...current,
      [orderId]: {
        status: "submitting",
        message: null,
      },
    }));

    try {
      const response = await fetch("/api/admin/orders/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          status: nextStatus,
        }),
      });
      const result = (await response.json()) as AdminOrderStatusUpdateResult;

      setUpdateStates((current) => ({
        ...current,
        [orderId]: {
          status: result.status === "updated" || result.status === "ignored" ? "success" : "failure",
          message: result.message,
        },
      }));

      if (result.order) {
        const nextPersistedStatus = result.order.status;

        setItems((current) =>
          current.map((item) =>
            item.id === orderId
              ? {
                  ...item,
                  status: nextPersistedStatus,
                  statusLabel: formatLabel(nextPersistedStatus),
                }
              : item,
          ),
        );
        setSelectedStatuses((current) => ({
          ...current,
          [orderId]: nextPersistedStatus,
        }));
      }

      return result.status === "updated" || result.status === "ignored";
    } catch {
      setUpdateStates((current) => ({
        ...current,
        [orderId]: {
          status: "failure",
          message: "Update failed — try again.",
        },
      }));
      return false;
    }
  }

  // Shared confirmation gate behind both the standalone status dropdown and
  // the combined "Save tracking & mark shipped" action, so a transition that
  // needs a confirmation (e.g. reopening a cancelled/refunded/delivered
  // order into "shipped") can't bypass it just by going through the tracking
  // panel instead of the dropdown. Returns true when it's safe to proceed.
  function confirmStatusTransition(
    currentItem: AdminOrderManagementItem,
    nextStatus: AdminOrderStatusOption,
  ): boolean {
    if (
      orderStatusTransitionNeedsConfirmation(currentItem.status, nextStatus) &&
      !window.confirm(buildStatusConfirmationCopy(currentItem, nextStatus))
    ) {
      return false;
    }

    if (
      nextStatus === "paid" &&
      currentItem.paymentStatus === "failed" &&
      !window.confirm("This order's last payment attempt failed. Really mark it Paid?")
    ) {
      return false;
    }

    return true;
  }

  async function handleStatusUpdate(orderId: string) {
    const nextStatus = selectedStatuses[orderId];
    const currentItem = items.find((item) => item.id === orderId);

    if (!nextStatus || !currentItem) {
      return;
    }

    if (nextStatus === "shipped" && !currentItem.trackingNumber) {
      setUpdateStates((current) => ({
        ...current,
        [orderId]: {
          status: "failure",
          message:
            'Add a tracking number before marking this order Shipped — the tracking panel is now open below, or use "Save tracking & mark shipped" there.',
        },
      }));
      expandTrackingPanel(orderId);
      return;
    }

    if (!confirmStatusTransition(currentItem, nextStatus)) {
      return;
    }

    await submitStatusUpdate(orderId, nextStatus);
  }

  // Combined action for the tracking panel: saves tracking first, and only
  // if that succeeds, immediately follows with the status update to
  // "shipped" — skipping handleStatusUpdate's own missing-tracking guard
  // since tracking was just saved, but still routed through the same
  // confirmation gate (e.g. this can still be "reopening a terminal order"
  // if the order was cancelled/refunded/delivered before tracking was
  // fixed up). Reuses the same shared helpers as the standalone actions
  // rather than duplicating their request/state logic.
  async function handleSaveTrackingAndShip(orderId: string) {
    const currentItem = items.find((item) => item.id === orderId);

    if (!currentItem || !confirmStatusTransition(currentItem, "shipped")) {
      return;
    }

    const trackingSaved = await saveTracking(orderId);

    if (!trackingSaved) {
      return;
    }

    setSelectedStatuses((current) => ({
      ...current,
      [orderId]: "shipped",
    }));

    await submitStatusUpdate(orderId, "shipped");
  }

  const filteredItems =
    statusFilter === "all" ? items : items.filter((item) => item.status === statusFilter);

  return (
    <section className={styles.moduleShell}>
      <header className={styles.moduleHeader}>
        <p className={styles.eyebrow}>Admin orders</p>
        <h2>Orders workspace</h2>
        <p>{props.description}</p>
      </header>

      <div className={styles.metricsGrid}>
        {summaryMetrics.map((metric) => (
          <article
            key={metric.label}
            className={styles.metricCard}
            data-tone={metric.tone ?? "default"}
          >
            <div className={styles.metricHeader}>
              <p className={styles.cardEyebrow}>{metric.label}</p>
            </div>
            <strong className={styles.metricValue}>{metric.value}</strong>
            <p className={styles.metricDetail}>{metric.detail}</p>
          </article>
        ))}
      </div>

      <section className={styles.costPanel}>
        <div className={styles.sectionHeaderCompact}>
          <div className={styles.moduleHeaderCompact}>
            <p className={styles.eyebrow}>Cost tracking</p>
            <h3>{props.costPanelTitle}</h3>
          </div>
          <p className={styles.dashboardMetaInline}>{props.tableStatusNote}</p>
        </div>
        <p className={styles.costPanelCopy}>{props.costPanelDescription}</p>

        <div className={styles.costPanelGrid}>
          <section className={styles.costPanelSection}>
            <p className={styles.cardEyebrow}>Shown on the main table</p>
            <div className={styles.costFieldList}>
              {props.mainTableFields.map((field) => (
                <div key={field} className={styles.costFieldRow}>
                  <strong>{field}</strong>
                  <span>Summary column</span>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.costPanelSection}>
            <p className={styles.cardEyebrow}>Needed for cost capture</p>
            <div className={styles.costFieldList}>
              {props.costCaptureFields.map((field) => (
                <div key={field.key} className={styles.costFieldRow}>
                  <div className={styles.costFieldCopy}>
                    <strong>{field.label}</strong>
                    <span>{field.note}</span>
                  </div>
                  <span className={styles.costFieldStatus}>{field.statusLabel}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className={styles.costEntryNote}>
          <strong>Cost entry path</strong>
          <p>{props.costCapturePathNote}</p>
        </div>
      </section>

      <section className={styles.tableCard}>
        <div className={styles.sectionHeaderCompact}>
          <div className={styles.moduleHeaderCompact}>
            <p className={styles.eyebrow}>Orders table</p>
            <h3>Order list</h3>
          </div>
          <p className={styles.dashboardMetaInline}>
            {items.length > 0 ? `${formatCount(items.length)} rows ready` : "Waiting for the first row"}
          </p>
        </div>

        {items.length === 0 ? (
          <div className={styles.tableScaffoldNote}>
            <strong>Live table layout</strong>
            <p>Rows will load here when orders are persisted. The main list stays summary-focused.</p>
          </div>
        ) : (
          <div className={`${styles.actionRow} ${styles.statusFilterBar}`} role="tablist" aria-label="Filter orders by status">
            {statusFilterOptions.map((option) => {
              const count =
                option === "all"
                  ? items.length
                  : items.filter((item) => item.status === option).length;

              return (
                <button
                  key={option}
                  type="button"
                  role="tab"
                  aria-selected={statusFilter === option}
                  className={`${styles.navLink} ${statusFilter === option ? styles.navLinkActive : ""}`}
                  onClick={() => setStatusFilter(option)}
                >
                  {option === "all" ? "All" : formatLabel(option)} ({formatCount(count)})
                </button>
              );
            })}
          </div>
        )}

        <div className={styles.tableScroller}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Order #</th>
                <th scope="col">Customer</th>
                <th scope="col">Status</th>
                <th scope="col">Payment</th>
                <th scope="col">Total paid</th>
                <th scope="col">Estimated cost</th>
                <th scope="col">Estimated margin</th>
                <th scope="col">Date</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className={styles.emptyTableCell}>
                    <div className={styles.emptyState}>
                      <p className={styles.cardEyebrow}>
                        {items.length === 0 ? "No persisted orders yet" : "No orders match this filter"}
                      </p>
                      <h3>
                        {items.length === 0
                          ? "First orders will land in this table"
                          : "Try a different status filter"}
                      </h3>
                      <p>
                        {items.length === 0
                          ? "Once checkout orders are persisted, this table will show order status, payment state, total paid, estimated cost, estimated margin, and row actions."
                          : "No orders currently have this status."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const updateState = updateStates[item.id] ?? EMPTY_UPDATE_STATE;
                  const photosSentState = photosSentStates[item.id] ?? EMPTY_UPDATE_STATE;
                  const trackingUpdateState = trackingUpdateStates[item.id] ?? EMPTY_UPDATE_STATE;
                  const costsUpdateState = costsUpdateStates[item.id] ?? EMPTY_UPDATE_STATE;
                  const trackingDraft = trackingDrafts[item.id] ?? { trackingNumber: "", carrier: "" };
                  const costDraft = costDrafts[item.id] ?? createCostDraftFromItem(item);
                  const isHistoryExpanded = expandedHistoryOrderIds.has(item.id);
                  const isTrackingExpanded = expandedTrackingOrderIds.has(item.id);
                  const isCostsExpanded = expandedCostsOrderIds.has(item.id);

                  return (
                    <Fragment key={item.id}>
                    <tr className={styles.tableRow} data-status={item.status}>
                      <td>
                        <div className={styles.orderCell}>
                          <strong>{item.orderNumber}</strong>
                          <span>{item.itemCountLabel}</span>
                          <ul className={styles.orderItemsList}>
                            {item.items.map((lineItem) => (
                              <li key={lineItem.id}>
                                {lineItem.name}
                                {lineItem.variantLabel ? ` (${lineItem.variantLabel})` : ""} —{" "}
                                {lineItem.quantityLabel} · {lineItem.unitPriceLabel}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </td>
                      <td>
                        <div className={styles.customerCell}>
                          <strong>{item.customerName}</strong>
                          <span>{item.customerEmail}</span>
                          <address className={styles.shippingAddressBlock}>
                            {item.shippingAddress.addressLines.map((line, lineIndex) => (
                              <span key={lineIndex}>{line}</span>
                            ))}
                            {item.shippingAddress.phone ? (
                              <span>Phone: {item.shippingAddress.phone}</span>
                            ) : null}
                          </address>
                          {item.customerNotes ? (
                            <span className={styles.customerNotes}>
                              Photo/video request: {item.customerNotes}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td>
                        <div className={styles.statusCellStack}>
                          <span className={`${styles.statusBadge} ${resolveStatusClassName(item.status)}`}>
                            {item.statusLabel}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.paymentCell}>
                          <strong>{item.paymentLabel}</strong>
                          <span>{item.totalPaidLabel} order total</span>
                          {item.paymentIntentId ? (
                            <a
                              className={styles.stripeLink}
                              href={`https://dashboard.stripe.com/payments/${item.paymentIntentId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View in Stripe →
                            </a>
                          ) : null}
                        </div>
                      </td>
                      <td className={styles.priceCell}>{item.totalPaidLabel}</td>
                      <td>
                        <div className={styles.financialCell}>
                          <strong>{item.estimatedCostLabel}</strong>
                          <span>{item.costEntryNote}</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.financialCell}>
                          <strong>{item.estimatedMarginLabel}</strong>
                          <span>{item.estimatedProfitLabel} net profit</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.dateCell}>
                          <strong>{item.placedAtLabel}</strong>
                        </div>
                      </td>
                      <td>
                        <div className={styles.orderActionCell}>
                          <label className={styles.fieldStack}>
                            <span>Order status</span>
                            <select
                              value={selectedStatuses[item.id] ?? item.status}
                              onChange={(event) =>
                                setSelectedStatuses((current) => ({
                                  ...current,
                                  [item.id]: event.target.value as AdminOrderStatusOption,
                                }))
                              }
                            >
                              {item.allowedStatuses.map((statusOption) => (
                                <option key={statusOption} value={statusOption}>
                                  {formatLabel(statusOption)}
                                </option>
                              ))}
                            </select>
                          </label>
                          <button
                            className={styles.navLink}
                            type="button"
                            onClick={() => void handleStatusUpdate(item.id)}
                            disabled={updateState.status === "submitting"}
                          >
                            {updateState.status === "submitting" ? "Updating..." : "Save"}
                          </button>
                          <p className={styles.actionMessage} data-state={updateState.status}>
                            {updateState.message ?? "Choose a status and save to update this order."}
                          </p>
                          <button
                            className={styles.navLink}
                            type="button"
                            onClick={() => toggleHistory(item.id)}
                          >
                            {isHistoryExpanded ? "Hide history" : `History (${item.history.length})`}
                          </button>
                          {item.photosSentAtLabel ? (
                            <>
                              <p className={styles.actionMessage}>Photos sent {item.photosSentAtLabel}</p>
                              <button
                                className={styles.secondaryInlineAction}
                                type="button"
                                onClick={() => void handleRecordPhotosSent(item.id)}
                                disabled={photosSentState.status === "submitting"}
                              >
                                {photosSentState.status === "submitting" ? "Updating..." : "Re-record time"}
                              </button>
                            </>
                          ) : (
                            <button
                              className={styles.navLink}
                              type="button"
                              onClick={() => void handleRecordPhotosSent(item.id)}
                              disabled={photosSentState.status === "submitting"}
                            >
                              {photosSentState.status === "submitting"
                                ? "Recording..."
                                : "Record photos sent"}
                            </button>
                          )}
                          {photosSentState.message ? (
                            <p className={styles.actionMessage} data-state={photosSentState.status}>
                              {photosSentState.message}
                            </p>
                          ) : null}
                          <button
                            className={styles.navLink}
                            type="button"
                            onClick={() => toggleTracking(item.id)}
                          >
                            {isTrackingExpanded
                              ? "Hide tracking"
                              : item.trackingNumber
                                ? "Tracking ✓ — edit"
                                : "Add tracking"}
                          </button>
                          <button
                            className={styles.navLink}
                            type="button"
                            onClick={() => toggleCosts(item.id)}
                          >
                            {isCostsExpanded ? "Hide costs" : "Costs"}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isTrackingExpanded ? (
                      <tr className={styles.historyRow}>
                        <td colSpan={9}>
                          <div className={styles.historyPanel}>
                            <strong>Shipment tracking</strong>
                            {item.trackingNumber ? (
                              <p>
                                Currently on file: <strong>{item.trackingNumber}</strong> via{" "}
                                {item.carrier}
                                {item.shippedAtLabel ? ` — shipped ${item.shippedAtLabel}` : ""}
                              </p>
                            ) : (
                              <p>No tracking info saved yet for this order.</p>
                            )}
                            <div className={styles.inlineGroup}>
                              <label className={styles.formField}>
                                <span>Tracking number</span>
                                <input
                                  type="text"
                                  value={trackingDraft.trackingNumber}
                                  onChange={(event) =>
                                    setTrackingDrafts((current) => ({
                                      ...current,
                                      [item.id]: {
                                        ...(current[item.id] ?? { trackingNumber: "", carrier: "" }),
                                        trackingNumber: event.target.value,
                                      },
                                    }))
                                  }
                                />
                              </label>
                              <label className={styles.formField}>
                                <span>Carrier</span>
                                <input
                                  type="text"
                                  value={trackingDraft.carrier}
                                  onChange={(event) =>
                                    setTrackingDrafts((current) => ({
                                      ...current,
                                      [item.id]: {
                                        ...(current[item.id] ?? { trackingNumber: "", carrier: "" }),
                                        carrier: event.target.value,
                                      },
                                    }))
                                  }
                                />
                              </label>
                            </div>
                            <div className={styles.actionRow}>
                              <button
                                className={styles.navLink}
                                type="button"
                                onClick={() => void handleTrackingSave(item.id)}
                                disabled={
                                  trackingUpdateState.status === "submitting" ||
                                  updateState.status === "submitting"
                                }
                              >
                                {trackingUpdateState.status === "submitting" ? "Saving..." : "Save tracking"}
                              </button>
                              <button
                                className={styles.navLink}
                                type="button"
                                onClick={() => void handleSaveTrackingAndShip(item.id)}
                                disabled={
                                  trackingUpdateState.status === "submitting" ||
                                  updateState.status === "submitting"
                                }
                              >
                                {trackingUpdateState.status === "submitting" ||
                                updateState.status === "submitting"
                                  ? "Saving..."
                                  : "Save tracking & mark shipped"}
                              </button>
                            </div>
                            <p className={styles.actionMessage} data-state={trackingUpdateState.status}>
                              {trackingUpdateState.message ??
                                "The ship date is set the first time you save tracking, and preserved after that. The customer only sees tracking once this order's status is set to Shipped."}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                    {isCostsExpanded ? (
                      <tr className={styles.historyRow}>
                        <td colSpan={9}>
                          <div className={styles.historyPanel}>
                            <strong>Order costs</strong>
                            <p>
                              {item.costsUpdatedAtLabel
                                ? `Costs last updated ${item.costsUpdatedAtLabel}. Only fields with a value are saved.`
                                : "No costs entered yet. Only fields with a value are saved."}
                            </p>
                            <div className={styles.formGrid}>
                              {costDraftFieldConfig.map((field) => (
                                <label key={field.key} className={styles.formField}>
                                  <span>{field.label}</span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    inputMode="decimal"
                                    value={costDraft[field.key]}
                                    onChange={(event) =>
                                      setCostDrafts((current) => ({
                                        ...current,
                                        [item.id]: {
                                          ...(current[item.id] ?? createCostDraftFromItem(item)),
                                          [field.key]: event.target.value,
                                        },
                                      }))
                                    }
                                  />
                                </label>
                              ))}
                            </div>
                            <div className={styles.actionRow}>
                              <button
                                className={styles.navLink}
                                type="button"
                                onClick={() => void handleCostsSave(item.id)}
                                disabled={costsUpdateState.status === "submitting"}
                              >
                                {costsUpdateState.status === "submitting" ? "Saving..." : "Save costs"}
                              </button>
                            </div>
                            <p className={styles.actionMessage} data-state={costsUpdateState.status}>
                              {costsUpdateState.message ?? "Leave a field blank to leave it unchanged."}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                    {isHistoryExpanded ? (
                      <tr className={styles.historyRow}>
                        <td colSpan={9}>
                          <div className={styles.historyPanel}>
                            <strong>Fulfillment history</strong>
                            {item.history.length === 0 ? (
                              <p>No fulfillment history recorded yet for this order.</p>
                            ) : (
                              <ul className={styles.historyList}>
                                {item.history.map((entry) => (
                                  <li key={entry.id} className={styles.historyItem}>
                                    <span className={styles.historyTimestamp}>{entry.createdAtLabel}</span>
                                    <span>
                                      <strong>{entry.orderStatusLabel}</strong> — {entry.actionLabel} (
                                      {entry.resultLabel}, via {entry.triggerLabel})
                                    </span>
                                    <span className={styles.historyNote}>{entry.notes}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : null}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

function formatCount(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

// Status-specific confirm copy for the transitions that carry real
// financial weight. "Paid" and "Refunded" get explicit wording because
// neither one ever calls Stripe — this codebase has no
// paymentIntents.capture/cancel or refunds.create call anywhere — so the
// confirm dialog needs to say plainly that this only updates the website.
function buildStatusConfirmationCopy(
  item: AdminOrderManagementItem,
  nextStatus: AdminOrderStatusOption,
): string {
  if (nextStatus === "paid") {
    return `Change order ${item.orderNumber} from "${formatLabel(item.status)}" to "Paid"?\n\nMarking Paid only updates this website — it does NOT capture the payment in Stripe. Confirm you have already captured this payment in Stripe before continuing.`;
  }

  if (nextStatus === "refunded") {
    return `Change order ${item.orderNumber} from "${formatLabel(item.status)}" to "Refunded"?\n\nMarking Refunded does NOT send money back to the customer. Confirm the refund has already been issued in Stripe before continuing.`;
  }

  return `Change order ${item.orderNumber} from "${formatLabel(item.status)}" to "${formatLabel(nextStatus)}"?\n\nThis has real customer/financial implications and can't be easily undone. Only continue if you're correcting a mistake or intentionally cancelling/refunding this order.`;
}

function resolveStatusClassName(status: AdminOrderManagementItem["status"]) {
  if (status === "cancelled" || status === "refunded") {
    return styles.statusBadgeArchived;
  }

  return styles.statusBadgeActive;
}

const costDraftFieldConfig: Array<{ key: keyof CostDraft; label: string }> = [
  { key: "productCostUsd", label: "Product cost" },
  { key: "shippingCostUsd", label: "Shipping cost" },
  { key: "packagingCostUsd", label: "Packaging / handling" },
  { key: "paymentFeeUsd", label: "Payment fee" },
  { key: "otherCostUsd", label: "Other manual cost" },
];

function createCostDraftFromItem(item: AdminOrderManagementItem): CostDraft {
  return {
    productCostUsd: item.productCostUsd?.toString() ?? "",
    shippingCostUsd: item.shippingCostUsd?.toString() ?? "",
    packagingCostUsd: item.packagingCostUsd?.toString() ?? "",
    paymentFeeUsd: item.paymentFeeUsd?.toString() ?? "",
    otherCostUsd: item.otherCostUsd?.toString() ?? "",
  };
}

function createCostDraftFromOrderFields(order: {
  productCostUsd?: number;
  shippingCostUsd?: number;
  packagingCostUsd?: number;
  paymentFeeUsd?: number;
  otherCostUsd?: number;
}): CostDraft {
  return {
    productCostUsd: order.productCostUsd?.toString() ?? "",
    shippingCostUsd: order.shippingCostUsd?.toString() ?? "",
    packagingCostUsd: order.packagingCostUsd?.toString() ?? "",
    paymentFeeUsd: order.paymentFeeUsd?.toString() ?? "",
    otherCostUsd: order.otherCostUsd?.toString() ?? "",
  };
}

// Mirrors the cost/margin derivation in lib/admin/orders.ts so the table can
// update its own row optimistically right after a save, without waiting on
// a full page reload. Margin/profit are measured against `totalUsd` for the
// same reason documented there: it's the figure this module already treats
// as "revenue" elsewhere (Revenue and Average order value metrics).
function deriveCostLabels(item: AdminOrderManagementItem): Pick<
  AdminOrderManagementItem,
  "estimatedCostLabel" | "estimatedProfitLabel" | "estimatedMarginLabel" | "costEntryNote"
> {
  const values = [
    item.productCostUsd,
    item.shippingCostUsd,
    item.packagingCostUsd,
    item.paymentFeeUsd,
    item.otherCostUsd,
  ];
  const hasCostData = values.some((value) => value !== null);
  const totalCost = values.reduce((sum: number, value) => sum + (value ?? 0), 0);
  const profit = item.totalUsd - totalCost;
  const marginPct = item.totalUsd > 0 ? (profit / item.totalUsd) * 100 : 0;

  return {
    estimatedCostLabel: hasCostData ? formatUsd(totalCost) : "No costs entered yet",
    estimatedProfitLabel: hasCostData ? formatUsd(profit) : "Pending",
    estimatedMarginLabel: hasCostData ? formatPercent(marginPct) : "Pending",
    costEntryNote: hasCostData
      ? item.costsUpdatedAtLabel
        ? `Costs updated ${item.costsUpdatedAtLabel}`
        : "Costs entered"
      : "No costs entered yet.",
  };
}

function computeEstimatedProfitMetric(items: AdminOrderManagementItem[]): {
  value: string;
  detail: string;
  tone: "default" | "pending";
} {
  const costedItems = items.filter((item) =>
    [
      item.productCostUsd,
      item.shippingCostUsd,
      item.packagingCostUsd,
      item.paymentFeeUsd,
      item.otherCostUsd,
    ].some((value) => value !== null),
  );
  const totalProfit = costedItems.reduce((sum, item) => {
    const totalCost =
      (item.productCostUsd ?? 0) +
      (item.shippingCostUsd ?? 0) +
      (item.packagingCostUsd ?? 0) +
      (item.paymentFeeUsd ?? 0) +
      (item.otherCostUsd ?? 0);

    return sum + (item.totalUsd - totalCost);
  }, 0);

  return {
    value: formatUsd(totalProfit),
    detail:
      items.length > 0
        ? `${formatCount(costedItems.length)} of ${formatCount(items.length)} orders costed`
        : "No orders yet",
    tone: costedItems.length > 0 ? "default" : "pending",
  };
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatUsd(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatPercent(value: number) {
  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(value)}%`;
}