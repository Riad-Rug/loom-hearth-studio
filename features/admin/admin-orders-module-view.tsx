"use client";

import { Fragment, useState } from "react";

import {
  adminOrderStatusOptions,
  capitalizeLabel,
  orderStatusTransitionNeedsConfirmation,
  type AdminOrderStatusOption,
} from "@/lib/admin/order-status";
import type {
  AdminOrderCostsUpdateRequest,
  AdminOrderCostsUpdateResult,
  AdminOrderManagementItem,
  AdminOrderPhotosSentUpdateResult,
  AdminOrderStatusUpdateResult,
  AdminOrderTrackingUpdateResult,
  AdminOrdersModuleData,
} from "@/lib/admin/orders";
import { knownCarrierNames } from "@/lib/orders/carrier-tracking";

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

// Case-insensitive match against the same carrier names the customer-facing
// tracking-link matcher (lib/orders/carrier-tracking.ts) accepts, so the
// carrier select can pre-select the right known option regardless of the
// exact casing an existing order's `carrier` value happens to have on file.
function resolveKnownCarrierMatch(carrier: string): (typeof knownCarrierNames)[number] | null {
  const trimmed = carrier.trim();

  return knownCarrierNames.find((name) => name.toLowerCase() === trimmed.toLowerCase()) ?? null;
}

// An order's carrier value is in "Other" mode when it's a non-empty string
// that doesn't match one of the known carriers — i.e. an unrecognized value
// that must be shown back in the free-text field rather than silently
// dropped or forced to fall back to a known option.
function resolveIsCarrierOtherMode(carrier: string | null | undefined): boolean {
  const trimmed = carrier?.trim() ?? "";

  return trimmed.length > 0 && resolveKnownCarrierMatch(trimmed) === null;
}

// Pure Set helpers shared by the row-expansion state below (History,
// Tracking, Costs, and the outer Details toggle that groups them together)
// — used inside each set's functional setState updater.
function addOrderIdToSet(current: Set<string>, orderId: string): Set<string> {
  if (current.has(orderId)) {
    return current;
  }

  const next = new Set(current);
  next.add(orderId);
  return next;
}

