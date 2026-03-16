import { adminModules, type AdminModuleKey } from "@/features/admin/admin-data";
import { authConfig } from "@/lib/auth";

import styles from "./admin.module.css";

type AdminModulePageViewProps = {
  moduleKey: AdminModuleKey;
};

export function AdminModulePageView({ moduleKey }: AdminModulePageViewProps) {
  const module = adminModules[moduleKey];

  return (
    <section className={styles.moduleShell}>
      <header className={styles.moduleHeader}>
        <p className={styles.eyebrow}>{module.eyebrow}</p>
        <h2>{module.title}</h2>
        <p>{module.description}</p>
      </header>

      <div className={styles.roleNote}>
        <strong>Role note</strong>
        <span>
          Admin, Editor, and Viewer are PRD-defined roles. This slice shows that as
          presentation only, without auth or route protection.
        </span>
        <span>Supported boundary roles: {authConfig.admin.roles.join(", ")}</span>
      </div>

      <div className={styles.cardGrid}>
        {module.cards.map((card) => (
          <article key={card.title} className={styles.card}>
            <h3>{card.title}</h3>
            <p>{card.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
