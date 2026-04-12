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

const tradeSections = [
  {
    eyebrow: "Trade support",
    title: "A clear starting point for designers, specifiers, and project sourcing.",
    body:
      "The trade route now acts as the framework for project-based buying. It is designed for studios that need direct communication, client-review support, and a clean path into sourcing questions before the final catalog is loaded.",
    items: [
      "Project and sourcing inquiries routed through a dedicated trade intake",
      "Support for image requests, project timing, and piece review questions",
      "A stable starting point for future hold policies, tear sheets, and project workflows",
    ],
  },
  {
    eyebrow: "How to use it",
    title: "Use the trade inquiry flow for client-facing requests now.",
    body:
      "If you are sourcing for a client, start here instead of the general contact path. Include the project location, desired size, target timing, and whether you need high-resolution imagery or a short hold discussion.",
    items: [
      "Request project support before presenting a one-of-one piece",
      "Ask for imagery and review materials for client decks",
      "Use the same route for sourcing-led questions and custom requests",
    ],
  },
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
        <p className={styles.eyebrow}>Trade</p>
        <h1>For designers, decorators, and project-based sourcing.</h1>
        <div className={styles.heroBody}>
          <p className={styles.lede}>
            Loom & Hearth Studio now has a dedicated trade entry point for project inquiries. The
            workflow is intentionally lightweight for now, but it already supports trade-specific
            questions, image requests, and project context before payment or product approval.
          </p>
        </div>
        <div className={styles.contactActions}>
          <Link className={styles.primaryAction} href="/contact?inquiryType=trade-request">
            Start a trade inquiry
          </Link>
          <Link
            className={styles.secondaryAction}
            href="/contact?inquiryType=trade-request&requestHold=yes&requestImages=yes"
          >
            Request project support
          </Link>
          <Link className={styles.secondaryAction} href="/shop/rugs">
            Browse rugs
          </Link>
        </div>
      </section>

      <section className={styles.twoColumn}>
        {tradeSections.map((section) => (
          <article key={section.title} className={styles.card}>
            <p className={styles.eyebrow}>{section.eyebrow}</p>
            <h2>{section.title}</h2>
            <div className={styles.cardBody}>
              <p>{section.body}</p>
              <ul>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
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