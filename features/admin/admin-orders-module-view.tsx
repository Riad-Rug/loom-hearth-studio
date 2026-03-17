"use client";

import { useState } from "react";

import type {
  AdminOrderManagementItem,
  AdminOrderStatusOption,
  AdminOrderStatusUpdateResult,
  AdminOrdersModuleData,
} from "@/lib/admin/orders";

import styles from "./admin.module.css";

type AdminOrdersModuleViewProps = {
  description: string;
  cards: AdminOrdersModuleData["cards"];
  items: AdminOrderManagementItem[];
};

type UpdateState = {
  status: "idle" | "submitting" | "success" | "failure";
  message: string | null;
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
                  statusLabel: formatOrderStatus(nextPersistedStatus),
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
        <h2>Orders module shell</h2>
        <p>{props.description}</p>
      </header>

      <div className={styles.cardGrid}>
        {props.cards.map((card, index) => (
          <article key={`orders-card-${index + 1}`} className={styles.card}>
            <p className={styles.cardEyebrow}>Orders card {index + 1}</p>
            <h3>{card.title}</h3>
            <p>{card.body}</p>
            {card.lines?.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </article>
        ))}
      </div>

      <div className={styles.cardGrid}>
        {items.map((item) => {
          const updateState = updateStates[item.id] ?? { status: "idle", message: null };

          return (
            <article key={item.id} className={styles.card}>
              <p className={styles.cardEyebrow}>Persisted order</p>
              <h3>{item.orderNumber}</h3>
              <p>{item.customerEmail}</p>
              <p>{item.statusLabel}</p>
              <p>{item.totalLabel}</p>
              <p>{item.placedAtLabel}</p>
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
                      {formatOrderStatus(statusOption)}
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
                {updateState.status === "submitting"
                  ? "Updating status..."
                  : "Save persisted status"}
              </button>
              <p>{`Update state: ${updateState.status}`}</p>
              {updateState.message ? <p>{updateState.message}</p> : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function formatOrderStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}
