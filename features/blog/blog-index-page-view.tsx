import Image from "next/image";
import type { Route } from "next";
import Link from "next/link";

import { blogCategories, blogPosts } from "@/features/blog/blog-post-data";

import styles from "./blog.module.css";

export function BlogIndexPageView() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Journal</p>
          <h1>The editorial journal for Moroccan rugs, materials, and lived-in rooms.</h1>
          <p className={styles.lede}>
            Notes from Loom &amp; Hearth Studio on Beni Ourain-style rugs, cactus silk
            pillows, poufs, sourcing in Morocco, and the quieter styling decisions that
            make a room feel layered rather than staged.
          </p>
        </div>
        <div className={styles.categoryRail} aria-label="Blog categories">
          {blogCategories.map((category) => (
            <Link
              key={category.slug}
              className={styles.categoryChip}
              href={category.href as Route}
            >
              {category.label}
            </Link>
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
              <Image
                alt={post.imageAlt}
                className={styles.postImage}
                fill
                sizes="(max-width: 1100px) 100vw, 33vw"
                src={post.imageSrc}
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
