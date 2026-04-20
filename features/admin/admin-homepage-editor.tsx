"use client";

import Image from "next/image";
import type { ChangeEvent } from "react";

import type { HomePageContent, HomePageImage, HomePageSectionKey } from "@/features/home/home-page-data";
import type { SeoAudit, UploadStatus } from "@/features/admin/admin-homepage-utils";
import {
  META_DESCRIPTION_MAX_LENGTH,
  META_DESCRIPTION_MIN_LENGTH,
  SEO_TITLE_MAX_LENGTH,
  SEO_TITLE_MIN_LENGTH,
} from "@/lib/seo/content-audit";

import styles from "./admin.module.css";

type FocusableElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

type SharedProps = {
  content: HomePageContent;
  onChange: (path: string, value: string | boolean) => void;
  registerField: (name: string) => (node: FocusableElement | null) => void;
};

export function GlobalSettingsEditor(props: SharedProps) {
  return (
    <div className={styles.stack}>
      <section className={styles.card}>
        <p className={styles.cardEyebrow}>Brand</p>
        <div className={styles.formGrid}>
          <TextField label="Logo text" name="brand.logoText" onChange={props.onChange} registerField={props.registerField} value={props.content.brand.logoText} />
          <TextField label="Tagline" name="brand.tagline" onChange={props.onChange} registerField={props.registerField} value={props.content.brand.tagline} />
          <TextField label="Logo image URL" name="brand.logoImageUrl" onChange={props.onChange} registerField={props.registerField} value={props.content.brand.logoImageUrl} />
          <TextField label="Logo image alt" name="brand.logoImageAlt" onChange={props.onChange} registerField={props.registerField} value={props.content.brand.logoImageAlt} />
        </div>
      </section>

      <section className={styles.card}>
        <p className={styles.cardEyebrow}>Page SEO</p>
        <div className={styles.formGrid}>
          <TextField helper={`Target ${SEO_TITLE_MIN_LENGTH} to ${SEO_TITLE_MAX_LENGTH} characters.`} label="Page title" name="pageSeo.title" onChange={props.onChange} registerField={props.registerField} value={props.content.pageSeo.title} />
          <TextAreaField helper={`Target ${META_DESCRIPTION_MIN_LENGTH} to ${META_DESCRIPTION_MAX_LENGTH} characters.`} label="Page description" name="pageSeo.description" onChange={props.onChange} registerField={props.registerField} rows={4} value={props.content.pageSeo.description} />
        </div>
      </section>
    </div>
  );
}

export function SectionEditor(props: SharedProps & {
  selectedSection: HomePageSectionKey;
  onVisibilityChange: (section: HomePageSectionKey, visible: boolean) => void;
  onImageChange: (path: string, image: HomePageImage) => void;
  onImageUpload: (path: string, file: File) => Promise<void>;
  score: SeoAudit;
  uploadStates: Record<string, UploadStatus>;
}) {
  const section = props.content[props.selectedSection];

  return (
    <div className={styles.stack}>
      <section className={styles.card}>
        <p className={styles.cardEyebrow}>Section controls</p>
        {props.selectedSection === "hero" ? <p className={styles.workspaceHelper}>The hero section is always shown on the homepage to prevent accidental removal while updating its image.</p> : <ToggleField checked={section.visible} label="Show section on homepage" onChange={(value) => props.onVisibilityChange(props.selectedSection, value)} />}
        <SeoAuditPanel audit={props.score} />
      </section>

      <section className={styles.card}>
        <p className={styles.cardEyebrow}>Section SEO</p>
        <div className={styles.formGrid}>
          <TextField helper={`Target ${SEO_TITLE_MIN_LENGTH} to ${SEO_TITLE_MAX_LENGTH} characters.`} label="SEO title override" name={`${props.selectedSection}.seo.seoTitle`} onChange={props.onChange} registerField={props.registerField} value={section.seo.seoTitle} />
          <TextAreaField helper={`Target ${META_DESCRIPTION_MIN_LENGTH} to ${META_DESCRIPTION_MAX_LENGTH} characters.`} label="Meta description override" name={`${props.selectedSection}.seo.metaDescription`} onChange={props.onChange} registerField={props.registerField} rows={4} value={section.seo.metaDescription} />
        </div>
      </section>

      {props.selectedSection === "hero" ? <HeroEditor {...props} /> : null}
      {props.selectedSection === "badges" ? <BadgesEditor {...props} /> : null}
      {props.selectedSection === "categories" ? <CategoriesEditor {...props} /> : null}
      {props.selectedSection === "brandStory" || props.selectedSection === "designDirection" ? <NarrativeEditor {...props} /> : null}
      {props.selectedSection === "featured" ? <FeaturedEditor {...props} /> : null}
      {props.selectedSection === "guide" ? <GuideEditor {...props} /> : null}
      {props.selectedSection === "newsletter" ? <NewsletterEditor {...props} /> : null}
      {props.selectedSection === "footer" ? <FooterEditor {...props} /> : null}
    </div>
  );
}

