import Image from "next/image";
import Link from "next/link";

import { getCloudinaryConfig } from "@/lib/cloudinary/config";
import { customerReviews } from "@/lib/reviews/customer-reviews";

import { TradeStickyAction } from "./trade-sticky-action";
import styles from "./trade-page.module.css";

// What actually moves a project quote. Kept to four so the block stays
// scannable next to the four process steps below it.
const pricingDrivers = [
  {
    label: "Quantity",
    body: "One anchor rug reads differently from a fifteen-piece install.",
  },
  {
    label: "Scope",
    body: "Room count, sizes, timing, and how much of the spec is still open.",
  },
  {
    label: "Consolidated shipping",
    body: "Rugs, poufs, pillows, and decor leaving Morocco together, not in separate parcels.",
  },
  {
    label: "Sourcing needs",
    body: "Whether a piece is already here, has to be found, or has to be woven.",
  },
] as const;

// Uploaded to the loom-hearth/trade Cloudinary folder from the founder's
// sourcing trips; the public IDs are resolved against the cloud name in env.
const sourcingScope = [
  {
    publicId: "sourcing-rug-stacks",
    label: "Moroccan rugs",
    body: "Hand-knotted and flatwoven, vintage and new, matched to the room rather than a size chart.",
    alt: "Stacks of hand-woven Moroccan rugs in a sourcing room in Morocco",
  },
  {
    publicId: "sourcing-textile-review",
    label: "Moroccan antiques",
    body: "Carved doors, hand-forged lanterns, and vintage silver and brass sourced from souks and antique dealers across Morocco.",
    alt: "A Moroccan antiques shop interior with a carved wooden door, hanging lanterns, and displays of silverware and pottery",
  },
  {
    publicId: "sourcing-fez-pottery",
    label: "Handmade Moroccan decor",
    body: "Fez pottery, brass, and basketry for the accessory pass once the textiles are set.",
    alt: "Shelves of hand-painted blue and white Fez pottery",
  },
] as const;

const tradeFacts = [
  {
    label: "Trade pricing",
    value: "Quoted per project",
  },
  {
    label: "Sourcing",
    value: "Across Morocco",
  },
  {
    label: "Response time",
    value: "In less than 24h",
  },
  {
    label: "Shipping origin",
    value: "Packed and dispatched from Morocco",
  },
] as const;

const tradeDeliverables = [
  {
    title: "Project-based pricing",
    body: "Quotes are built around the scope of your project, quantities, sourcing requirements, and opportunities to consolidate shipping.",
  },
  {
    title: "Exact-piece review",
    body: "For one-of-a-kind Moroccan rugs and vintage pieces, you can review the exact item, including additional photos and details, before moving forward.",
  },
  {
    title: "Client-ready imagery",
    body: "Need images for a presentation, sourcing deck, or client approval? We can provide high-resolution photography of pieces under active consideration.",
  },
  {
    title: "Project holds",
    body: "When a one-of-a-kind piece is being reviewed by your client, we can usually reserve it for up to 3 business days. Longer holds can be discussed depending on the piece and project.",
  },
] as const;

const tradeTestimonials = customerReviews.filter((review) =>
  ["ashley-t-rug", "emma-s-rug", "josh-w-rug"].includes(review.id),
);

const featuredTradeTestimonialId = "emma-s-rug";

// Same delivery transformation the live product imagery already uses, with the
// cloud name read from env rather than hard-coded.
function sourcingImageUrl(publicId: string) {
  const { baseDeliveryUrl, folders } = getCloudinaryConfig();

  return `${baseDeliveryUrl}/c_limit,w_1000,f_auto,q_auto/${folders.trade}/${publicId}`;
}

