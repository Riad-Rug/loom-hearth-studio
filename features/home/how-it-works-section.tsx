import type { Route } from "next";
import Link from "next/link";

import { Section } from "@/components/layout/section";

import styles from "./home-page.module.css";

const steps = [
  {
    number: "Step 1",
    title: "Browse and place an order",
    description: "Find a piece that interests you and place an order or send us a direct inquiry.",
  },
  {
    number: "Step 2",
    title: "We send you a video",
    description:
      "You receive a video of the actual rug  texture, colour in natural light, colour under warm and cool indoor light, and size in context. Before any payment is taken.",
  },
  {
    number: "Step 3",
    title: "Confirm and we ship",
    description: "Once you are satisfied, payment is captured and your piece ships from Morocco with full tracking.",
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
            Colour in a photograph and colour under your indoor light are not the same thing. Warm bulbs pull rugs
            warmer. Cool white light flattens them. Natural light is different again. Before your payment is
            captured, we send you a video of the actual piece in multiple light conditions so you can see how it
            behaves before it ships. If it is not right for your space, you do not pay.
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
          INQUIRE ABOUT A PIECE
        </Link>
      </div>
    </Section>
  );
}