function HeroEditor(props: Parameters<typeof SectionEditor>[0]) {
  return <section className={styles.card}><p className={styles.cardEyebrow}>Hero content</p><div className={styles.groupPanel}><strong>How this section works</strong><p className={styles.workspaceHelper}>The fields below control the hero copy, CTAs, and hero image in the preview. Use the preview image to confirm the visual and the fields here to edit it.</p></div><div className={styles.formGrid}><TextField label="Hero eyebrow" name="hero.eyebrow" onChange={props.onChange} registerField={props.registerField} value={props.content.hero.eyebrow} /><TextField label="Hero title" name="hero.title" onChange={props.onChange} registerField={props.registerField} value={props.content.hero.title} /><TextAreaField label="Hero paragraph" name="hero.paragraph" onChange={props.onChange} registerField={props.registerField} rows={5} value={props.content.hero.paragraph} /></div><div className={styles.inlineGroup}><CtaEditor heading="Primary CTA" prefix="hero.primaryCta" button={props.content.hero.primaryCta} onChange={props.onChange} registerField={props.registerField} /><CtaEditor heading="Secondary CTA" prefix="hero.secondaryCta" button={props.content.hero.secondaryCta} onChange={props.onChange} registerField={props.registerField} /></div><ImageEditor label="Hero image" description="Controls the main image in the homepage hero section." image={props.content.hero.image} onImageChange={(image) => props.onImageChange("hero.image", image)} onImageUpload={props.onImageUpload} path="hero.image" registerField={props.registerField} uploadState={props.uploadStates["hero.image"]} /></section>;
}

function BadgesEditor(props: Parameters<typeof SectionEditor>[0]) {
  return <section className={styles.card}><p className={styles.cardEyebrow}>Value badges</p><div className={styles.stack}>{props.content.badges.items.map((item, index) => <div key={item.id} className={styles.groupPanel}><strong>Badge {index + 1}</strong><ToggleField checked={item.visible} label="Show badge" onChange={(value) => props.onChange(`badges.items.${index}.visible`, value)} /><TextField label="Label" name={`badges.items.${index}.label`} onChange={props.onChange} registerField={props.registerField} value={item.label} /></div>)}</div></section>;
}

function CategoriesEditor(props: Parameters<typeof SectionEditor>[0]) {
  return <section className={styles.card}><p className={styles.cardEyebrow}>Categories</p><div className={styles.formGrid}><TextField label="Eyebrow" name="categories.eyebrow" onChange={props.onChange} registerField={props.registerField} value={props.content.categories.eyebrow} /><TextField label="Title" name="categories.title" onChange={props.onChange} registerField={props.registerField} value={props.content.categories.title} /><TextAreaField label="Paragraph" name="categories.paragraph" onChange={props.onChange} registerField={props.registerField} rows={4} value={props.content.categories.paragraph} /></div><div className={styles.stack}>{props.content.categories.cards.map((card, index) => <div key={card.id} className={styles.groupPanel}><strong>Category card {index + 1}: {card.title || "Untitled card"}</strong><ToggleField checked={card.visible} label="Show card" onChange={(value) => props.onChange(`categories.cards.${index}.visible`, value)} /><div className={styles.formGrid}><TextField label="Title" name={`categories.cards.${index}.title`} onChange={props.onChange} registerField={props.registerField} value={card.title} /><TextField label="Link" name={`categories.cards.${index}.href`} onChange={props.onChange} registerField={props.registerField} value={card.href} /><TextAreaField label="Description" name={`categories.cards.${index}.description`} onChange={props.onChange} registerField={props.registerField} rows={3} value={card.description} /></div><ImageEditor label={`Homepage category card ${index + 1} image`} description={`Shown on the public homepage "${card.title || `category card ${index + 1}`}" card.`} image={card.image} onImageChange={(image) => props.onImageChange(`categories.cards.${index}.image`, image)} onImageUpload={props.onImageUpload} path={`categories.cards.${index}.image`} registerField={props.registerField} uploadState={props.uploadStates[`categories.cards.${index}.image`]} /></div>)}</div></section>;
}

