import Image from "next/image";
import Link from "next/link";

import { customerReviews } from "@/lib/reviews/customer-reviews";

import { TradeStickyAction } from "./trade-sticky-action";
import styles from "./trade-page.module.css";

const tradeIncludes = [
  "Use it when the project needs a pricing answer before client approval.",
  "Use it when a ONE OF A KIND rug needs to stay clear and reserved during review.",
  "Use it when you need imagery for tear sheets, decks, or internal sourcing review.",
  "Use it when destination market and delivery timing need to be reviewed before checkout.",
  "Use it when the project requires direct studio back-and-forth instead of retail browsing.",
] as const;

const tradeWorkflow = [
  {
    title: "Start with a trade inquiry",
    body:
      "The trade inquiry flow captures the practical context: product interest, destination market, room or project type, timing, and what kind of support you need from the studio.",
  },
  {
    title: "Review the exact piece with the studio",
    body:
      "For rugs and other ONE OF A KIND pieces, the studio confirms the exact item with you before the order moves forward, so your client is reviewing the actual piece rather than a representative sample.",
  },
  {
    title: "Confirm pricing, holds, and next steps",
    body:
      "Once the piece is right, the conversation moves into pricing, timing, delivery destination, and any project-hold requirements so the order can proceed cleanly.",
  },
] as const;

const tradeFacts = [
  {
    label: "Trade discount",
    value: "10% on active inventory",
  },
  {
    label: "Response time",
    value: "Within 1 business day",
  },
  {
    label: "Project holds",
    value: "3 business days",
  },
  {
    label: "Shipping origin",
    value: "Packed and dispatched from Morocco",
  },
] as const;

const supportedCategories = [
  { label: "Rugs", href: "/shop/rugs" },
  { label: "Vintage rugs", href: "/shop/rugs/vintage" },
  { label: "Poufs", href: "/shop/poufs" },
  { label: "Pillows", href: "/shop/pillows" },
  { label: "Decor", href: "/shop/decor" },
] as const;

const tradeDeliverables = [
  {
    title: "Trade pricing clarity",
    body: "The conversation moves quickly into the 10% trade pricing structure, active availability, and whether a piece fits the budget before the client review drags on.",
  },
  {
    title: "Presentation-ready assets",
    body: "High-resolution images and exact-piece confirmation support tear sheets, presentations, and internal review without having to rely on generic catalog references.",
  },
  {
    title: "Project coordination",
    body: "The studio reviews market, timing, hold status, and next-step logistics directly so sourcing decisions stay clean once the client is close to approval.",
  },
] as const;

const projectHoldNotes = [
  "Complimentary holds are available for up to 3 business days while a client reviews a selected piece.",
  "If the project timeline needs something different, the studio confirms next-step availability directly against the item and destination market.",
  "For ONE OF A KIND rugs, the hold conversation happens before the order moves forward so availability stays clear.",
] as const;

const categoryDetails = [
  {
    title: "Rugs",
    body: "Hand-knotted Moroccan rugs for living rooms, bedrooms, and full-room installs where exact-piece review matters before client sign-off.",
  },
  {
    title: "Vintage rugs",
    body: "ONE OF A KIND vintage pieces for projects that need age, patina, and a more collected point of view rather than broad repeatable stock.",
  },
  {
    title: "Poufs, pillows, and decor",
    body: "Supporting pieces for styling layers, accessory packages, and the final room pass once the anchor textiles are already in view.",
  },
] as const;

const tradeProofPoints = [
  {
    title: "Built around ONE OF A KIND inventory",
    body: "The trade path exists because the strongest pieces are not repeatable stock. Designers need the exact item, clear timing, and a faster answer cycle.",
  },
  {
    title: "Structured for client review",
    body: "Imagery, availability, holds, and pricing are framed to help a designer move a shortlist through presentation and approval with less friction.",
  },
  {
    title: "Direct studio coordination",
    body: "Questions move through the studio instead of a general support queue, which keeps sourcing decisions closer to the actual piece and shipping context.",
  },
] as const;

const tradeTestimonials = customerReviews.filter((review) =>
  ["ashley-t-rug", "emma-s-rug", "josh-w-rug"].includes(review.id),
);

