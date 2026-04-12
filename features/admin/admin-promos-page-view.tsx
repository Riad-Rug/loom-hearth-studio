"use client";

import { useActionState } from "react";

import {
  createAdminPromoAction,
  initialAdminPromoActionState,
  toggleAdminPromoAction,
  type AdminPromoActionState,
} from "@/app/(admin)/admin/promos/actions";
import styles from "@/features/admin/admin.module.css";
import type { AdminPromosPageData } from "@/lib/admin/promos";

export function AdminPromosPageView(props: AdminPromosPageData) {
  const [actionState, formAction, isPending] = useActionState<AdminPromoActionState, FormData>(
    createAdminPromoAction,
    initialAdminPromoActionState,
  );

  return (
    <section className={styles.moduleShell}>
      <header className={styles.moduleHeader}>
        <p className={styles.eyebrow}>Admin promos</p>
        <h2>Promo codes</h2>
        <p>Create launch-safe promo codes and monitor which ones are active.</p>
      </header>

      <div className={styles.cardGrid}>
        {props.summary.map((item) => (
          <article key={item.label} className={styles.card}>
            <p className={styles.cardEyebrow}>{item.label}</p>
            <h3>{item.value}</h3>
            <p>{item.detail}</p>
          </article>
        ))}
      </div>

      {actionState.message ? (
        <div className={actionState.status === 'success' ? styles.successPanel : styles.gatePanel}>
          <strong>{actionState.status === 'success' ? 'Saved' : 'Needs attention'}</strong>
          <p>{actionState.message}</p>
        </div>
      ) : null}

      <div className={styles.homepageWorkspaceGrid}>
        <form action={formAction} className={styles.groupPanel}>
          <strong>Create promo</strong>
          <div className={styles.formGrid}>
            <label className={styles.formField}><span>Code</span><input name="code" type="text" placeholder="WELCOME10" required /></label>
            <label className={styles.formField}><span>Type</span><select name="type" defaultValue="percent"><option value="percent">Percent</option><option value="fixed">Fixed amount</option></select></label>
            <label className={styles.formField}><span>Amount</span><input name="amount" type="number" min="0.01" step="0.01" required /></label>
            <label className={styles.formField}><span>Minimum subtotal</span><input name="minimumSubtotalUsd" type="number" min="0" step="0.01" /></label>
            <label className={styles.formField}><span>Usage limit</span><input name="usageLimit" type="number" min="1" step="1" /></label>
            <label className={styles.formField}><span>Starts at</span><input name="startsAt" type="datetime-local" /></label>
            <label className={styles.formField}><span>Ends at</span><input name="endsAt" type="datetime-local" /></label>
            <label className={styles.formField}><span>Scope</span><select name="scopeType" defaultValue="all"><option value="all">All products</option><option value="category">Category</option><option value="product">Specific products</option></select></label>
            <label className={styles.formField}><span>Category</span><select name="scopeCategory" defaultValue=""><option value="">Any category</option><option value="rugs">Rugs</option><option value="poufs">Poufs</option><option value="pillows">Pillows</option><option value="decor">Decor</option><option value="vintage">Vintage</option></select></label>
            <label className={styles.formField}><span>Product IDs</span><input name="scopeProductIds" type="text" placeholder="prod_a, prod_b" /></label>
          </div>
          <label className={styles.formField}><span>Notes</span><textarea name="notes" rows={3} /></label>
          <div className={styles.actionRow}><button className={`${styles.inlineActionLink} ${styles.inlineActionLinkPrimary}`} type="submit" disabled={isPending}>{isPending ? 'Saving promo...' : 'Save promo'}</button></div>
        </form>

        <section className={styles.groupPanel}>
          <strong>Saved promos</strong>
          <div className={styles.stack}>
            {props.promos.length ? props.promos.map((promo) => (
              <article key={promo.id} className={styles.card}>
                <p className={styles.cardEyebrow}>{promo.active ? 'Active' : 'Inactive'}</p>
                <h3>{promo.code}</h3>
                <p>{promo.typeLabel} ? {promo.amountLabel}</p>
                <p>Minimum subtotal: {promo.minimumSubtotalLabel}</p>
                <p>{promo.scopeLabel}</p>
                <p>Usage: {promo.usageLabel}</p>
                {promo.notes ? <p>{promo.notes}</p> : null}
                <form action={toggleAdminPromoAction}>
                  <input type="hidden" name="promoId" value={promo.id} />
                  <input type="hidden" name="active" value={promo.active ? 'false' : 'true'} />
                  <button className={styles.inlineActionLink} type="submit">{promo.active ? 'Deactivate' : 'Activate'}</button>
                </form>
              </article>
            )) : <p>No promos have been created yet.</p>}
          </div>
        </section>
      </div>
    </section>
  );
}
