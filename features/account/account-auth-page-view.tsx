import type { Route } from "next";
import Link from "next/link";

import {
  accountAuthContent,
  type AccountAuthMode,
} from "@/features/account/account-data";

import styles from "./account.module.css";

type AccountAuthPageViewProps = {
  mode: AccountAuthMode;
};

export function AccountAuthPageView({ mode }: AccountAuthPageViewProps) {
  const content = accountAuthContent[mode];

  return (
    <div className={styles.page}>
      <section className={styles.authShell}>
        <div className={styles.authIntro}>
          <p className={styles.eyebrow}>{content.eyebrow}</p>
          <h1>{content.title}</h1>
          <p className={styles.lede}>{content.body}</p>
          <div className={styles.authLinks}>
            <Link href={"/account/login" as Route}>Login</Link>
            <Link href={"/account/register" as Route}>Register</Link>
            <Link href={"/account/forgot-password" as Route}>Forgot password</Link>
          </div>
        </div>

        <div className={styles.formCard}>
          <div className={styles.formStack}>
            {mode === "register" ? (
              <>
                <label className={styles.field}>
                  <span>First name</span>
                  <input placeholder="Jordan" type="text" />
                </label>
                <label className={styles.field}>
                  <span>Last name</span>
                  <input placeholder="Smith" type="text" />
                </label>
              </>
            ) : null}

            <label className={styles.field}>
              <span>Email address</span>
              <input placeholder="name@example.com" type="email" />
            </label>

            {mode !== "forgot-password" ? (
              <label className={styles.field}>
                <span>Password</span>
                <input placeholder="••••••••" type="password" />
              </label>
            ) : null}

            <button className={styles.primaryAction} type="button">
              {content.primaryLabel}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
