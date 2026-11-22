import type { Route } from "next";
import Link from "next/link";

import { Section } from "@/components/layout/section";
import { storePromise, storePromiseCopy } from "@/lib/order/store-promise";

import styles from "./home-page.module.css";

const steps = [
  {
    number: "Step 1",
    title: "Browse and Place an Order",
    description: "Find a piece that interests you and place an order or send us a direct inquiry.",
  },
  {
    number: "Step 2",
    title: "We Send You Photos and Video",
    description: `You receive ${storePromise.approvalMedia} of the actual piece ${storePromiseCopy.approvalTurnaround}: texture, colour in natural light, and size in context. Before any payment is taken.`,
  },
  {
    number: "Step 3",
    title: "Approve and We Ship",
    description: `Once you approve, payment is captured and your piece ships from ${storePromise.shipsFromCity} with full tracking.`,
  },
] as const;

export function HowItWorksSection() {
  return (
    <Section tone="muted" width="wide">
      <div className={styles.howItWorksSection}>
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>HOW IT WORKS</p>
          <h2>See the exact piece in your light conditions before you pay.</h2>
          <p className={styles.sectionBody}>
            Before payment is captured, we send {storePromise.approvalMedia} of the actual piece. You have{" "}
            {storePromiseCopy.decisionWindow} to decide. If it is not right for your room, the order stops there.
          </p>
        </div>

        <div className={styles.howItWorksGrid}>
          {steps.map((step) => (
            <article key={step.number} className={styles.howItWorksCard}>
              <p className={styles.howItWorksStep}>{step.number}</p>
              <h3 className={styles.howItWorksTitle}>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>

        <Link className={`${styles.primaryAction} ${styles.howItWorksCta}`} href={"/contact" as Route}>
          ASK ABOUT A SPECIFIC RUG
        </Link>
      </div>
    </Section>
  );
}
