import type { Route } from "next";
import Link from "next/link";

import { blogPosts } from "@/features/blog/blog-post-data";
import type { BlogPost } from "@/types/domain";

import styles from "./blog.module.css";

type PlaceholderBlogPost = BlogPost & {
  categoryLabel: string;
  readTime: string;
};

type BlogPostPageViewProps = {
  post: PlaceholderBlogPost;
};

export function BlogPostPageView({ post }: BlogPostPageViewProps) {
  const bodyParagraphs = post.body.split("\n\n");
  const adjacentPosts = blogPosts.filter((candidate) => candidate.id !== post.id).slice(0, 2);

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

        <div className={styles.articleMedia}>
          <span>Featured image placeholder</span>
        </div>

        <div className={styles.articleBody}>
          {bodyParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>

      <section className={styles.relatedSection}>
        <div className={styles.relatedHeader}>
          <p className={styles.eyebrow}>More from the blog</p>
          <h2>Static related articles UI</h2>
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
    </div>
  );
}
