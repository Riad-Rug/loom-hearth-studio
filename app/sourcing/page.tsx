import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import styles from "@/features/content-pages/content-pages.module.css";
import { buildManagedMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildManagedMetadata({
    entityType: "static_page",
    entityKey: "sourcing",
    title: "Sourcing & Authenticity",
    description:
      "How Loom & Hearth Studio sources rugs, poufs, pillows, and decor in person across Morocco before pieces enter the collection.",
    path: "/sourcing",
  });
}

const sourcingChecks = [
  {
    eyebrow: "Sourcing approach",
    title: "Selected in Morocco through direct bazaar relationships.",
    body:
      "The collection is built through in-person sourcing in Marrakech and across Morocco. Pieces are not pulled from export catalogues or bought as generic stock. Each rug, pouf, pillow, or supporting object enters the site because it has been handled, assessed, and chosen directly.",
  },
  {
    eyebrow: "What gets checked",
    title: "Construction first, then colour, balance, and room presence.",
    body:
      "Selection starts with structure: pile density, knot read, warp tension, edge finish, and overall integrity. After that comes colour, proportion, and whether the piece actually holds a room without explanation.",
  },
] as const;

const sourcingProofs = [
  {
    eyebrow: "Process",
    title: "Handled directly in the bazaar.",
    body:
      "Rugs are opened, examined, and compared in person. That makes it possible to reject pieces that photograph well but do not have the weight, construction, or balance to justify their place in the collection.",
    imageSrc: "/about/sourcing-hands.png",
    imageAlt:
      "Hands examining a handcrafted Moroccan rug in the family bazaar, checking pile and edge detail.",
  },
  {
    eyebrow: "Authenticity",
    title: "Checked for structure, not just surface.",
    body:
      "The reverse, fringe, weave tension, and pile density matter as much as the visible face of the rug. These details are part of the sourcing decision before a listing is ever published.",
    imageSrc: "/about/rug-construction-detail.png",
    imageAlt:
      "Close-up of a Moroccan rug corner lifted by hand to show reverse weave, fringe, and pile density.",
  },
] as const;

const sourcingStandards = [
  "One-of-one rugs are chosen as exact pieces, not as representatives of a style batch.",
  "Rug-made poufs and pillows are selected for the same fibre and structural quality as the source textile.",
  "Listings are written from the real piece in hand, not from generic category language.",
] as const;

export default function SourcingPage() {
  return (
    <div className={styles.page}>
      <section className={`${styles.hero} ${styles.sourcingHero}`}>
        <div className={styles.sourcingHeroContent}>
          <p className={styles.eyebrow}>SOURCING & AUTHENTICITY</p>
          <h1>Sourced in person. Reviewed for construction before it enters the collection.</h1>
          <div className={styles.heroBody}>
            <p className={styles.lede}>
              Loom & Hearth Studio sources through direct family-bazaar relationships in Marrakech
              and through in-person buying across Morocco. The collection is built one piece at a
              time, with selection based on material quality, construction, and whether the piece
              holds up in a real room.
            </p>
            <p className={styles.lede}>
              That means checking the reverse, the fringe, the tension of the weave, the pile, and
              the balance of the palette before anything reaches the site. The goal is not to list
              everything available. It is to publish a smaller collection that can be defended on
              sourcing and quality.
            </p>
          </div>
          <div className={styles.contactActions}>
            <Link className={styles.primaryAction} href="/contact">
              Ask a sourcing question
            </Link>
            <Link className={styles.secondaryAction} href="/about">
              Read the studio story
            </Link>
          </div>
        </div>

        <div className={styles.sourcingHeroMedia}>
          <Image
            alt="Rugs displayed floor-to-ceiling in the family bazaar setting in Marrakech, with layered woven pieces and warm souk light."
            className={styles.sourcingHeroImage}
            fill
            priority
            sizes="(max-width: 1100px) 100vw, 50vw"
            src="/about/marrakech-bazaar-hero.png"
          />
          <div className={styles.sourcingHeroCaption}>
            <p className={styles.eyebrow}>Marrakech bazaar context</p>
            <p>Selection starts with what is physically handled and verified in person.</p>
          </div>
        </div>
      </section>

      <section className={styles.twoColumn}>
        {sourcingChecks.map((section) => (
          <article key={section.title} className={styles.card}>
            <p className={styles.eyebrow}>{section.eyebrow}</p>
            <h2>{section.title}</h2>
            <div className={styles.cardBody}>
              <p>{section.body}</p>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.aboutSupportSection}>
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>What the process looks like</p>
          <h2>Documentation starts with handling the piece, not styling the room.</h2>
          <p className={styles.body}>
            These details are part of the sourcing decision itself: direct handling, close
            inspection, and construction review before a piece is written into the collection.
          </p>
        </div>

        <div className={styles.aboutSupportGrid}>
          {sourcingProofs.map((item) => (
            <article key={item.title} className={styles.aboutSupportCard}>
              <div className={styles.aboutSupportMedia}>
                <Image
                  alt={item.imageAlt}
                  className={styles.proofImage}
                  fill
                  sizes="(max-width: 1100px) 100vw, 50vw"
                  src={item.imageSrc}
                />
              </div>
              <div className={styles.aboutSupportBody}>
                <p className={styles.eyebrow}>{item.eyebrow}</p>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.sectionHeader}>
        <p className={styles.eyebrow}>Collection standard</p>
        <h2>What this means for the pieces you actually see on the site.</h2>
        <div className={styles.heroBody}>
          {sourcingStandards.map((item) => (
            <p key={item} className={styles.body}>
              {item}
            </p>
          ))}
        </div>
      </section>

      <section className={styles.aboutExit}>
        <div className={styles.aboutExitBody}>
          <p className={styles.eyebrow}>Continue</p>
          <h2>Browse the collection, or use the trade route if sourcing detail matters to your project.</h2>
          <p className={styles.body}>
            Retail buyers can move into the collection directly. Interior designers and project
            teams can use the trade programme for holds, coordination, and sourcing support before
            checkout.
          </p>
          <div className={styles.policyActions}>
            <Link className={styles.primaryAction} href="/shop">
              Browse the collection
            </Link>
            <Link className={styles.secondaryAction} href="/trade">
              View the trade programme
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