const featuredTradeTestimonialId = "emma-s-rug";

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
      "Yes. Complimentary holds are available for up to 3 business days, with any longer timing confirmed directly against the piece and project timeline.",
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
      <TradeStickyAction />

      <section className={styles.hero}>
        <div className={styles.heroLayout}>
          <div className={styles.heroContent}>
            <p className={styles.eyebrow}>Interior design trade program</p>
            <h1>Trade pricing and project support for interior designers.</h1>
            <div className={styles.heroBody}>
              <p className={styles.lede}>
                A standing 10% trade discount across active rugs, poufs, pillows, and decor.
                Complimentary 3-business-day holds while clients review a selection. Direct
                contact with the studio within one business day.
              </p>
              <p className={styles.body}>
                Open to interior designers, architects, stylists, and project buyers who need
                direct sourcing support on active inventory.
              </p>
            </div>
            <ul className={styles.heroSignals} aria-label="Trade program highlights">
              <li>10% trade pricing on active inventory</li>
              <li>Exact-piece review before a project moves forward</li>
              <li>High-resolution imagery for decks and tear sheets</li>
            </ul>
            <div className={styles.contactActions}>
              <Link className={styles.primaryAction} href="/trade/apply">
                Start a trade inquiry
              </Link>
              <Link className={styles.secondaryAction} href="/shop">
                View available categories
              </Link>
            </div>
            <div>
              <Link className={styles.textAction} href="/sourcing">
                See the sourcing review path →
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
                    <Link key={category.label} className={styles.heroCategoryChip} href={category.href}>
                      {category.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className={styles.heroVisualBand} aria-label="Trade image review">
        <div className={styles.heroVisualLayout}>
          <div className={styles.heroVisualCopy}>
            <p className={styles.eyebrow}>Review image</p>
            <h2>The exact piece stays visible while the project decision is being made.</h2>
            <p className={styles.body}>
              The trade path works best when imagery, pricing, hold timing, and availability are
              all being reviewed against the actual piece rather than a generic style reference.
            </p>
          </div>
          <div className={styles.heroVisualFrame}>
            <Image
              alt="Top-down review image showing a handmade Moroccan rug in warm natural light"
              className={styles.heroVisualImage}
              height={960}
              src="/hero/verification-topdown-v1.png"
              width={960}
            />
          </div>
        </div>
      </section>

      <section className={styles.bandSection}>
        <div className={styles.bandInner}>
          <p className={styles.eyebrow}>What trade includes</p>
          <h2>Use the trade path when the project needs more than a product page.</h2>
          <div className={styles.cardBody}>
            <ul className={styles.includeList}>
              {tradeIncludes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.utilityGrid} aria-label="Trade support details">
        <article className={`${styles.card} ${styles.detailCard}`}>
          <p className={styles.eyebrow}>What you receive</p>
          <h2>Support that keeps the sourcing conversation moving forward.</h2>
          <div className={styles.detailList}>
            {tradeDeliverables.map((item) => (
              <div key={item.title} className={styles.detailItem}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        </article>

        <article className={`${styles.card} ${styles.utilityCard}`}>
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

      <section className={styles.statBreak}>
        <p>10% off. Direct studio contact. 3-business-day holds.</p>
      </section>

      <section className={styles.editorialSection}>
        <div className={styles.editorialInner}>
          <p className={styles.eyebrow}>Why designers use it</p>
          <h2>The trade page works best when the project needs certainty, not more browsing.</h2>
          <div className={styles.detailColumns}>
            {tradeProofPoints.map((point) => (
              <div key={point.title} className={styles.detailItem}>
                <h3>{point.title}</h3>
                <p>{point.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.card} ${styles.testimonialCard}`}>
        <p className={styles.eyebrow}>What customers say</p>
        <h2>Clear communication and confidence in the final piece still matter most.</h2>
        <div className={styles.testimonialGrid}>
          {tradeTestimonials.map((testimonial) => (
            <figure
              key={testimonial.id}
              className={`${styles.testimonialItem} ${
                testimonial.id === featuredTradeTestimonialId ? styles.testimonialItemFeatured : ""
              }`}
            >
              <blockquote>{testimonial.body}</blockquote>
              <figcaption>
                <span>{testimonial.customerName}</span>
                <span>{testimonial.country}</span>
                <span>{testimonial.productType}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className={`${styles.card} ${styles.categoryCard}`}>
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
        {tradeWorkflow.map((step, index) => (
          <article key={step.title} className={styles.card}>
            <p className={styles.workflowStepLabel}>Step {index + 1}</p>
            <h3>{step.title}</h3>
            <div className={styles.cardBody}>
              <p>{step.body}</p>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.faqSection}>
        <div className={styles.faqInner}>
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
        </div>
      </section>

      <section className={styles.finalCta}>
        <div className={styles.finalCtaInner}>
          <div className={styles.finalCtaCopy}>
            <p className={styles.eyebrow}>Trade inquiry</p>
            <h2>Bring the project details and the studio will take it from there.</h2>
            <p className={styles.body}>
              If you already know the category, size direction, destination market, or exact
              piece, the inquiry can move straight into sourcing support and next-step pricing.
            </p>
          </div>
          <div className={styles.contactActions}>
            <Link className={styles.primaryAction} href="/trade/apply">
              Contact the studio
            </Link>
            <Link className={styles.secondaryAction} href="/sourcing">
              See the sourcing review path
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

