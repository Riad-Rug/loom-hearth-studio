import { adminModules, type AdminModuleKey } from "@/features/admin/admin-data";
import {
  adminGuardTodo,
  createAdminGatePresentation,
  createAdminModuleRouteViewModel,
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
  const routeViewModel = createAdminModuleRouteViewModel({
    moduleKey,
    module,
    accessDecision,
    gatePresentation,
    adminGuardTodo,
  });

  return (
    <section className={styles.moduleShell}>
      <header className={styles.moduleHeader}>
        <p className={styles.eyebrow}>{routeViewModel.header.eyebrow}</p>
        <h2>{routeViewModel.header.title}</h2>
        <p>{routeViewModel.header.description}</p>
      </header>

      <div className={styles.roleNote}>
        <strong>{routeViewModel.roleNote.title}</strong>
        {routeViewModel.roleNote.lines.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </div>

      {routeViewModel.accessStatus === "allowed" ? (
        <div className={styles.cardGrid}>
          {routeViewModel.cards.map((card) => (
            <article key={card.title} className={styles.card}>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className={styles.gatePanel}>
          <strong>{routeViewModel.gate.title}</strong>
          <p>{routeViewModel.gate.body}</p>
          <p>{routeViewModel.gate.redirectLabel}</p>
        </div>
      )}
    </section>
  );
}
