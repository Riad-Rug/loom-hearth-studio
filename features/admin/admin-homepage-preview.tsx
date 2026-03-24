"use client";

import Image from "next/image";

import { homepageSectionDefinitions, type HomePageContent, type HomePageImage, type HomePageSectionKey } from "@/features/home/home-page-data";

import styles from "./admin.module.css";

type HomepagePreviewProps = {
  content: HomePageContent;
  selectedSection: HomePageSectionKey | null;
  onSelect: (section: HomePageSectionKey, field?: string) => void;
};

export function HomepagePreview({ content, selectedSection, onSelect }: HomepagePreviewProps) {
  return (
    <div className={styles.homepagePreviewSurface}>
      <PreviewSection active={selectedSection === "hero"} hidden={!content.hero.visible} title={homepageSectionDefinitions.hero.label} onSelect={() => onSelect("hero")}>
        <div className={styles.homepagePreviewHero}>
          <div className={styles.stack}>
            <PreviewChip label={content.hero.eyebrow} onClick={() => onSelect("hero", "hero.eyebrow")} />
            <PreviewHeadline label={content.hero.title} onClick={() => onSelect("hero", "hero.title")} />
            <PreviewBody label={content.hero.paragraph} onClick={() => onSelect("hero", "hero.paragraph")} />
            <div className={styles.actionRow}>
              {content.hero.primaryCta.visible ? <PreviewAction label={content.hero.primaryCta.label} onClick={() => onSelect("hero", "hero.primaryCta.label")} primary /> : null}
              {content.hero.secondaryCta.visible ? <PreviewAction label={content.hero.secondaryCta.label} onClick={() => onSelect("hero", "hero.secondaryCta.label")} /> : null}
            </div>
          </div>
          <PreviewImage image={content.hero.image} onClick={() => onSelect("hero", "hero.image.alt")} />
        </div>
      </PreviewSection>

      <PreviewSection active={selectedSection === "badges"} hidden={!content.badges.visible} title={homepageSectionDefinitions.badges.label} onSelect={() => onSelect("badges")}>
        <div className={styles.homepagePreviewBadgeRow}>
          {content.badges.items.map((item, index) =>
            item.visible ? <PreviewBadge key={item.id} label={item.label} onClick={() => onSelect("badges", `badges.items.${index}.label`)} /> : null,
          )}
        </div>
      </PreviewSection>

      <PreviewSection active={selectedSection === "categories"} hidden={!content.categories.visible} title={homepageSectionDefinitions.categories.label} onSelect={() => onSelect("categories")}>
        <PreviewChip label={content.categories.eyebrow} onClick={() => onSelect("categories", "categories.eyebrow")} />
        <PreviewHeadline compact label={content.categories.title} onClick={() => onSelect("categories", "categories.title")} />
        <PreviewBody label={content.categories.paragraph} onClick={() => onSelect("categories", "categories.paragraph")} />
        <div className={styles.homepagePreviewCardGridFive}>
          {content.categories.cards.map((card, index) =>
            card.visible ? (
              <PreviewCard
                key={card.id}
                card={card}
                onImageClick={() => onSelect("categories", `categories.cards.${index}.image.alt`)}
                onTextClick={() => onSelect("categories", `categories.cards.${index}.title`)}
              />
            ) : null,
          )}
        </div>
      </PreviewSection>

      <PreviewSection active={selectedSection === "brandStory" || selectedSection === "designDirection"} hidden={!content.brandStory.visible && !content.designDirection.visible} title="Editorial pair" onSelect={() => onSelect(content.brandStory.visible ? "brandStory" : "designDirection")}>
        <div className={styles.homepagePreviewNarrativeGrid}>
          {content.brandStory.visible ? <PreviewNarrative section={content.brandStory} onClick={() => onSelect("brandStory", "brandStory.title")} /> : null}
          {content.designDirection.visible ? <PreviewNarrative section={content.designDirection} onClick={() => onSelect("designDirection", "designDirection.title")} /> : null}
        </div>
      </PreviewSection>

      <PreviewSection active={selectedSection === "featured"} hidden={!content.featured.visible} title={homepageSectionDefinitions.featured.label} onSelect={() => onSelect("featured")}>
        <PreviewChip label={content.featured.eyebrow} onClick={() => onSelect("featured", "featured.eyebrow")} />
        <PreviewHeadline compact label={content.featured.title} onClick={() => onSelect("featured", "featured.title")} />
        <PreviewBody label={content.featured.paragraph} onClick={() => onSelect("featured", "featured.paragraph")} />
        <div className={styles.homepagePreviewCardGridThree}>
          {content.featured.cards.map((card, index) =>
            card.visible ? (
              <PreviewCard
                key={card.id}
                card={card}
                onImageClick={() => onSelect("featured", `featured.cards.${index}.image.alt`)}
                onTextClick={() => onSelect("featured", `featured.cards.${index}.title`)}
              />
            ) : null,
          )}
        </div>
      </PreviewSection>

      <PreviewSection active={selectedSection === "guide" || selectedSection === "newsletter"} hidden={!content.guide.visible && !content.newsletter.visible} title="Guide and newsletter" onSelect={() => onSelect(content.guide.visible ? "guide" : "newsletter")}>
        <div className={styles.homepagePreviewEditorialGrid}>
          {content.guide.visible ? (
            <div className={styles.homepagePreviewEditorialCard}>
              <PreviewChip label={content.guide.eyebrow} onClick={() => onSelect("guide", "guide.eyebrow")} />
              <PreviewHeadline compact label={content.guide.title} onClick={() => onSelect("guide", "guide.title")} />
              <PreviewBody label={content.guide.paragraph} onClick={() => onSelect("guide", "guide.paragraph")} />
            </div>
          ) : null}
          {content.newsletter.visible ? (
            <div className={styles.homepagePreviewEditorialCard}>
              <PreviewChip label={content.newsletter.eyebrow} onClick={() => onSelect("newsletter", "newsletter.eyebrow")} />
              <PreviewHeadline compact label={content.newsletter.title} onClick={() => onSelect("newsletter", "newsletter.title")} />
              <PreviewBody label={content.newsletter.paragraph} onClick={() => onSelect("newsletter", "newsletter.paragraph")} />
              <div className={styles.homepagePreviewNewsletterForm}>
                <button className={styles.homepagePreviewInput} onClick={() => onSelect("newsletter", "newsletter.inputPlaceholder")} type="button">
                  {content.newsletter.inputPlaceholder}
                </button>
                <PreviewAction label={content.newsletter.ctaLabel} onClick={() => onSelect("newsletter", "newsletter.ctaLabel")} primary />
              </div>
            </div>
          ) : null}
        </div>
      </PreviewSection>

      <PreviewSection active={selectedSection === "footer"} hidden={!content.footer.visible} title={homepageSectionDefinitions.footer.label} onSelect={() => onSelect("footer")}>
        <div className={styles.homepagePreviewFooterGrid}>
          <div className={styles.homepagePreviewFooterIntro}>
            <PreviewChip label={content.footer.introTitle} onClick={() => onSelect("footer", "footer.introTitle")} />
            <PreviewBody label={content.footer.introBody} onClick={() => onSelect("footer", "footer.introBody")} />
            <PreviewBody label={content.footer.introMeta} onClick={() => onSelect("footer", "footer.introMeta")} subtle />
          </div>
          <PreviewLinkGroup heading={content.footer.exploreHeading} items={content.footer.exploreLinks} onClick={() => onSelect("footer", "footer.exploreHeading")} />
          <PreviewLinkGroup heading={content.footer.supportHeading} items={content.footer.supportLinks} onClick={() => onSelect("footer", "footer.supportHeading")} />
          <PreviewLinkGroup heading={content.footer.collectionsHeading} items={content.footer.collectionLinks} onClick={() => onSelect("footer", "footer.collectionsHeading")} />
        </div>
      </PreviewSection>
    </div>
  );
}

