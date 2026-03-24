import type { Route } from "next";
import Link from "next/link";

import { Section } from "@/components/layout/section";

import styles from "./home-page.module.css";

const steps = [
  {
    number: "Step 1",
    title: "Browse and inquire",
    description: "Find a piece you love and submit an inquiry or contact us directly.",
  },
  {
    number: "Step 2",
    title: "We send you a video",
    description: "You receive a video of the actual piece before any payment is taken.",
  },
  {
    number: "Step 3",
    title: "Confirm and we ship",
    description: "Once you are happy, payment is captured and your piece ships from Morocco.",
  },
] as const;

export function HowItWorksSection() {
  return (
    <Section tone="muted" width="wide">
      <div className={styles.howItWorksSection}>
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>How it works</p>
          <h2>See the exact piece before you pay.</h2>
          <p className={styles.sectionBody}>
            Every piece in the collection is one of one. Before your payment is captured, we send you a video of
            the actual rug texture, color in natural light, and size in context. If it is not exactly right, you do
            not pay.
          </p>
        </div>

        <div className={styles.howItWorksGrid}>
          {steps.map((step) => (
            <article key={step.number} className={styles.howItWorksCard}>
              <p className={styles.howItWorksStep}>{step.number}</p>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>

        <Link className={styles.primaryAction} href={"/contact" as Route}>
          Inquire about a piece
        </Link>
      </div>
    </Section>
  );
}
