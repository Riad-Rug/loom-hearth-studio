"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  initialAdminHomepageActionState,
  type AdminHomepageActionState,
} from "@/lib/admin/homepage-actions-shared";
import type { HomePageContent } from "@/features/home/home-page-data";
import { updateAdminHomepageAction } from "@/app/(admin)/admin/homepage/actions";

import styles from "./admin.module.css";

type AdminHomepageFormProps = {
  initialContent: HomePageContent;
  source: "database" | "defaults";
};

export function AdminHomepageForm({ initialContent, source }: AdminHomepageFormProps) {
  const [state, formAction] = useActionState<AdminHomepageActionState, FormData>(
    updateAdminHomepageAction,
    initialAdminHomepageActionState,
  );

  return (
    <form className={styles.productForm} action={formAction}>
      <header className={styles.moduleHeader}>
        <p className={styles.eyebrow}>Admin homepage</p>
        <h2>Homepage manager</h2>
        <p>
          Edit the homepage, brand presentation, newsletter block, and footer content from one
          admin surface.
        </p>
      </header>

      <div className={styles.dashboardStatusBar}>
        <span className={styles.statusPill}>
          Source: {source === "database" ? "Persisted homepage record" : "Default in-repo fallback"}
        </span>
        <span className={styles.statusPill}>Image URLs: Cloudinary, Pexels, Unsplash</span>
        <span className={styles.statusPill}>Links: internal paths or HTTPS URLs</span>
      </div>

      {state.message ? (
        <div className={state.status === "success" ? styles.successPanel : styles.gatePanel}>
          <strong>{state.status === "success" ? "Saved" : "Needs attention"}</strong>
          <p>{state.message}</p>
        </div>
      ) : null}

      <div className={styles.stack}>
        <section className={styles.card}>
          <p className={styles.cardEyebrow}>Brand / header</p>
          <h3>Identity</h3>
          <p>Use text only, or set a supported logo image URL and keep text as the fallback name.</p>
          <div className={styles.formGrid}>
            <TextField label="Logo text" name="brand.logoText" defaultValue={initialContent.brand.logoText} />
            <TextField label="Tagline" name="brand.tagline" defaultValue={initialContent.brand.tagline} />
            <TextField label="Logo image URL" name="brand.logoImageUrl" defaultValue={initialContent.brand.logoImageUrl} />
            <TextField label="Logo image alt" name="brand.logoImageAlt" defaultValue={initialContent.brand.logoImageAlt} />
          </div>
        </section>

        <section className={styles.card}>
          <p className={styles.cardEyebrow}>Hero</p>
          <h3>Homepage hero</h3>
          <div className={styles.formGrid}>
            <TextField label="Eyebrow" name="hero.eyebrow" defaultValue={initialContent.hero.eyebrow} />
            <TextField label="Title" name="hero.title" defaultValue={initialContent.hero.title} />
            <TextAreaField label="Paragraph" name="hero.paragraph" defaultValue={initialContent.hero.paragraph} rows={5} />
            <div className={styles.stack}>
              <div className={styles.inlineGroup}>
                <TextField label="Primary CTA label" name="hero.primaryCtaLabel" defaultValue={initialContent.hero.primaryCtaLabel} />
                <TextField label="Primary CTA link" name="hero.primaryCtaLink" defaultValue={initialContent.hero.primaryCtaLink} />
              </div>
              <div className={styles.inlineGroup}>
                <TextField label="Secondary CTA label" name="hero.secondaryCtaLabel" defaultValue={initialContent.hero.secondaryCtaLabel} />
                <TextField label="Secondary CTA link" name="hero.secondaryCtaLink" defaultValue={initialContent.hero.secondaryCtaLink} />
              </div>
              <TextField label="Hero image URL" name="hero.imageSrc" defaultValue={initialContent.hero.imageSrc} />
              <TextField label="Hero image alt" name="hero.imageAlt" defaultValue={initialContent.hero.imageAlt} />
            </div>
          </div>
        </section>

        <section className={styles.card}>
          <p className={styles.cardEyebrow}>Trust / info row</p>
          <h3>Four supporting highlights</h3>
          <div className={styles.formGrid}>
            {initialContent.trustItems.map((item, index) => (
              <TextField key={index} label={`Item ${index + 1}`} name={`trustItems.${index}`} defaultValue={item} />
            ))}
          </div>
        </section>

        <section className={styles.card}>
          <p className={styles.cardEyebrow}>Categories</p>
          <h3>Category cards</h3>
          <div className={styles.stack}>
            <div className={styles.formGrid}>
              <TextField label="Section eyebrow" name="categoriesSection.eyebrow" defaultValue={initialContent.categoriesSection.eyebrow} />
              <TextField label="Section title" name="categoriesSection.title" defaultValue={initialContent.categoriesSection.title} />
              <TextAreaField label="Section paragraph" name="categoriesSection.paragraph" defaultValue={initialContent.categoriesSection.paragraph} rows={4} />
            </div>
            {initialContent.categoriesSection.cards.map((card, index) => (
              <div key={card.title} className={styles.groupPanel}>
                <strong>Category card {index + 1}</strong>
                <div className={styles.formGrid}>
                  <TextField label="Title" name={`categoriesSection.cards.${index}.title`} defaultValue={card.title} />
                  <TextField label="Link" name={`categoriesSection.cards.${index}.href`} defaultValue={card.href} />
                  <TextAreaField label="Description" name={`categoriesSection.cards.${index}.description`} defaultValue={card.description} rows={3} />
                  <div className={styles.stack}>
                    <TextField label="Image URL" name={`categoriesSection.cards.${index}.imageSrc`} defaultValue={card.imageSrc} />
                    <TextField label="Image alt" name={`categoriesSection.cards.${index}.imageAlt`} defaultValue={card.imageAlt} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.card}>
          <p className={styles.cardEyebrow}>Brand story and design direction</p>
          <h3>Editorial pair</h3>
          <div className={styles.formGrid}>
            <NarrativeFields prefix="brandStory" heading="Brand story" section={initialContent.brandStory} />
            <NarrativeFields prefix="designDirection" heading="Design direction" section={initialContent.designDirection} />
          </div>
        </section>

        <section className={styles.card}>
          <p className={styles.cardEyebrow}>Featured directions</p>
          <h3>Featured cards</h3>
          <div className={styles.stack}>
            <div className={styles.formGrid}>
              <TextField label="Section eyebrow" name="featuredDirections.eyebrow" defaultValue={initialContent.featuredDirections.eyebrow} />
              <TextField label="Section title" name="featuredDirections.title" defaultValue={initialContent.featuredDirections.title} />
              <TextAreaField label="Section intro" name="featuredDirections.intro" defaultValue={initialContent.featuredDirections.intro} rows={4} />
            </div>
            {initialContent.featuredDirections.cards.map((card, index) => (
              <div key={card.title} className={styles.groupPanel}>
                <strong>Featured card {index + 1}</strong>
                <div className={styles.formGrid}>
                  <TextField label="Title" name={`featuredDirections.cards.${index}.title`} defaultValue={card.title} />
                  <TextField label="Link" name={`featuredDirections.cards.${index}.href`} defaultValue={card.href} />
                  <TextAreaField label="Description" name={`featuredDirections.cards.${index}.description`} defaultValue={card.description} rows={3} />
                  <div className={styles.stack}>
                    <TextField label="Image URL" name={`featuredDirections.cards.${index}.imageSrc`} defaultValue={card.imageSrc} />
                    <TextField label="Image alt" name={`featuredDirections.cards.${index}.imageAlt`} defaultValue={card.imageAlt} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.card}>
          <p className={styles.cardEyebrow}>Moroccan rugs guide</p>
          <h3>Guide copy</h3>
          <div className={styles.formGrid}>
            <TextField label="Eyebrow" name="moroccanRugsGuide.eyebrow" defaultValue={initialContent.moroccanRugsGuide.eyebrow} />
            <TextField label="Title" name="moroccanRugsGuide.title" defaultValue={initialContent.moroccanRugsGuide.title} />
            <TextAreaField label="Paragraph" name="moroccanRugsGuide.paragraph" defaultValue={initialContent.moroccanRugsGuide.paragraph} rows={6} />
          </div>
        </section>

        <section className={styles.card}>
          <p className={styles.cardEyebrow}>Newsletter</p>
          <h3>Signup block</h3>
          <div className={styles.formGrid}>
            <TextField label="Eyebrow" name="newsletter.eyebrow" defaultValue={initialContent.newsletter.eyebrow} />
            <TextField label="Title" name="newsletter.title" defaultValue={initialContent.newsletter.title} />
            <TextAreaField label="Paragraph" name="newsletter.paragraph" defaultValue={initialContent.newsletter.paragraph} rows={4} />
            <div className={styles.stack}>
              <TextField label="Input label" name="newsletter.inputLabel" defaultValue={initialContent.newsletter.inputLabel} />
              <TextField label="Input placeholder" name="newsletter.inputPlaceholder" defaultValue={initialContent.newsletter.inputPlaceholder} />
              <TextField label="CTA label" name="newsletter.ctaLabel" defaultValue={initialContent.newsletter.ctaLabel} />
            </div>
          </div>
        </section>

        <section className={styles.card}>
          <p className={styles.cardEyebrow}>Footer</p>
          <h3>Footer content and links</h3>
          <div className={styles.stack}>
            <div className={styles.formGrid}>
              <TextField label="Intro title" name="footer.introTitle" defaultValue={initialContent.footer.introTitle} />
              <TextField label="Intro meta" name="footer.introMeta" defaultValue={initialContent.footer.introMeta} />
              <TextAreaField label="Intro body" name="footer.introBody" defaultValue={initialContent.footer.introBody} rows={4} />
            </div>
            <LinkGroupFields heading="Explore links" prefix="footer.exploreLinks" headingName="footer.exploreHeading" headingValue={initialContent.footer.exploreHeading} links={initialContent.footer.exploreLinks} />
            <LinkGroupFields heading="Support links" prefix="footer.supportLinks" headingName="footer.supportHeading" headingValue={initialContent.footer.supportHeading} links={initialContent.footer.supportLinks} />
            <LinkGroupFields heading="Collections links" prefix="footer.collectionLinks" headingName="footer.collectionsHeading" headingValue={initialContent.footer.collectionsHeading} links={initialContent.footer.collectionLinks} />
          </div>
        </section>
      </div>

      <div className={styles.actionRow}>
        <SubmitButton />
      </div>
    </form>
  );
}

function TextField(props: { label: string; name: string; defaultValue: string }) {
  return (
    <label className={styles.formField}>
      <span>{props.label}</span>
      <input defaultValue={props.defaultValue} name={props.name} type="text" />
    </label>
  );
}

function TextAreaField(props: { label: string; name: string; defaultValue: string; rows: number }) {
  return (
    <label className={styles.formField}>
      <span>{props.label}</span>
      <textarea defaultValue={props.defaultValue} name={props.name} rows={props.rows} />
    </label>
  );
}

function NarrativeFields(props: {
  prefix: string;
  heading: string;
  section: HomePageContent["brandStory"];
}) {
  return (
    <div className={styles.groupPanel}>
      <strong>{props.heading}</strong>
      <div className={styles.stack}>
        <TextField label="Eyebrow" name={`${props.prefix}.eyebrow`} defaultValue={props.section.eyebrow} />
        <TextField label="Title" name={`${props.prefix}.title`} defaultValue={props.section.title} />
        <TextAreaField label="Paragraph" name={`${props.prefix}.paragraph`} defaultValue={props.section.paragraph} rows={5} />
        <TextField label="Link" name={`${props.prefix}.href`} defaultValue={props.section.href} />
      </div>
    </div>
  );
}

function LinkGroupFields(props: {
  heading: string;
  headingName: string;
  headingValue: string;
  prefix: string;
  links: HomePageContent["footer"]["exploreLinks"];
}) {
  return (
    <div className={styles.groupPanel}>
      <strong>{props.heading}</strong>
      <div className={styles.stack}>
        <TextField label="Group heading" name={props.headingName} defaultValue={props.headingValue} />
        {props.links.map((link, index) => (
          <div key={`${props.prefix}-${index}`} className={styles.inlineGroup}>
            <TextField label={`Link ${index + 1} label`} name={`${props.prefix}.${index}.label`} defaultValue={link.label} />
            <TextField label={`Link ${index + 1} href`} name={`${props.prefix}.${index}.href`} defaultValue={link.href} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className={`${styles.inlineActionLink} ${styles.inlineActionLinkPrimary}`} type="submit">
      {pending ? "Saving homepage..." : "Save homepage"}
    </button>
  );
}
