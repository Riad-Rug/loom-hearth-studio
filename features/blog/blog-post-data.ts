import type { BlogPost } from "@/types/domain";

type PlaceholderBlogPost = BlogPost & {
  categoryLabel: string;
  readTime: string;
};

export const blogPosts: PlaceholderBlogPost[] = [
  {
    id: "blog-materials-and-craft",
    slug: "materials-and-craft",
    categorySlug: "journal",
    categoryLabel: "Journal",
    title: "Material, texture, and craft in the Loom & Hearth Studio editorial layer",
    excerpt:
      "Static placeholder article for the PRD blog surface, preserving the blog index and article template structure.",
    body: [
      "This blog slice is implemented with static placeholder content only. It exists to reserve the editorial structure described in the PRD without introducing a CMS or real content retrieval.",
      "The article template is designed to support featured imagery, category presentation, publishing metadata, long-form body content, and future SEO-aware article rendering.",
      "The current implementation is intentionally modular so a future content system can replace the placeholder data without reworking the article layout or route structure.",
    ].join("\n\n"),
    publishedAt: "2026-03-16",
    readTime: "4 min read",
    status: "active",
    seoTitle: "Material, texture, and craft | Loom & Hearth Studio",
    seoDescription:
      "Placeholder blog article preserving the editorial blog template structure.",
  },
  {
    id: "blog-home-styling-notes",
    slug: "home-styling-notes",
    categorySlug: "styling",
    categoryLabel: "Styling",
    title: "Home styling notes for a premium editorial storefront",
    excerpt:
      "Static placeholder content showing how category-led blog routing can fit within the launch information architecture.",
    body: [
      "This placeholder post keeps the category plus slug route structure intact for the PRD blog layer.",
      "It demonstrates how a future CMS-managed article could be rendered with a consistent layout, metadata treatment, and article body rhythm.",
      "No related-posts engine, newsletter integration, or live content workflows are implemented in this slice.",
    ].join("\n\n"),
    publishedAt: "2026-03-15",
    readTime: "3 min read",
    status: "active",
    seoTitle: "Home styling notes | Loom & Hearth Studio",
    seoDescription:
      "Placeholder styling article for the blog category and post template structure.",
  },
  {
    id: "blog-lookbook-direction",
    slug: "lookbook-direction",
    categorySlug: "lookbook",
    categoryLabel: "Lookbook",
    title: "Lookbook direction and editorial pacing",
    excerpt:
      "Static placeholder article aligned to the PRD’s content and editorial requirements.",
    body: [
      "This post is a placeholder for content that may eventually connect the blog and lookbook layers defined in the PRD.",
      "For now, it exists to populate the blog index with representative editorial entries and to validate the article template route.",
      "CMS wiring, rich media embedding, and content operations remain out of scope for this implementation slice.",
    ].join("\n\n"),
    publishedAt: "2026-03-14",
    readTime: "5 min read",
    status: "active",
    seoTitle: "Lookbook direction | Loom & Hearth Studio",
    seoDescription:
      "Placeholder editorial article used to validate the blog index and post template.",
  },
] as const;

export const blogCategories = Array.from(
  new Map(
    blogPosts.map((post) => [
      post.categorySlug,
      {
        slug: post.categorySlug,
        label: post.categoryLabel,
      },
    ]),
  ).values(),
);

export function getBlogPostByParams(category: string, slug: string) {
  return blogPosts.find(
    (post) => post.categorySlug === category && post.slug === slug,
  );
}
