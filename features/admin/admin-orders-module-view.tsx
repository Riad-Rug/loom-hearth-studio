"use client";

import { useState } from "react";

import type {
  AdminOrderManagementItem,
  AdminOrderStatusOption,
  AdminOrderStatusUpdateResult,
  AdminOrdersModuleData,
} from "@/lib/admin/orders";

import styles from "./admin.module.css";

type AdminOrdersModuleViewProps = AdminOrdersModuleData;

type UpdateState = {
  status: "idle" | "submitting" | "success" | "failure";
  message: string | null;
};

const EMPTY_UPDATE_STATE: UpdateState = {
  status: "idle",
  message: null,
};

export function AdminOrdersModuleView(props: AdminOrdersModuleViewProps) {
  const [items, setItems] = useState(props.items);
  const [selectedStatuses, setSelectedStatuses] = useState<Record<string, AdminOrderStatusOption>>(
    () =>
      Object.fromEntries(props.items.map((item) => [item.id, item.status])) as Record<
        string,
        AdminOrderStatusOption
      >,
  );
  const [updateStates, setUpdateStates] = useState<Record<string, UpdateState>>(
    () =>
      Object.fromEntries(
        props.items.map((item) => [item.id, { status: "idle", message: null }]),
      ) as Record<string, UpdateState>,
  );

  async function handleStatusUpdate(orderId: string) {
    const nextStatus = selectedStatuses[orderId];

    if (!nextStatus) {
      return;
    }

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
        const nextPersistedStatus = result.order.status as AdminOrderStatusOption;

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
    } catch {
      setUpdateStates((current) => ({
        ...current,
        [orderId]: {
          status: "failure",
          message: "Admin order status update request failed before a response was returned.",
        },
      }));
    }
  }

  return (
    <section className={styles.moduleShell}>
      <header className={styles.moduleHeader}>
        <p className={styles.eyebrow}>Admin orders</p>
        <h2>Orders workspace</h2>
        <p>{props.description}</p>
      </header>

      <div className={styles.metricsGrid}>
        {props.summaryMetrics.map((metric) => (
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

        <div className={styles.tableScaffoldNote}>
          <strong>Live table layout</strong>
          <p>Rows will load here when orders are persisted. The main list stays summary-focused.</p>
        </div>

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
              {items.length === 0 ? (
                <tr>
                  <td colSpan={9} className={styles.emptyTableCell}>
                    <div className={styles.emptyState}>
                      <p className={styles.cardEyebrow}>No persisted orders yet</p>
                      <h3>First orders will land in this table</h3>
                      <p>
                        Once checkout orders are persisted, this table will show order status,
                        payment state, total paid, estimated cost, estimated margin, and row actions.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const updateState = updateStates[item.id] ?? EMPTY_UPDATE_STATE;

                  return (
                    <tr key={item.id} className={styles.tableRow} data-status={item.status}>
                      <td>
                        <div className={styles.orderCell}>
                          <strong>{item.orderNumber}</strong>
                          <span>{item.itemCountLabel}</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.customerCell}>
                          <strong>{item.customerName}</strong>
                          <span>{item.customerEmail}</span>
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
                        </div>
                      </td>
                      <td className={styles.priceCell}>{item.totalPaidLabel}</td>
                      <td>
                        <div className={styles.financialCell}>
                          <strong>{item.estimatedCostLabel}</strong>
                          <span>{item.costFields[0]?.label} through {item.costFields[4]?.label}</span>
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
                          <span>{item.financialSummary}</span>
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
                            {updateState.message ?? "Status updates remain available from this table."}
                          </p>
                        </div>
                      </td>
                    </tr>
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

function resolveStatusClassName(status: AdminOrderManagementItem["status"]) {
  if (status === "cancelled" || status === "refunded") {
    return styles.statusBadgeArchived;
  }

  return styles.statusBadgeActive;
}