export function TradePageView() {
  return (
    <div className={styles.page}>
      <TradeStickyAction />

      <section className={styles.hero} data-hero-sentinel>
        <div className={styles.heroContent}>
          <div className={styles.heroIntro}>
            <p className={styles.eyebrow}>Interior design trade program</p>
            <h1>
              We help interior designers, architects, and professionals to source authentic
              pieces for all projects.
            </h1>
          </div>
          <div className={styles.heroBody}>
            <p className={styles.lede}>
              Whether you're sourcing a single statement rug or furnishing an entire project, my
              service is built around helping you find what's right, not shifting whatever's in
              stock.
            </p>
            <p className={styles.body}>
              Through relationships built over three generations—from my grandfather's bazaar to
              my own sourcing today—I've got access to artisan workshops across Morocco. If
              something can be sourced or made, I'll tell you. If it can't, I'll tell you that
              too.
            </p>
          </div>
        </div>

        <aside className={styles.heroFactBand} aria-label="Trade program proof">
          {tradeFacts.map((fact) => (
            <div key={fact.label} className={styles.heroFactItem}>
              <p className={styles.heroFactLabel}>{fact.label}</p>
              <p className={styles.heroFactValue}>{fact.value}</p>
            </div>
          ))}
        </aside>
      </section>

      <section className={styles.sourcingSection}>
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>What I can source</p>
          <h2>Every Moroccan artisanal product</h2>
          <p className={styles.body}>
            Photographed on sourcing trips. This is where the pieces sit before they reach a
            specification.
          </p>
        </div>

        <div className={styles.sourcingStrip}>
          {sourcingScope.map((item) => (
            <figure key={item.publicId} className={styles.sourcingItem}>
              <div className={styles.sourcingFrame}>
                <Image
                  alt={item.alt}
                  className={styles.sourcingImage}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1376px) 32vw, 27rem"
                  src={sourcingImageUrl(item.publicId)}
                />
              </div>
              <figcaption className={styles.sourcingCaption}>
                <h3>{item.label}</h3>
                <p>{item.body}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className={styles.detailSection} aria-label="Trade support details">
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>What you receive</p>
          <h2>Practical support for real design projects</h2>
          <p className={styles.body}>
            From the first sourcing request to final shipment, we keep the process clear,
            flexible, and tailored to your project.
          </p>
        </div>

        <div className={styles.detailList}>
          {tradeDeliverables.map((item) => (
            <div key={item.title} className={styles.detailItem}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {tradeTestimonials.length > 0 ? (
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
      ) : null}

      <section className={styles.pricingBand} aria-labelledby="trade-pricing-heading">
        <div className={styles.pricingLayout}>
          <div className={styles.pricingCopy}>
            <p className={styles.eyebrow}>Trade pricing</p>
            <h2 id="trade-pricing-heading">
              Pricing is built around the project, not published as a list.
            </h2>
            <p className={styles.lede}>
              I work with interior designers on everything from a single custom rug to a full
              furnishing package, so one flat rate would be the wrong answer almost every time.
              Each project gets quoted on what it actually asks for.
            </p>
            <p className={styles.body}>
              Four things move the number. Send the brief and you get a figure you can put in
              front of a client.
            </p>
            <dl className={styles.pricingDrivers}>
              {pricingDrivers.map((driver) => (
                <div key={driver.label} className={styles.pricingDriver}>
                  <dt>{driver.label}</dt>
                  <dd>{driver.body}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className={styles.pricingMediaFrame}>
            <Image
              alt="A Moroccan sourcing room stacked with hand-woven rugs, poufs, and cushions"
              className={styles.pricingMediaImage}
              fill
              sizes="(max-width: 1100px) 100vw, 40rem"
              src={sourcingImageUrl("sourcing-souk-showroom")}
            />
          </div>
        </div>
      </section>

      <section className={styles.finalCta} data-final-cta>
        <div className={styles.finalCtaInner}>
          <div className={styles.finalCtaCopy}>
            <p className={styles.eyebrow}>Start here</p>
            <h2>What are you working on?</h2>
            <p className={styles.body}>
              One custom rug or a whole house, I would rather hear about it early. Rooms, sizes,
              timing, and budget direction are enough for me to come back with pieces and a quote.
            </p>
          </div>
          <div className={styles.contactActions}>
            <Link className={styles.primaryAction} href="/contact?inquiryType=trade-request">
              Start your inquiry
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