function NarrativeEditor(props: Parameters<typeof SectionEditor>[0]) {
  const sectionKey = props.selectedSection as "brandStory" | "designDirection";
  const section = props.content[sectionKey];
  return <section className={styles.card}><p className={styles.cardEyebrow}>Editorial card</p><div className={styles.formGrid}><TextField label="Eyebrow" name={`${sectionKey}.eyebrow`} onChange={props.onChange} registerField={props.registerField} value={section.eyebrow} /><TextField label="Title" name={`${sectionKey}.title`} onChange={props.onChange} registerField={props.registerField} value={section.title} /><TextAreaField label="Paragraph" name={`${sectionKey}.paragraph`} onChange={props.onChange} registerField={props.registerField} rows={5} value={section.paragraph} /><TextField label="Link label" name={`${sectionKey}.linkLabel`} onChange={props.onChange} registerField={props.registerField} value={section.linkLabel} /><TextField label="Link" name={`${sectionKey}.href`} onChange={props.onChange} registerField={props.registerField} value={section.href} /></div></section>;
}

function FeaturedEditor(props: Parameters<typeof SectionEditor>[0]) {
  return <section className={styles.card}><p className={styles.cardEyebrow}>Featured collections</p><div className={styles.formGrid}><TextField label="Eyebrow" name="featured.eyebrow" onChange={props.onChange} registerField={props.registerField} value={props.content.featured.eyebrow} /><TextField label="Title" name="featured.title" onChange={props.onChange} registerField={props.registerField} value={props.content.featured.title} /><TextAreaField label="Paragraph" name="featured.paragraph" onChange={props.onChange} registerField={props.registerField} rows={4} value={props.content.featured.paragraph} /></div><div className={styles.stack}>{props.content.featured.cards.map((card, index) => <div key={card.id} className={styles.groupPanel}><strong>Featured card {index + 1}: {card.title || "Untitled card"}</strong><ToggleField checked={card.visible} label="Show card" onChange={(value) => props.onChange(`featured.cards.${index}.visible`, value)} /><div className={styles.formGrid}><TextField label="Small label" name={`featured.cards.${index}.eyebrow`} onChange={props.onChange} registerField={props.registerField} value={card.eyebrow || ""} /><TextField label="Title" name={`featured.cards.${index}.title`} onChange={props.onChange} registerField={props.registerField} value={card.title} /><TextField label="Link" name={`featured.cards.${index}.href`} onChange={props.onChange} registerField={props.registerField} value={card.href} /><TextField label="Commercial label" name={`featured.cards.${index}.priceLabel`} onChange={props.onChange} registerField={props.registerField} value={card.priceLabel || ""} /><TextAreaField label="Description" name={`featured.cards.${index}.description`} onChange={props.onChange} registerField={props.registerField} rows={3} value={card.description} /></div><ImageEditor label={`Featured card ${index + 1} image`} description={`Shown on the public "${card.title || `featured card ${index + 1}`}" card.`} image={card.image} onImageChange={(image) => props.onImageChange(`featured.cards.${index}.image`, image)} onImageUpload={props.onImageUpload} path={`featured.cards.${index}.image`} registerField={props.registerField} uploadState={props.uploadStates[`featured.cards.${index}.image`]} /></div>)}</div></section>;
}