function removeOrderIdFromSet(current: Set<string>, orderId: string): Set<string> {
  if (!current.has(orderId)) {
    return current;
  }

  const next = new Set(current);
  next.delete(orderId);
  return next;
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
  // Tracks, per order, whether the carrier field is in "Other" (free-text)
  // mode — separate from `TrackingDraft.carrier` itself because that field
  // has to stay a plain string (including the empty string while an admin is
  // mid-typing a custom carrier name), so the string alone can't distinguish
  // "nothing chosen yet" from "explicitly chose Other, haven't typed a name
  // yet". Initialized from each order's persisted carrier so an unrecognized
  // existing value opens straight into Other mode instead of being dropped.
  const [carrierOtherModeByOrderId, setCarrierOtherModeByOrderId] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(
        props.items.map((item): [string, boolean] => [item.id, resolveIsCarrierOtherMode(item.carrier)]),
      ),
  );
  const [costDrafts, setCostDrafts] = useState<Record<string, CostDraft>>(() =>
    Object.fromEntries(
      props.items.map((item): [string, CostDraft] => [item.id, createCostDraftFromItem(item)]),
    ),
  );
  const [statusFilter, setStatusFilter] = useState<StatusFilterOption>("all");
  const [needsAttentionOnly, setNeedsAttentionOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedHistoryOrderIds, setExpandedHistoryOrderIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [expandedTrackingOrderIds, setExpandedTrackingOrderIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [expandedCostsOrderIds, setExpandedCostsOrderIds] = useState<Set<string>>(() => new Set());
  // Single outer toggle that groups History, Tracking, and Costs into one
  // "Details" disclosure per row (Finding 10) — the three inner flags above
  // are kept exactly as they were (other code, notably expandTrackingPanel
  // below, still keys off expandedTrackingOrderIds specifically) and are
  // simply all switched on together whenever Details is opened.
  const [expandedDetailsOrderIds, setExpandedDetailsOrderIds] = useState<Set<string>>(
    () => new Set(),
  );

  // Wave 1 behavior: auto-opens the tracking panel when an admin tries to
  // ship without a tracking number on file. Also opens the outer Details
  // section now that Tracking lives inside it, so the panel is actually
  // visible instead of just being flagged open underneath a collapsed
  // Details toggle.
  function expandTrackingPanel(orderId: string) {
    setExpandedTrackingOrderIds((current) => addOrderIdToSet(current, orderId));
    setExpandedDetailsOrderIds((current) => addOrderIdToSet(current, orderId));
  }

  function toggleDetails(orderId: string) {
    const isExpanded = expandedDetailsOrderIds.has(orderId);

    if (isExpanded) {
      setExpandedDetailsOrderIds((current) => removeOrderIdFromSet(current, orderId));
      return;
    }

    // Opening Details reveals History, Tracking, and Costs together, so the
    // admin doesn't have to expand each one separately.
    setExpandedDetailsOrderIds((current) => addOrderIdToSet(current, orderId));
    setExpandedHistoryOrderIds((current) => addOrderIdToSet(current, orderId));
    setExpandedTrackingOrderIds((current) => addOrderIdToSet(current, orderId));
    setExpandedCostsOrderIds((current) => addOrderIdToSet(current, orderId));
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
        setCarrierOtherModeByOrderId((current) => ({
          ...current,
          [orderId]: resolveIsCarrierOtherMode(order.carrier),
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
    const currentItem = items.find((item) => item.id === orderId);

    if (!draft || !currentItem) {
      return;
    }

    const payload: Partial<AdminOrderCostsUpdateRequest> = { orderId };
    let hasInvalidValue = false;
    let hasAnyChange = false;

    for (const key of costDraftFieldKeys) {
      const rawValue = draft[key].trim();

      if (!rawValue) {
        // Blank field: if it previously had a value, send an explicit `null`
        // to clear it — distinct from omitting the key entirely, which means
        // "untouched, leave whatever is already saved alone". A field that
        // was already blank and is still blank stays omitted (true no-op).
        // Sending `0` here would be wrong: 0 means "known to cost nothing",
        // not "unknown/not entered", and would skew the profit-margin math.
        if (currentItem[key] !== null) {
          payload[key] = null;
          hasAnyChange = true;
        }
        continue;
      }

      const parsedValue = Number(rawValue);

      if (!Number.isFinite(parsedValue) || parsedValue < 0) {
        hasInvalidValue = true;
        break;
      }

      payload[key] = parsedValue;
      hasAnyChange = true;
    }

    if (hasInvalidValue) {
      setCostsUpdateStates((current) => ({
        ...current,
        [orderId]: { status: "failure", message: "Cost values must be valid non-negative numbers." },
      }));
      return;
    }

    if (!hasAnyChange) {
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

        // Derive from `current` (the functional updater's argument), not the
        // `items` render-time closure — if a status/tracking/photos update
        // for this or another row resolves while this costs save is still in
        // flight, reading the stale `items` closure here and writing it back
        // with a non-functional `setItems(nextItems)` would silently clobber
        // that other update once this one finally lands.
        setItems((current) => {
          const nextItems = current.map((item) => {
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

          // Kept inside this updater (rather than computed from the outer
          // `nextItems`, which doesn't exist here) so the profit metric is
          // always derived from the same up-to-date items array that was
          // just committed, never from the stale closure.
          setSummaryMetrics((currentMetrics) =>
            currentMetrics.map((metric) =>
              metric.label === "Estimated profit"
                ? { ...metric, ...computeEstimatedProfitMetric(nextItems) }
                : metric,
            ),
          );

          return nextItems;
        });
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
                  statusLabel: capitalizeLabel(nextPersistedStatus),
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

  // `statusOverride` lets a primary-action button (e.g. "Mark paid", "Mark
  // delivered") drive this exact same guarded flow — missing-tracking guard,
  // confirmation copy, submit — as if the admin had picked that status in
  // the dropdown and clicked Save, without depending on `selectedStatuses`
  // state having already been updated (which would otherwise race the
  // click). When an override is given, the visible dropdown is updated to
  // match so the row reflects what's about to happen.
  async function handleStatusUpdate(orderId: string, statusOverride?: AdminOrderStatusOption) {
    const nextStatus = statusOverride ?? selectedStatuses[orderId];
    const currentItem = items.find((item) => item.id === orderId);

    if (!nextStatus || !currentItem) {
      return;
    }

    if (statusOverride) {
      setSelectedStatuses((current) => ({
        ...current,
        [orderId]: statusOverride,
      }));
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

  // Drives the single "what's next" primary action surfaced per row
  // (Finding 10). Every branch reuses the row's existing handler/guard/
  // confirmation plumbing — nothing here bypasses handleStatusUpdate's
  // confirmation gate or the shipped-without-tracking guard.
  async function handlePrimaryAction(item: AdminOrderManagementItem) {
    const primaryAction = resolveOrderPrimaryAction(item);

    if (!primaryAction) {
      return;
    }

    if (primaryAction.kind === "record-photos-sent") {
      await handleRecordPhotosSent(item.id);
      return;
    }

    if (primaryAction.kind === "mark-paid") {
      await handleStatusUpdate(item.id, "paid");
      return;
    }

    if (primaryAction.kind === "add-tracking-and-ship") {
      if (item.trackingNumber) {
        await handleSaveTrackingAndShip(item.id);
      } else {
        expandTrackingPanel(item.id);
      }
      return;
    }

    if (primaryAction.kind === "mark-delivered") {
      await handleStatusUpdate(item.id, "delivered");
    }
  }

  const statusFilteredItems =
    statusFilter === "all" ? items : items.filter((item) => item.status === statusFilter);
  const attentionFilteredItems = needsAttentionOnly
    ? statusFilteredItems.filter((item) => resolveOrderAttention(item) !== null)
    : statusFilteredItems;
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const searchFilteredItems = normalizedSearchQuery
    ? attentionFilteredItems.filter((item) => orderMatchesSearchQuery(item, normalizedSearchQuery))
    : attentionFilteredItems;
  const filteredItems = [...searchFilteredItems].sort(compareByAttention);
  const needsAttentionCount = items.filter((item) => resolveOrderAttention(item) !== null).length;

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

      <section className={styles.tableCard}>
        <div className={styles.sectionHeaderCompact}>
          <div className={styles.moduleHeaderCompact}>
            <p className={styles.eyebrow}>Orders table</p>
            <h3>Order list</h3>
          </div>
          <p className={styles.dashboardMetaInline}>
            {items.length > 0
              ? `${formatCount(items.length)} order${items.length === 1 ? "" : "s"} on file`
              : "No orders yet"}
          </p>
        </div>

        {items.length === 0 ? (
          <div className={styles.tableScaffoldNote}>
            <strong>No orders yet</strong>
            <p>Orders will appear here automatically as soon as a customer completes checkout.</p>
          </div>
        ) : (
          <>
          <label className={styles.searchField}>
            <span>Search orders</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by order #, customer name, email, or tracking number"
            />
          </label>
          <div className={`${styles.actionRow} ${styles.statusFilterBar}`} aria-label="Filter orders by status">
            {statusFilterOptions.map((option) => {
              const count =
                option === "all"
                  ? items.length
                  : items.filter((item) => item.status === option).length;

              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={statusFilter === option}
                  className={`${styles.navLink} ${statusFilter === option ? styles.navLinkActive : ""}`}
                  onClick={() => setStatusFilter(option)}
                >
                  {option === "all" ? "All" : capitalizeLabel(option)} ({formatCount(count)})
                </button>
              );
            })}
            <button
              type="button"
              aria-pressed={needsAttentionOnly}
              className={`${styles.navLink} ${needsAttentionOnly ? styles.navLinkActive : ""}`}
              onClick={() => setNeedsAttentionOnly((current) => !current)}
            >
              Needs attention ({formatCount(needsAttentionCount)})
            </button>
          </div>
          </>
        )}

        <div className={styles.tableScroller}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Order #</th>
                <th scope="col">Customer</th>
                <th scope="col">Status</th>
                <th scope="col">Payment</th>
                <th scope="col">Estimated cost</th>
                <th scope="col">Estimated margin</th>
                <th scope="col">Date</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className={styles.emptyTableCell}>
                    <div className={styles.emptyState}>
                      <p className={styles.cardEyebrow}>
                        {items.length === 0 ? "No orders yet" : "No orders match this filter"}
                      </p>
                      <h3>
                        {items.length === 0
                          ? "Orders will appear here automatically"
                          : "Try a different search or filter"}
                      </h3>
                      <p>
                        {items.length === 0
                          ? "Once a customer completes checkout, this table will show order status, payment state, total paid, estimated cost, estimated margin, and row actions."
                          : "No orders match the current search and filters."}
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
                  const isCarrierOtherMode =
                    carrierOtherModeByOrderId[item.id] ?? resolveIsCarrierOtherMode(item.carrier);
                  const costDraft = costDrafts[item.id] ?? createCostDraftFromItem(item);
                  const isHistoryExpanded = expandedHistoryOrderIds.has(item.id);
                  const isTrackingExpanded = expandedTrackingOrderIds.has(item.id);
                  const isCostsExpanded = expandedCostsOrderIds.has(item.id);
                  const isDetailsExpanded = expandedDetailsOrderIds.has(item.id);
                  const primaryAction = resolveOrderPrimaryAction(item);
                  const isPrimaryActionBusy =
                    updateState.status === "submitting" ||
                    photosSentState.status === "submitting" ||
                    trackingUpdateState.status === "submitting";

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
                          {(() => {
                            const attention = resolveOrderAttention(item);

                            return attention ? (
                              <span
                                className={`${styles.statusBadge} ${resolveAttentionClassName(attention.level)}`}
                              >
                                {attention.label}
                              </span>
                            ) : null;
                          })()}
                          <p className={styles.actionMessage}>Customer sees: {item.customerStatusLabel}</p>
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
                          <span>{formatRelativeTime(item.placedAt)}</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.orderActionCell}>
                          {primaryAction ? (
                            <button
                              className={`${styles.navLink} ${styles.actionPrimary}`}
                              type="button"
                              onClick={() => void handlePrimaryAction(item)}
                              disabled={isPrimaryActionBusy}
                            >
                              {isPrimaryActionBusy ? "Working..." : primaryAction.label}
                            </button>
                          ) : null}
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
                                  {capitalizeLabel(statusOption)}
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
                          {updateState.status !== "idle" ? (
                            <p className={styles.actionMessage} data-state={updateState.status} aria-live="polite">
                              {updateState.message ?? "Updating…"}
                            </p>
                          ) : null}
                          <button
                            className={styles.navLink}
                            type="button"
                            onClick={() => toggleDetails(item.id)}
                            aria-expanded={isDetailsExpanded}
                            aria-controls={`order-details-${item.id}`}
                          >
                            {isDetailsExpanded ? "Hide details" : "Details"}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isDetailsExpanded ? (
                      <tr className={styles.historyRow} id={`order-details-${item.id}`}>
                        <td colSpan={8}>
                          <div className={styles.detailsGrid}>
                          <div className={styles.historyPanel}>
                            <strong>Photo tracking</strong>
                            {item.photosSentAtLabel ? (
                              <>
                                <p>Photos sent {item.photosSentAtLabel}</p>
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
                              <>
                                <p>No photos recorded sent yet for this order.</p>
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
                              </>
                            )}
                            {photosSentState.message ? (
                              <p
                                className={styles.actionMessage}
                                data-state={photosSentState.status}
                                aria-live="polite"
                              >
                                {photosSentState.message}
                              </p>
                            ) : null}
                          </div>
                          {isTrackingExpanded ? (
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
                                <select
                                  value={
                                    isCarrierOtherMode
                                      ? "other"
                                      : (resolveKnownCarrierMatch(trackingDraft.carrier) ?? "")
                                  }
                                  onChange={(event) => {
                                    const value = event.target.value;
                                    const nextIsOther = value === "other";

                                    setCarrierOtherModeByOrderId((current) => ({
                                      ...current,
                                      [item.id]: nextIsOther,
                                    }));
                                    setTrackingDrafts((current) => ({
                                      ...current,
                                      [item.id]: {
                                        ...(current[item.id] ?? { trackingNumber: "", carrier: "" }),
                                        carrier: nextIsOther ? "" : value,
                                      },
                                    }));
                                  }}
                                >
                                  <option value="" disabled>
                                    Select a carrier…
                                  </option>
                                  {knownCarrierNames.map((carrierName) => (
                                    <option key={carrierName} value={carrierName}>
                                      {carrierName}
                                    </option>
                                  ))}
                                  <option value="other">Other…</option>
                                </select>
                              </label>
                            </div>
                            {isCarrierOtherMode ? (
                              <div className={styles.inlineGroup}>
                                <label className={styles.formField}>
                                  <span>Carrier name</span>
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
                                <p className={styles.actionMessage}>
                                  No tracking link will be shown to the customer for this carrier — they&rsquo;ll
                                  see the number only.
                                </p>
                              </div>
                            ) : null}
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
                            <p
                              className={styles.actionMessage}
                              data-state={trackingUpdateState.status}
                              aria-live="polite"
                            >
                              {trackingUpdateState.message ??
                                "The ship date is set the first time you save tracking, and preserved after that. The customer only sees tracking once this order's status is set to Shipped."}
                            </p>
                          </div>
                          ) : null}
                          {isCostsExpanded ? (
                          <div className={styles.historyPanel}>
                            <strong>Order costs</strong>
                            <p>
                              {item.costsUpdatedAtLabel
                                ? `Costs last updated ${item.costsUpdatedAtLabel}. A field left blank and untouched stays as-is; clearing a field that already has a value removes it.`
                                : "No costs entered yet. A field left blank and untouched stays as-is; clearing a field that already has a value removes it."}
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
                            <p
                              className={styles.actionMessage}
                              data-state={costsUpdateState.status}
                              aria-live="polite"
                            >
                              {costsUpdateState.message ??
                                "Leave a field blank to leave it unchanged — clear a field that already has a value and save to remove it."}
                            </p>
                          </div>
                          ) : null}
                          {isHistoryExpanded ? (
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
                          ) : null}
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

      <section className={styles.costPanel}>
        <details>
          <summary className={styles.sectionHeaderCompact}>
            <div className={styles.moduleHeaderCompact}>
              <p className={styles.eyebrow}>Cost tracking</p>
              <h3>{props.costPanelTitle}</h3>
            </div>
            <p className={styles.dashboardMetaInline}>{props.tableStatusNote}</p>
          </summary>
          <div className={styles.costPanelBody}>
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
          </div>
        </details>
      </section>
    </section>
  );
}

function formatCount(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
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
    return `Change order ${item.orderNumber} from "${capitalizeLabel(item.status)}" to "Paid"?\n\nMarking Paid only updates this website — it does NOT capture the payment in Stripe. Confirm you have already captured this payment in Stripe before continuing.`;
  }

  if (nextStatus === "refunded") {
    return `Change order ${item.orderNumber} from "${capitalizeLabel(item.status)}" to "Refunded"?\n\nMarking Refunded does NOT send money back to the customer. Confirm the refund has already been issued in Stripe before continuing.`;
  }

  return `Change order ${item.orderNumber} from "${capitalizeLabel(item.status)}" to "${capitalizeLabel(nextStatus)}"?\n\nThis has real customer/financial implications and can't be easily undone. Only continue if you're correcting a mistake or intentionally cancelling/refunding this order.`;
}

function resolveStatusClassName(status: AdminOrderManagementItem["status"]) {
  if (status === "pending") {
    return styles.statusBadgeWarning;
  }

  if (status === "paid" || status === "processing") {
    return styles.statusBadgeActive;
  }

  if (status === "shipped" || status === "delivered") {
    return styles.statusBadgeComplete;
  }

  if (status === "cancelled") {
    return styles.statusBadgeArchived;
  }

  if (status === "refunded") {
    return styles.statusBadgeRefunded;
  }

  return styles.statusBadgeActive;
}

type OrderPrimaryActionKind =
  | "record-photos-sent"
  | "mark-paid"
  | "add-tracking-and-ship"
  | "mark-delivered";

type OrderPrimaryAction = { kind: OrderPrimaryActionKind; label: string } | null;

// Derives the ONE primary "what's next" action for an order row (Finding
// 10), based on the same status/paymentStatus/photosSentAtLabel/
// trackingNumber signals resolveOrderAttention already reads. Mirrors the
// real fulfillment pipeline — photos sent, then paid, then tracking/ship,
// then delivered — so the row always prompts the single next correct step
// instead of the admin choosing one out of a shelf of equally-weighted
// controls. Terminal statuses (delivered/cancelled/refunded) don't need a
// next-step prompt.
function resolveOrderPrimaryAction(item: AdminOrderManagementItem): OrderPrimaryAction {
  if (item.status === "pending") {
    if (!item.photosSentAtLabel) {
      return { kind: "record-photos-sent", label: "Record photos sent" };
    }

    return { kind: "mark-paid", label: "Mark paid (after Stripe capture)" };
  }

  if (item.status === "paid" || item.status === "processing") {
    return { kind: "add-tracking-and-ship", label: "Add tracking & ship" };
  }

  if (item.status === "shipped") {
    return { kind: "mark-delivered", label: "Mark delivered" };
  }

  return null;
}

// Case-insensitive substring match against the fields an admin is most
// likely to have on hand when tracking down a specific order: order number,
// customer name/email, and tracking number. `normalizedQuery` is expected to
// already be trimmed and lowercased by the caller.
function orderMatchesSearchQuery(item: AdminOrderManagementItem, normalizedQuery: string): boolean {
  const searchableValues: Array<string | null> = [
    item.orderNumber,
    item.customerName,
    item.customerEmail,
    item.trackingNumber,
  ];

  return searchableValues.some((value) => value?.toLowerCase().includes(normalizedQuery) ?? false);
}

type OrderAttentionLevel = "urgent" | "warning";
type OrderAttention = { level: OrderAttentionLevel; label: string } | null;

// Ranks orders by how urgently they need admin action, independent of the
// active status filter. Rules are keyed off the same status/paymentStatus
// combinations the rest of this codebase already treats as meaningful (e.g.
// the "pending" + "authorized" pairing used for the reservation panel in
// lib/account/dashboard.ts) so this stays consistent with what the customer
// sees and with the authorize-then-capture 7-day window described in the
// checkout/fulfillment docs.
const authorizationWindowDays = 7;
const photosPromiseDays = 2;
const captureUrgentThresholdDays = 5;

function resolveOrderAttention(item: AdminOrderManagementItem): OrderAttention {
  const ageDays = Math.floor((Date.now() - new Date(item.placedAt).getTime()) / 86_400_000);

  if (item.status === "pending" && item.paymentStatus === "authorized") {
    if (ageDays >= captureUrgentThresholdDays) {
      return {
        level: "urgent",
        label: `Auth expires in ~${Math.max(authorizationWindowDays - ageDays, 0)}d — capture or release`,
      };
    }

    if (ageDays >= photosPromiseDays && !item.photosSentAtLabel) {
      return { level: "warning", label: "Photos overdue (24h promise)" };
    }
  }

  if (item.status === "shipped" && !item.trackingNumber) {
    return { level: "urgent", label: "Shipped with no tracking" };
  }

  if (item.status === "cancelled" && item.paymentStatus === "authorized") {
    return { level: "warning", label: "Release the Stripe hold" };
  }

  if ((item.status === "shipped" || item.status === "delivered") && item.paymentStatus !== "paid") {
    return { level: "urgent", label: "Shipped but not captured" };
  }

  return null;
}

function resolveAttentionClassName(level: OrderAttentionLevel) {
  return level === "urgent" ? styles.statusBadgeUrgent : styles.statusBadgeWarning;
}

// Stable sort: urgent first, then warning, then everything else — the
// relative order within each group (and among items with no attention) is
// left untouched, which preserves the newest-first order the list already
// comes in from getAdminOrdersModuleData.
const attentionSortWeight: Record<"urgent" | "warning" | "none", number> = {
  urgent: 0,
  warning: 1,
  none: 2,
};

function compareByAttention(a: AdminOrderManagementItem, b: AdminOrderManagementItem): number {
  const weightA = attentionSortWeight[resolveOrderAttention(a)?.level ?? "none"];
  const weightB = attentionSortWeight[resolveOrderAttention(b)?.level ?? "none"];

  return weightA - weightB;
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

// Day-granularity relative label ("Today", "Yesterday", "N days ago") shown
// under the absolute placed-at date. Deliberately simple — no library, no
// hour/minute precision — since the admin only needs a rough sense of order
// age at a glance; resolveOrderAttention already does the precise ageDays
// math for anything that actually needs to be exact.
function formatRelativeTime(placedAt: string): string {
  const placedDate = new Date(placedAt);
  const startOfPlacedDay = new Date(
    placedDate.getFullYear(),
    placedDate.getMonth(),
    placedDate.getDate(),
  );
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayDiff = Math.round(
    (startOfToday.getTime() - startOfPlacedDay.getTime()) / 86_400_000,
  );

  if (dayDiff <= 0) {
    return "Today";
  }

  if (dayDiff === 1) {
    return "Yesterday";
  }

  return `${formatCount(dayDiff)} days ago`;
}

// USD-only today — AdminOrderManagementItem doesn't carry a currency field
// through to this formatter (Order.currency is currently the literal "USD"
// in types/domain/order.ts). If the store ever supports other currencies,
// this needs to format against the order's own `currency` instead.
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