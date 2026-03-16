import { adminModules, type AdminModuleKey } from "@/features/admin/admin-data";
import {
  adminGuardTodo,
  createAdminGatePresentation,
  getAdminAccessDecision,
} from "@/lib/auth";

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
  const gatePresentation = createAdminGatePresentation(accessDecision);

  return (
    <section className={styles.moduleShell}>
      <header className={styles.moduleHeader}>
        <p className={styles.eyebrow}>{module.eyebrow}</p>
        <h2>{module.title}</h2>
        <p>{module.description}</p>
      </header>

      <div className={styles.roleNote}>
        <strong>{gatePresentation.roleNoteTitle}</strong>
        <span>{gatePresentation.roleNoteBody}</span>
        <span>{gatePresentation.supportedRolesLabel}</span>
        <span>{gatePresentation.currentRoleLabel}</span>
        <span>{gatePresentation.accessStateLabel}</span>
        <span>{gatePresentation.allowedRolesLabel}</span>
        <span>{gatePresentation.redirectTargetLabel}</span>
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
          <strong>{gatePresentation.gateTitle}</strong>
          <p>{gatePresentation.gateBody}</p>
          <p>{gatePresentation.gateRedirectLabel}</p>
        </div>
      )}
    </section>
  );
}
