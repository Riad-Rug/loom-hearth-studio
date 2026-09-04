import Image from "next/image";
import type { Route } from "next";
import Link from "next/link";

import { renderMarkdownBody, renderPlainBody } from "@/components/content/markdown-body";
import { PlaceholderMedia } from "@/components/media/placeholder-media";
import { BlogAuthorBlock } from "@/features/blog/blog-author-block";
import type { BlogAuthor, BlogPost } from "@/types/domain";

import styles from "./blog.module.css";

type PlaceholderBlogPost = BlogPost & {
  categoryLabel: string;
  readTime: string;
  images: { id: string; src: string; alt: string }[];
  bodyFormat?: "plain" | "markdown";
};

export type RelatedBlogPostLink = Pick<
  PlaceholderBlogPost,
  "id" | "slug" | "categorySlug" | "categoryLabel" | "title"
>;

type BlogPostPageViewProps = {
  post: PlaceholderBlogPost;
  author: BlogAuthor;
  /** Published posts to link from the "More from the journal" block. Must never include placeholder data. */
  relatedPosts?: RelatedBlogPostLink[];
};

export function BlogPostPageView({ post, author, relatedPosts = [] }: BlogPostPageViewProps) {
  const adjacentPosts = relatedPosts.filter((candidate) => candidate.id !== post.id).slice(0, 2);

  return (
    <div className={styles.page}>
      <article className={styles.articleShell}>
        <header className={styles.articleHeader}>
          <p className={styles.eyebrow}>{post.categoryLabel}</p>
          <h1>{post.title}</h1>
          <div className={styles.articleMeta}>
            <span>{post.publishedAt}</span>
            <span>{post.readTime}</span>
          </div>
          <p className={styles.lede}>{post.excerpt}</p>
        </header>

        {post.images[0] ? (
          <div className={styles.articleMedia}>
            {isCloudinaryImage(post.images[0].src) ? (
              <Image
                alt={post.images[0].alt}
                className={styles.articleImage}
                fill
                priority
                sizes="(max-width: 1100px) 100vw, 80vw"
                src={post.images[0].src}
              />
            ) : (
              <PlaceholderMedia
                alt={post.images[0].alt}
                aspectRatio="16 / 10"
                label="Journal photo pending"
                priority
                sizes="(max-width: 1100px) 100vw, 80vw"
              />
            )}
          </div>
        ) : null}

        <div className={styles.articleBody}>
          {post.bodyFormat === "markdown" ? renderMarkdownBody(post.body) : renderPlainBody(post.body)}
        </div>

        <BlogAuthorBlock author={author} />
      </article>

      {adjacentPosts.length > 0 ? (
        <section className={styles.relatedSection}>
          <div className={styles.relatedHeader}>
            <p className={styles.eyebrow}>More from the journal</p>
            <h2>Continue reading the collection story.</h2>
          </div>
          <div className={styles.relatedGrid}>
            {adjacentPosts.map((item) => (
              <Link
                key={item.id}
                className={styles.relatedCard}
                href={`/blog/${item.categorySlug}/${item.slug}` as Route}
              >
                <span>{item.categoryLabel}</span>
                <strong>{item.title}</strong>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function isCloudinaryImage(src: string) {
  return src.startsWith("https://res.cloudinary.com/");
}