function GuideEditor(props: Parameters<typeof SectionEditor>[0]) {
  return <section className={styles.card}><p className={styles.cardEyebrow}>Educational guide</p><div className={styles.formGrid}><TextField label="Eyebrow" name="guide.eyebrow" onChange={props.onChange} registerField={props.registerField} value={props.content.guide.eyebrow} /><TextField label="Title" name="guide.title" onChange={props.onChange} registerField={props.registerField} value={props.content.guide.title} /><TextAreaField label="Paragraph" name="guide.paragraph" onChange={props.onChange} registerField={props.registerField} rows={7} value={props.content.guide.paragraph} /></div></section>;
}

function NewsletterEditor(props: Parameters<typeof SectionEditor>[0]) {
  return <section className={styles.card}><p className={styles.cardEyebrow}>Newsletter block</p><div className={styles.formGrid}><TextField label="Eyebrow" name="newsletter.eyebrow" onChange={props.onChange} registerField={props.registerField} value={props.content.newsletter.eyebrow} /><TextField label="Title" name="newsletter.title" onChange={props.onChange} registerField={props.registerField} value={props.content.newsletter.title} /><TextAreaField label="Paragraph" name="newsletter.paragraph" onChange={props.onChange} registerField={props.registerField} rows={4} value={props.content.newsletter.paragraph} /><TextField label="Input label" name="newsletter.inputLabel" onChange={props.onChange} registerField={props.registerField} value={props.content.newsletter.inputLabel} /><TextField label="Input placeholder" name="newsletter.inputPlaceholder" onChange={props.onChange} registerField={props.registerField} value={props.content.newsletter.inputPlaceholder} /><TextField label="CTA label" name="newsletter.ctaLabel" onChange={props.onChange} registerField={props.registerField} value={props.content.newsletter.ctaLabel} /></div></section>;
}

function FooterEditor(props: Parameters<typeof SectionEditor>[0]) {
  return <section className={styles.card}><p className={styles.cardEyebrow}>Footer content</p><div className={styles.formGrid}><TextField label="Intro title" name="footer.introTitle" onChange={props.onChange} registerField={props.registerField} value={props.content.footer.introTitle} /><TextField label="Intro meta" name="footer.introMeta" onChange={props.onChange} registerField={props.registerField} value={props.content.footer.introMeta} /><TextAreaField label="Intro body" name="footer.introBody" onChange={props.onChange} registerField={props.registerField} rows={4} value={props.content.footer.introBody} /></div><LinkGroupEditor heading="Explore" headingName="footer.exploreHeading" headingValue={props.content.footer.exploreHeading} links={props.content.footer.exploreLinks} prefix="footer.exploreLinks" onChange={props.onChange} registerField={props.registerField} /><LinkGroupEditor heading="Support" headingName="footer.supportHeading" headingValue={props.content.footer.supportHeading} links={props.content.footer.supportLinks} prefix="footer.supportLinks" onChange={props.onChange} registerField={props.registerField} /><LinkGroupEditor heading="Collections" headingName="footer.collectionsHeading" headingValue={props.content.footer.collectionsHeading} links={props.content.footer.collectionLinks} prefix="footer.collectionLinks" onChange={props.onChange} registerField={props.registerField} /></section>;
}

function CtaEditor(props: { heading: string; prefix: string; button: HomePageContent["hero"]["primaryCta"]; onChange: SharedProps["onChange"]; registerField: SharedProps["registerField"]; }) {
  return <div className={styles.groupPanel}><strong>{props.heading}</strong><ToggleField checked={props.button.visible} label="Show CTA" onChange={(value) => props.onChange(`${props.prefix}.visible`, value)} /><TextField label="Label" name={`${props.prefix}.label`} onChange={props.onChange} registerField={props.registerField} value={props.button.label} /><TextField label="Link" name={`${props.prefix}.href`} onChange={props.onChange} registerField={props.registerField} value={props.button.href} /></div>;
}

