"use client";

import type { Route } from "next";
import Link from "next/link";
import { useActionState } from "react";

import {
  deleteAdminRugRegionAction,
  type AdminRugRegionActionState,
} from "@/app/(admin)/admin/products/regions/actions";
import styles from "@/features/admin/admin.module.css";
import { formatRegionLabel } from "@/lib/catalog/rug-taxonomy";
import type { RugRegionUsage } from "@/lib/db/repositories/rug-region-repository";

const initialState: AdminRugRegionActionState = { status: "idle", message: null };

export function AdminRugRegionsPageView({ regions }: { regions: RugRegionUsage[] }) {
  const [state, formAction, isPending] = useActionState(deleteAdminRugRegionAction, initialState);

  return (
    <section className={styles.moduleShell}>
      <header className={styles.moduleHeader}>
        <p className={styles.eyebrow}>Admin products</p>
        <h2>Rug regions</h2>
        <p>
          Regions are added from a rug&rsquo;s Region field (&ldquo;+ Add region&rdquo;). A region can be deleted only
          when no product, archived or draft included, and no sub-region uses it.
        </p>
      </header>

      <div className={styles.actionRow}>
        <Link className={styles.navLink} href={"/admin/products" as Route}>
          Back to products
        </Link>
      </div>

      {state.message ? (
        <div className={state.status === "success" ? styles.successPanel : styles.gatePanel} role="status">
          <strong>{state.status === "success" ? "Deleted" : "Not deleted"}</strong>
          <p>{state.message}</p>
        </div>
      ) : null}

      <section className={styles.groupPanel}>
        <div className={styles.stack}>
          {regions.map((region) => {
            const inUse = region.productCount > 0 || region.childCount > 0;

            return (
              <article key={region.id} className={styles.card}>
                <p className={styles.cardEyebrow}>/shop/rugs/{region.slug}</p>
                <h3>{formatRegionLabel(region)}</h3>
                <p>
                  {region.productCount} product{region.productCount === 1 ? "" : "s"}
                  {region.childCount
                    ? ` · ${region.childCount} sub-region${region.childCount === 1 ? "" : "s"}`
                    : ""}
                </p>
                <form
                  action={formAction}
                  onSubmit={(event) => {
                    if (!window.confirm(`Delete the region ${region.name}? This cannot be undone.`)) {
                      event.preventDefault();
                    }
                  }}
                >
                  <input type="hidden" name="regionId" value={region.id} />
                  <button
                    className={styles.inlineActionLink}
                    type="submit"
                    disabled={inUse || isPending}
                    title={inUse ? "Move its products and sub-regions to another region first." : undefined}
                  >
                    Delete region
                  </button>
                </form>
              </article>
            );
          })}
          {regions.length ? null : <p>No regions yet.</p>}
        </div>
      </section>
    </section>
  );
}
