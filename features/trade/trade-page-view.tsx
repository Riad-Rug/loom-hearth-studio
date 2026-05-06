import Link from "next/link";

import styles from "./trade-page.module.css";

const tradeIncludes = [
  "Professional discount on all inventory",
  "Complimentary piece holds during client review",
  "High-resolution imagery for tear sheets and client decks",
  "Direct line to the studio - not the general inquiry queue",
  "Priority access to selected vintage pieces before public listing",
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
      "For rugs and other one-of-one pieces, the studio confirms the exact item with you before the order moves forward, so your client is reviewing the actual piece rather than a representative sample.",
  },
  {
    eyebrow: "Step 3",
    title: "Confirm pricing, holds, and next steps",
    body:
      "Once the piece is right, the conversation moves into pricing, timing, delivery destination, and any project-hold requirements so the order can proceed cleanly.",
  },
] as const;

const tradeFacts = [
  {
    label: "Response time",
    value: "Within 1 business day",
  },
  {
    label: "Project holds",
    value: "Available during client review",
  },
  {
    label: "Shipping origin",
    value: "Packed and dispatched from Morocco",
  },
] as const;

const supportedCategories = [
  "Rugs",
  "Vintage rugs",
  "Poufs",
  "Pillows",
  "Decor",
] as const;

const tradeDeliverables = [
  {
    title: "Exact-piece review",
    body: "One-of-one rugs are confirmed with the studio before a client signs off, so approvals are based on the actual piece rather than a style reference.",
  },
  {
    title: "Project-ready imagery",
    body: "High-resolution images can be prepared for client decks, mood boards, and internal sourcing review when a piece moves into active consideration.",
  },
  {
    title: "Direct studio contact",
    body: "Trade inquiries move through a dedicated contact path, which keeps project questions out of the retail queue and shortens the back-and-forth.",
  },
] as const;

const projectHoldNotes = [
  "Short holds are available while a client reviews a selected piece.",
  "The studio confirms hold timing based on the item, destination market, and project pace.",
  "For one-of-one rugs, the hold discussion happens before the order moves forward so availability stays clear.",
] as const;

const categoryDetails = [
  {
    title: "Rugs",
    body: "Hand-knotted Moroccan rugs for living rooms, bedrooms, and designer-led client installs.",
  },
  {
    title: "Vintage rugs",
    body: "Older one-of-one pieces for projects that need patina, age, and a more collected feel.",
  },
  {
    title: "Poufs, pillows, and decor",
    body: "Supporting pieces for styling layers, seating accents, and smaller client-facing sourcing packages.",
  },
] as const;

const tradeFaq = [
  {
    question: "Who is the trade program for?",
    answer:
      "Interior designers, decorators, stylists, and project buyers sourcing for client work rather than personal retail orders.",
  },
  {
    question: "How quickly does the studio reply?",
    answer:
      "Trade inquiries are answered within one business day, usually faster when the request already names the product category or exact piece.",
  },
  {
    question: "Can the studio hold a rug during client review?",
    answer:
      "Yes. Holds are discussed directly with the studio and confirmed around the project timeline, especially for one-of-one rugs and vintage inventory.",
  },
  {
    question: "Can I request imagery for a presentation deck?",
    answer:
      "Yes. Once a piece is in active consideration, the studio can prepare high-resolution imagery for client presentations and internal sourcing review.",
  },
] as const;

