export type BlogPostSeoEditableField =
  | "title"
  | "slug"
  | "status"
  | "targetKeyword"
  | "seoTitle"
  | "seoDescription"
  | "images"
  | "excerpt"
  | "body";

export type BlogPostSeoAuditableFields = {
  title: string;
  slug: string;
  targetKeyword: string;
  seoTitle: string;
  seoDescription: string;
  images: { id: string; src: string; alt: string }[];
  body: string;
};

export type BlogPostSeoChecklistItem = {
  id: string;
  label: string;
  detail: string;
  points: number;
  passed: boolean;
  field: BlogPostSeoEditableField;
};

export type BlogPostSeoAudit = {
  score: number;
  checklist: BlogPostSeoChecklistItem[];
  recommendations: string[];
  wordCount: number;
  internalLinksFound: number;
  metaDescriptionLength: number;
};

export function createBlogPostSeoAudit(post: BlogPostSeoAuditableFields): BlogPostSeoAudit {
  const normalizedKeyword = normalizeText(post.targetKeyword);
  const normalizedTitle = normalizeText(post.title);
  const normalizedSeoTitle = normalizeText(post.seoTitle);
  const normalizedSlug = normalizeText(post.slug.replaceAll("-", " "));
  const wordCount = countWords(post.body);
  const internalLinksFound = countInternalLinkSignals(post.body);
  const metaDescriptionLength = post.seoDescription.trim().length;
  const seoTitleLength = post.seoTitle.trim().length;
  const keywordInTitle = normalizedKeyword ? normalizedTitle.includes(normalizedKeyword) : false;
  const keywordInSlug = normalizedKeyword ? normalizedSlug.includes(normalizedKeyword) : false;
  const metaDescriptionReady =
    metaDescriptionLength >= 120 && metaDescriptionLength <= 160;
  const seoTitleReady = seoTitleLength >= 45 && seoTitleLength <= 65;
  const h1TitleAlignment =
    Boolean(normalizedSeoTitle) &&
    (normalizedSeoTitle.includes(normalizedTitle) || normalizedTitle.includes(normalizedKeyword));
  const contentLengthReady = wordCount >= 350;
  const internalLinkReady = internalLinksFound > 0;
  const heroImageAlt = post.images[0]?.alt ?? "";
  const imageAltReady = heroImageAlt.trim().length >= 24;

  const checklist: BlogPostSeoChecklistItem[] = [
    {
      id: "keyword-title",
      label: "Keyword in title",
      detail: keywordInTitle
        ? `Target keyword "${post.targetKeyword}" is present in the H1.`
        : `Target keyword "${post.targetKeyword}" is missing from the article title.`,
      points: 15,
      passed: keywordInTitle,
      field: "title",
    },
    {
      id: "keyword-slug",
      label: "Keyword in slug",
      detail: keywordInSlug
        ? `Slug supports the target phrase: /${post.slug}`
        : `Slug does not clearly include the target phrase: /${post.slug}`,
      points: 10,
      passed: keywordInSlug,
      field: "slug",
    },
    {
      id: "seo-title",
      label: "SEO title readiness",
      detail: seoTitleReady
        ? `SEO title length is ${seoTitleLength} characters.`
        : `SEO title length is ${seoTitleLength} characters; target 45 to 65.`,
      points: 15,
      passed: seoTitleReady,
      field: "seoTitle",
    },
    {
      id: "meta-description",
      label: "Meta description readiness",
      detail: metaDescriptionReady
        ? `Meta description length is ${metaDescriptionLength} characters.`
        : `Meta description length is ${metaDescriptionLength} characters; target 120 to 160.`,
      points: 15,
      passed: metaDescriptionReady,
      field: "seoDescription",
    },
    {
      id: "h1-alignment",
      label: "H1 and SEO title alignment",
      detail: h1TitleAlignment
        ? "The SEO title still reflects the article H1."
        : "The SEO title drifts away from the article H1.",
      points: 10,
      passed: h1TitleAlignment,
      field: "seoTitle",
    },
    {
      id: "word-count",
      label: "Content length",
      detail: contentLengthReady
        ? `Body contains ${wordCount} words.`
        : `Body contains ${wordCount} words; target at least 350.`,
      points: 15,
      passed: contentLengthReady,
      field: "body",
    },
    {
      id: "internal-links",
      label: "Internal-link readiness",
      detail: internalLinkReady
        ? `${internalLinksFound} internal route reference(s) found in the draft body.`
        : "No internal route reference found in the current draft body.",
      points: 10,
      passed: internalLinkReady,
      field: "body",
    },
    {
      id: "image-alt",
      label: "Hero image alt text",
      detail: imageAltReady
        ? "Hero image alt text is present and descriptive."
        : "Hero image alt text is missing or too thin to be useful.",
      points: 10,
      passed: imageAltReady,
      field: "images",
    },
  ];

  const recommendations = checklist
    .filter((item) => !item.passed)
    .map((item) => {
      if (item.id === "meta-description") {
        return "Update meta: rewrite the description to land closer to 120 to 160 characters.";
      }

      if (item.id === "keyword-title") {
        return "Fix SEO: bring the target keyword into the title without making it read unnaturally.";
      }

      if (item.id === "keyword-slug") {
        return "Fix SEO: tighten the slug so it reflects the target phrase more directly.";
      }

      if (item.id === "image-alt") {
        return "Fix SEO: make the hero image alt text more descriptive for the current article.";
      }

      if (item.id === "word-count") {
        return "Improve content: expand the article body with more concrete editorial detail.";
      }

      if (item.id === "internal-links") {
        return "Improve content: add at least one internal Loom & Hearth route reference in the body.";
      }

      if (item.id === "seo-title") {
        return "Update meta: rewrite the SEO title into a stronger 45 to 65 character range.";
      }

      return "Fix SEO: keep the SEO title aligned with the article H1.";
    });

  return {
    score: checklist.reduce(
      (total, item) => total + (item.passed ? item.points : 0),
      0,
    ),
    checklist,
    recommendations,
    wordCount,
    internalLinksFound,
    metaDescriptionLength,
  };
}

function countWords(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function countInternalLinkSignals(value: string) {
  const matches =
    value.match(/\/blog\/|\/products\/|href=|https?:\/\/[^ ]*loom|]\(\/[a-z]/gi) ?? [];

  return matches.length;
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}
