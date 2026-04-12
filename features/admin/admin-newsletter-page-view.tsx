import styles from "@/features/admin/admin.module.css";
import type { AdminNewsletterPageData } from "@/lib/admin/newsletter";

export function AdminNewsletterPageView(props: AdminNewsletterPageData) {
  return (
    <section className={styles.moduleShell}>
      <header className={styles.moduleHeader}>
        <p className={styles.eyebrow}>Admin newsletter</p>
        <h2>Audience and Mailchimp sync</h2>
        <p>
          Newsletter signups now persist locally and sync to Mailchimp when provider credentials are
          available.
        </p>
      </header>

      <div className={styles.dashboardStatusBar}>
        {props.providerPills.map((pill) => (
          <span key={pill} className={styles.statusPill}>
            {pill}
          </span>
        ))}
      </div>

      <div className={styles.cardGrid}>
        {props.metrics.map((metric) => (
          <article key={metric.label} className={styles.card}>
            <p className={styles.cardEyebrow}>{metric.label}</p>
            <h3>{metric.value}</h3>
            <p>{metric.detail}</p>
          </article>
        ))}
      </div>

      <div className={styles.homepageWorkspaceGrid}>
        <section className={styles.groupPanel}>
          <strong>Setup notes</strong>
          <div className={styles.stack}>
            {props.setupNotes.map((note) => (
              <p key={note}>{note}</p>
            ))}
          </div>
        </section>

        <section className={styles.groupPanel}>
          <strong>Recent subscribers</strong>
          <div className={styles.stack}>
            {props.subscribers.length ? (
              props.subscribers.map((subscriber) => (
                <div key={subscriber.email} className={styles.card}>
                  <p className={styles.cardEyebrow}>{subscriber.status}</p>
                  <h3>{subscriber.email}</h3>
                  <p>Source: {subscriber.source}</p>
                  <p>Consented: {subscriber.consentedAt}</p>
                  <p>Last synced: {subscriber.lastSyncedAt}</p>
                </div>
              ))
            ) : (
              <p>No subscriber records exist yet.</p>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
