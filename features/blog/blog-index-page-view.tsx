import type { Route } from "next";
import Link from "next/link";

import { PlaceholderMedia } from "@/components/media/placeholder-media";
import { blogCategories, blogPosts } from "@/features/blog/blog-post-data";

import styles from "./blog.module.css";

export function BlogIndexPageView() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Blog</p>
          <h1>Editorial blog index placeholder</h1>
          <p className={styles.lede}>
            This slice implements the PRD blog structure with static placeholder content
            only. It preserves the blog index and article route shape without introducing a
            CMS, content API, or newsletter integration.
          </p>
        </div>
        <div className={styles.categoryRail} aria-label="Blog categories">
          {blogCategories.map((category) => (
            <span key={category.slug} className={styles.categoryChip}>
              {category.label}
            </span>
          ))}
        </div>
      </section>

      <section className={styles.indexGrid}>
        {blogPosts.map((post) => (
          <Link
            key={post.id}
            className={styles.postCard}
            href={`/blog/${post.categorySlug}/${post.slug}` as Route}
          >
            <div className={styles.postMedia}>
              <PlaceholderMedia
                alt={post.title}
                aspectRatio="4 / 3"
                label="Featured image placeholder"
                sizes="(max-width: 1100px) 100vw, 33vw"
              />
            </div>
            <div className={styles.postBody}>
              <div className={styles.postMeta}>
                <span>{post.categoryLabel}</span>
                <span>{post.readTime}</span>
              </div>
              <h2>{post.title}</h2>
              <p>{post.excerpt}</p>
              <strong className={styles.readMore}>Read article</strong>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
