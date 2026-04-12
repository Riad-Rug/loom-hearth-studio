import styles from "@/features/admin/admin.module.css";
import type { AdminAnalyticsPageData } from "@/lib/admin/analytics";

export function AdminAnalyticsPageView(props: AdminAnalyticsPageData) {
  return (
    <section className={styles.moduleShell}>
      <header className={styles.moduleHeader}>
        <p className={styles.eyebrow}>Admin analytics</p>
        <h2>Reporting foundation</h2>
        <p>
          Commerce reporting now reads from persisted orders and customers, while GA4 collection is
          ready for consent-aware storefront tracking.
        </p>
      </header>

      <div className={styles.dashboardStatusBar}>
        {props.setupPills.map((pill) => (
          <span key={pill} className={styles.statusPill}>
            {pill}
          </span>
        ))}
      </div>

      <div className={styles.cardGrid}>
        {props.summaryMetrics.map((metric) => (
          <article key={metric.label} className={styles.card}>
            <p className={styles.cardEyebrow}>{metric.label}</p>
            <h3>{metric.value}</h3>
            <p>{metric.detail}</p>
          </article>
        ))}
      </div>

      <div className={styles.homepageWorkspaceGrid}>
        <section className={styles.groupPanel}>
          <strong>Top products</strong>
          <div className={styles.stack}>
            {props.topProducts.length ? (
              props.topProducts.map((product) => (
                <div key={product.productId} className={styles.card}>
                  <p className={styles.cardEyebrow}>{product.unitsSold} units</p>
                  <h3>{product.name}</h3>
                  <p>{product.revenue}</p>
                </div>
              ))
            ) : (
              <p>No paid-product sales are available yet.</p>
            )}
          </div>
        </section>

        <section className={styles.groupPanel}>
          <strong>Recent orders</strong>
          <div className={styles.stack}>
            {props.recentOrders.length ? (
              props.recentOrders.map((order) => (
                <div key={order.orderNumber} className={styles.card}>
                  <p className={styles.cardEyebrow}>{order.placedAt}</p>
                  <h3>{order.orderNumber}</h3>
                  <p>{order.customerEmail}</p>
                  <p>{order.total}</p>
                  <p>{order.status}</p>
                </div>
              ))
            ) : (
              <p>No persisted orders are available yet.</p>
            )}
          </div>
        </section>
      </div>

      <section className={styles.groupPanel}>
        <strong>Setup notes</strong>
        <div className={styles.stack}>
          {props.setupNotes.map((note) => (
            <p key={note}>{note}</p>
          ))}
        </div>
      </section>
    </section>
  );
}
