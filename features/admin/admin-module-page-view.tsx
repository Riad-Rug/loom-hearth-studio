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
  moduleOverride?: {
    eyebrow: string;
    title: string;
    description: string;
    cards: { title: string; body: string; lines?: string[] }[];
  };
};

export function AdminModulePageView({ moduleKey, moduleOverride }: AdminModulePageViewProps) {
  const module = moduleOverride ?? adminModules[moduleKey];
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
            <article key={card.id} className={styles.card}>
              <p className={styles.cardEyebrow}>{card.eyebrow}</p>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
              {card.lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
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