function LinkGroupEditor(props: { heading: string; headingName: string; headingValue: string; prefix: string; links: HomePageContent["footer"]["exploreLinks"]; onChange: SharedProps["onChange"]; registerField: SharedProps["registerField"]; }) {
  return <div className={styles.groupPanel}><strong>{props.heading}</strong><TextField label="Group heading" name={props.headingName} onChange={props.onChange} registerField={props.registerField} value={props.headingValue} />{props.links.map((link, index) => <div key={`${props.prefix}-${index}`} className={styles.inlineGroup}><TextField label={`Link ${index + 1} label`} name={`${props.prefix}.${index}.label`} onChange={props.onChange} registerField={props.registerField} value={link.label} /><TextField label={`Link ${index + 1} href`} name={`${props.prefix}.${index}.href`} onChange={props.onChange} registerField={props.registerField} value={link.href} /></div>)}</div>;
}

function ImageEditor(props: { label: string; description?: string; path: string; image: HomePageImage; onImageChange: (image: HomePageImage) => void; onImageUpload: (path: string, file: File) => Promise<void>; registerField: SharedProps["registerField"]; uploadState?: UploadStatus; }) {
  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    await props.onImageUpload(props.path, file);
    event.target.value = "";
  }

  return <div className={styles.groupPanel}><strong>{props.label}</strong>{props.description ? <p className={styles.workspaceHelper}>{props.description}</p> : null}<div className={styles.homepageImageEditorGrid}><div className={styles.homepageImagePreviewFrame}>{isRenderableImageSrc(props.image.src) ? <Image alt={props.image.alt || "Homepage image preview"} fill sizes="220px" src={props.image.src} /> : <span className={styles.thumbnailFallback}>Add a valid image URL</span>}</div><div className={styles.stack}><TextField label="Public image URL" name={`${props.path}.src`} onChange={(_, value) => props.onImageChange({ ...props.image, src: String(value) })} registerField={props.registerField} value={props.image.src} /><TextField label="Public alt text" name={`${props.path}.alt`} onChange={(_, value) => props.onImageChange({ ...props.image, alt: String(value) })} registerField={props.registerField} value={props.image.alt} /><TextField label="Cloudinary public ID" name={`${props.path}.publicId`} onChange={(_, value) => props.onImageChange({ ...props.image, publicId: String(value) })} registerField={props.registerField} value={props.image.publicId} /><label className={styles.formField}><span>Replace image file</span><input accept="image/*" onChange={onFileChange} type="file" /></label>{props.uploadState?.message ? <p className={props.uploadState.status === "error" ? styles.homepageUploadError : styles.homepageUploadMessage}>{props.uploadState.message}</p> : null}</div></div></div>;
}

function SeoAuditPanel(props: { audit: SeoAudit }) {
  return <div className={styles.homepageSeoPanel}><div className={styles.homepageSeoPanelHeader}><strong>Internal SEO score</strong><span>{props.audit.score}/50</span></div><div className={styles.stack}>{props.audit.items.map((item) => <div key={item.id} className={styles.homepageSeoItem} data-passed={item.passed}><strong>{item.label}</strong><p>{item.detail}</p></div>)}</div></div>;
}

function TextField(props: { label: string; name: string; value: string; onChange: SharedProps["onChange"]; registerField: SharedProps["registerField"]; helper?: string; }) {
  return <label className={styles.formField}><span>{props.label}</span><input name={props.name} onChange={(event) => props.onChange(props.name, event.target.value)} ref={props.registerField(props.name)} type="text" value={props.value} />{props.helper ? <em>{props.helper}</em> : null}</label>;
}

function TextAreaField(props: { label: string; name: string; value: string; rows: number; onChange: SharedProps["onChange"]; registerField: SharedProps["registerField"]; helper?: string; }) {
  return <label className={styles.formField}><span>{props.label}</span><textarea name={props.name} onChange={(event) => props.onChange(props.name, event.target.value)} ref={props.registerField(props.name)} rows={props.rows} value={props.value} />{props.helper ? <em>{props.helper}</em> : null}</label>;
}

function ToggleField(props: { label: string; checked: boolean; onChange: (value: boolean) => void; }) {
  return <label className={styles.checkboxRow}><input checked={props.checked} onChange={(event) => props.onChange(event.target.checked)} type="checkbox" /><span>{props.label}</span></label>;
}


function isRenderableImageSrc(value: string) {
  if (value.startsWith('/')) {
    return true;
  }

  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' || parsed.protocol === 'data:';
  } catch {
    return false;
  }
}



