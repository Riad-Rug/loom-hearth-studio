import { adminModules, type AdminModuleKey } from "@/features/admin/admin-data";
import { adminGuardTodo, authConfig, getAdminAccessDecision } from "@/lib/auth";

import styles from "./admin.module.css";

type AdminModulePageViewProps = {
  moduleKey: AdminModuleKey;
};

export function AdminModulePageView({ moduleKey }: AdminModulePageViewProps) {
  const module = adminModules[moduleKey];
  const accessDecision = getAdminAccessDecision({
    user: {
      id: "admin-session-placeholder",
      email: "admin@example.com",
      role: "admin",
    },
    moduleKey,
  });

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
        <span>Current role: {accessDecision.currentRole ?? "none"}</span>
        <span>Route access state: {accessDecision.status}</span>
        <span>Allowed on this route: {accessDecision.allowedRoles.join(", ")}</span>
        <span>Boundary redirect target: {accessDecision.redirectTarget}</span>
        <span>{adminGuardTodo}</span>
      </div>

      {accessDecision.status === "allowed" ? (
        <div className={styles.cardGrid}>
          {module.cards.map((card) => (
            <article key={card.title} className={styles.card}>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className={styles.gatePanel}>
          <strong>Route gate placeholder</strong>
          <p>
            This admin route is reserved for authenticated back-office users whose role is
            allowed by the boundary configuration.
          </p>
          <p>Boundary redirect target: {accessDecision.redirectTarget}</p>
        </div>
      )}
    </section>
  );
}
