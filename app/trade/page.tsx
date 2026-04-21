import type { Metadata } from "next";
import Link from "next/link";

import styles from "@/features/content-pages/content-pages.module.css";
import { buildManagedMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildManagedMetadata({
    entityType: "static_page",
    entityKey: "trade",
    title: "Trade",
    description:
      "Trade-facing introduction for designers, specifiers, and sourcing inquiries working with Loom & Hearth Studio.",
    path: "/trade",
  });
}

const tradeIncludes = [
  "Professional discount on all inventory",
  "Complimentary piece holds during client review",
  "High-resolution imagery for tear sheets and client decks",
  "Direct line to the studio - not the general inquiry queue",
  "Priority access to vintage pieces before public listing",
] as const;

const tradeWorkflow = [
  {
    eyebrow: "Step 1",
    title: "Start with a trade inquiry",
    body:
      "The trade inquiry flow captures the practical context: product interest, destination market, room or project type, timing, and what kind of support you need from the studio.",
  },
  {
    eyebrow: "Step 2",
    title: "Review the exact piece with the studio",
    body:
      "For rugs and one-of-one pieces, the next step is a guided review path rather than a blind purchase. This framework is in place now so the full catalog can drop into it later without changing the buyer journey.",
  },
  {
    eyebrow: "Step 3",
    title: "Move toward a fuller trade workflow",
    body:
      "As the catalog, image library, and operational policies are finalized, this route will expand to cover tear sheets, image handling, project holds, and more explicit trade guidance.",
  },
] as const;

export default function TradePage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Trade program / professional discount / dedicated contact</p>
        <h1>Trade pricing and project support for interior designers.</h1>
        <div className={styles.heroBody}>
          <p className={styles.lede}>
            Trade discount on all rugs, poufs, and pillows.
            <br />
            Complimentary piece holds during client review.
            <br />
            Direct contact with the studio - no retail queue.
          </p>
        </div>
        <div className={styles.contactActions}>
          <Link className={styles.primaryAction} href="/contact?inquiryType=trade-request">
            Start a trade inquiry
          </Link>
        </div>
        <div>
          <Link className={styles.textAction} href="/shop">
            Browse the collection
          </Link>
        </div>
      </section>

      <section className={styles.card}>
        <p className={styles.eyebrow}>What trade includes</p>
        <h2>Built for client-facing sourcing, not retail browsing.</h2>
        <div className={styles.cardBody}>
          <ul>
            {tradeIncludes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.sectionHeader}>
        <p className={styles.eyebrow}>Trade workflow</p>
        <h2>A cleaner path for project buyers is now in place.</h2>
        <p className={styles.body}>
          The trade framework is built to support a more guided buying path now, while leaving room
          for final operational details once the catalog, product imagery, and trade assets are
          published.
        </p>
      </section>

      <section className={styles.twoColumn}>
        {tradeWorkflow.map((step) => (
          <article key={step.title} className={styles.card}>
            <p className={styles.eyebrow}>{step.eyebrow}</p>
            <h2>{step.title}</h2>
            <div className={styles.cardBody}>
              <p>{step.body}</p>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.contactActions}>
        <Link className={styles.primaryAction} href="/contact?inquiryType=trade-request">
          Contact the studio
        </Link>
        <Link className={styles.secondaryAction} href="/sourcing">
          Review sourcing framework
        </Link>
      </section>
    </div>
  );
}
