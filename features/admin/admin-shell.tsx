import type { ReactNode } from "react";
import type { Route } from "next";
import Link from "next/link";

import { adminNav } from "@/features/admin/admin-data";

import styles from "./admin.module.css";

type AdminShellProps = {
  children: ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarIntro}>
          <p className={styles.eyebrow}>Admin</p>
          <h1>Back office shell</h1>
          <p>
            Placeholder-only admin shell. Route protection and role enforcement are not
            implemented.
          </p>
        </div>
        <nav className={styles.nav} aria-label="Admin navigation">
          {adminNav.map((item) => (
            <Link key={item.href} className={styles.navLink} href={item.href as Route}>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