export function TradePageView() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroLayout}>
          <div className={styles.heroContent}>
            <p className={styles.eyebrow}>
              Trade program / professional discount / dedicated contact
            </p>
            <h1>Trade pricing and project support for interior designers.</h1>
            <div className={styles.heroBody}>
              <p className={styles.lede}>
                Trade pricing across rugs, poufs, pillows, and decor. Complimentary piece holds
                while clients review a selection. Direct contact with the studio within one
                business day.
              </p>
            </div>
            <ul className={styles.heroSignals} aria-label="Trade program highlights">
              <li>Professional pricing on active inventory</li>
              <li>Exact-piece review before a project moves forward</li>
              <li>High-resolution imagery for decks and tear sheets</li>
            </ul>
            <div className={styles.contactActions}>
              <Link className={styles.primaryAction} href="/contact?inquiryType=trade-request">
                Start a trade inquiry
              </Link>
              <Link className={styles.secondaryAction} href="/shop">
                View available categories
              </Link>
            </div>
            <div>
              <Link className={styles.textAction} href="/sourcing">
                Review sourcing framework
              </Link>
            </div>
          </div>

          <aside className={styles.heroAside} aria-label="Trade program proof">
            <div className={styles.heroFactRail}>
              {tradeFacts.map((fact) => (
                <div key={fact.label} className={styles.heroFactItem}>
                  <p className={styles.heroFactLabel}>{fact.label}</p>
                  <p className={styles.heroFactValue}>{fact.value}</p>
                </div>
              ))}
            </div>

            <div className={styles.heroProofCard}>
              <p className={styles.heroProofEyebrow}>Trade support includes</p>
              <h2>Built for sourcing decisions that need client-ready proof.</h2>
              <p className={styles.heroProofBody}>
                The trade path is structured around exact-piece review, project holds, and direct
                studio communication so selections can move from shortlist to approval with less
                friction.
              </p>
              <div className={styles.heroCategoryBlock}>
                <p className={styles.heroCategoryLabel}>Categories currently supported</p>
                <div className={styles.heroCategoryChips}>
                  {supportedCategories.map((category) => (
                    <span key={category} className={styles.heroCategoryChip}>
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className={styles.card}>
        <p className={styles.eyebrow}>What trade includes</p>
        <h2>Built for client-facing sourcing, not retail browsing.</h2>
        <div className={styles.cardBody}>
          <ul className={styles.includeList}>
            {tradeIncludes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.utilityGrid} aria-label="Trade support details">
        <article className={styles.card}>
          <p className={styles.eyebrow}>What you receive</p>
          <h2>Support that helps a shortlist become an approved selection.</h2>
          <div className={styles.detailList}>
            {tradeDeliverables.map((item) => (
              <div key={item.title} className={styles.detailItem}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        </article>

        <article className={styles.card}>
          <p className={styles.eyebrow}>Project holds</p>
          <h2>How a piece can stay reserved while the client decides.</h2>
          <div className={styles.cardBody}>
            <ul className={styles.includeList}>
              {projectHoldNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        </article>
      </section>

      <section className={styles.card}>
        <p className={styles.eyebrow}>Categories available for trade</p>
        <h2>Use the trade path across the collection, not just a single product type.</h2>
        <div className={styles.detailColumns}>
          {categoryDetails.map((category) => (
            <div key={category.title} className={styles.detailItem}>
              <h3>{category.title}</h3>
              <p>{category.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.sectionHeader}>
        <p className={styles.eyebrow}>Trade workflow</p>
        <h2>A direct sourcing path for project buyers.</h2>
        <p className={styles.body}>
          The trade program is designed for designers who need a faster path from sourcing request
          to exact-piece review, with fewer handoffs and clearer project communication.
        </p>
      </section>

      <section className={styles.workflowGrid}>
        {tradeWorkflow.map((step) => (
          <article key={step.title} className={styles.card}>
            <p className={styles.eyebrow}>{step.eyebrow}</p>
            <h3>{step.title}</h3>
            <div className={styles.cardBody}>
              <p>{step.body}</p>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.card}>
        <p className={styles.eyebrow}>Trade FAQ</p>
        <h2>Questions that come up before a designer reaches out.</h2>
        <div className={styles.faqList}>
          {tradeFaq.map((item) => (
            <article key={item.question} className={styles.faqItem}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.finalCta}>
        <div className={styles.finalCtaCopy}>
          <p className={styles.eyebrow}>Trade inquiry</p>
          <h2>Bring the project details and the studio will take it from there.</h2>
          <p className={styles.body}>
            If you already know the category, size direction, destination market, or exact piece,
            the inquiry can move straight into sourcing support and next-step pricing.
          </p>
        </div>
        <div className={styles.contactActions}>
          <Link className={styles.primaryAction} href="/contact?inquiryType=trade-request">
            Contact the studio
          </Link>
          <Link className={styles.secondaryAction} href="/sourcing">
            Review sourcing framework
          </Link>
        </div>
      </section>
    </div>
  );
}