function PreviewSection(props: { title: string; active: boolean; hidden: boolean; onSelect: () => void; children: React.ReactNode }) {
  return (
    <section className={`${styles.homepagePreviewSection} ${props.active ? styles.homepagePreviewSectionActive : ""} ${props.hidden ? styles.homepagePreviewSectionHidden : ""}`}>
      <div className={styles.homepagePreviewSectionHeader}>
        <div className={styles.homepagePreviewSectionTitle}><strong>{props.title}</strong><span>Preview click targets</span></div>
        <button className={styles.inlineActionLink} onClick={props.onSelect} type="button">Edit section</button>
      </div>
      {props.children}
    </section>
  );
}

function PreviewChip(props: { label: string; onClick: () => void }) {
  return <button className={styles.homepagePreviewChip} onClick={props.onClick} type="button">{props.label}</button>;
}

function PreviewHeadline(props: { label: string; onClick: () => void; compact?: boolean }) {
  return <button className={`${styles.homepagePreviewHeadline} ${props.compact ? styles.homepagePreviewHeadlineCompact : ""}`} onClick={props.onClick} type="button">{props.label}</button>;
}

function PreviewBody(props: { label: string; onClick: () => void; subtle?: boolean }) {
  return <button className={`${styles.homepagePreviewBody} ${props.subtle ? styles.homepagePreviewBodySubtle : ""}`} onClick={props.onClick} type="button">{props.label}</button>;
}

function PreviewAction(props: { label: string; onClick: () => void; primary?: boolean }) {
  return <button className={`${styles.homepagePreviewAction} ${props.primary ? styles.homepagePreviewActionPrimary : ""}`} onClick={props.onClick} type="button">{props.label}</button>;
}

function PreviewBadge(props: { label: string; onClick: () => void }) {
  return <button className={styles.homepagePreviewBadge} onClick={props.onClick} type="button">{props.label}</button>;
}

function PreviewImage(props: { image: HomePageImage; onClick: () => void }) {
  return <button className={styles.homepagePreviewImageFrame} onClick={props.onClick} type="button"><span className={styles.homepagePreviewImageBadge}>Edit image</span>{isRenderableImageSrc(props.image.src) ? <Image alt={props.image.alt || "Homepage preview image"} fill sizes="240px" src={props.image.src} /> : <span className={styles.thumbnailFallback}>Add a valid image URL</span>}</button>;
}

function PreviewCard(props: { card: HomePageContent["categories"]["cards"][number]; onTextClick: () => void; onImageClick: () => void }) {
  return (
    <article className={styles.homepagePreviewCard}>
      <PreviewImage image={props.card.image} onClick={props.onImageClick} />
      <PreviewHeadline compact label={props.card.title} onClick={props.onTextClick} />
      <PreviewBody label={props.card.description} onClick={props.onTextClick} />
    </article>
  );
}

function PreviewNarrative(props: { section: HomePageContent["brandStory"]; onClick: () => void }) {
  return <button className={styles.homepagePreviewNarrativeCard} onClick={props.onClick} type="button"><span>{props.section.eyebrow}</span><strong>{props.section.title}</strong><p>{props.section.paragraph}</p><em>{props.section.linkLabel}</em></button>;
}

function PreviewLinkGroup(props: { heading: string; items: HomePageContent["footer"]["exploreLinks"]; onClick: () => void }) {
  return <button className={styles.homepagePreviewLinkGroup} onClick={props.onClick} type="button"><strong>{props.heading}</strong>{props.items.map((item) => <span key={`${props.heading}-${item.href}`}>{item.label}</span>)}</button>;
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




