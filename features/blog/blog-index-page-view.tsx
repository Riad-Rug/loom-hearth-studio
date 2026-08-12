import Image from "next/image";
import type { Route } from "next";
import Link from "next/link";

import { PlaceholderMedia } from "@/components/media/placeholder-media";
import { getBlogCategories, type BlogPostRecord } from "@/features/blog/blog-post-data";

import styles from "./blog.module.css";

type BlogIndexPageViewProps = {
  posts: BlogPostRecord[];
};

export function BlogIndexPageView({ posts }: BlogIndexPageViewProps) {
  const blogCategories = getBlogCategories(posts);
  const [featuredPost, ...remainingPosts] = posts;

  if (!featuredPost) {
    return null;
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>JOURNAL</p>
          <h1>The stories and lessons I’ve gathered around Moroccan rugs.</h1>
          <p className={styles.lede}>
            Notes on craftsmanship, sourcing, materials, family history, and the people and places I’ve learned from along the way.
          </p>
        </div>
        <div className={styles.categoryRail} aria-label="Blog categories">
          {blogCategories.map((category) => (
            <Link
              key={category.slug}
              className={styles.categoryChip}
              href={category.href as Route}
            >
              {category.label} ({category.count})
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.featuredSection}>
        <Link
          className={styles.featuredCard}
          href={`/blog/${featuredPost.categorySlug}/${featuredPost.slug}` as Route}
        >
          <div className={styles.featuredMedia}>
            {isCloudinaryImage(featuredPost.images[0]?.src ?? "") ? (
              <Image
                alt={featuredPost.images[0]?.alt ?? ""}
                className={styles.postImage}
                fill
                priority
                sizes="(max-width: 1100px) 100vw, 52vw"
                src={featuredPost.images[0]?.src ?? ""}
              />
            ) : (
              <PlaceholderMedia
                alt={featuredPost.images[0]?.alt ?? ""}
                aspectRatio="4 / 3"
                label="Journal photo pending"
                priority
                sizes="(max-width: 1100px) 100vw, 52vw"
              />
            )}
          </div>
          <div className={styles.featuredBody}>
            <div className={styles.postMeta}>
              <span>{featuredPost.categoryLabel}</span>
              <span>{featuredPost.publishedAt}</span>
              <span>{featuredPost.readTime}</span>
            </div>
            <h2>{featuredPost.title}</h2>
            <p>{featuredPost.excerpt}</p>
            <strong className={styles.readMore}>{featuredPost.ctaLabel}</strong>
          </div>
        </Link>
      </section>

      <section className={styles.indexGrid}>
        {remainingPosts.map((post) => (
          <Link
            key={post.id}
            className={styles.postCard}
            href={`/blog/${post.categorySlug}/${post.slug}` as Route}
          >
            <div className={styles.postMedia}>
              {isCloudinaryImage(post.images[0]?.src ?? "") ? (
                <Image
                  alt={post.images[0]?.alt ?? ""}
                  className={styles.postImage}
                  fill
                  sizes="(max-width: 1100px) 100vw, 33vw"
                  src={post.images[0]?.src ?? ""}
                />
              ) : (
                <PlaceholderMedia
                  alt={post.images[0]?.alt ?? ""}
                  aspectRatio="4 / 3"
                  label="Journal photo pending"
                  sizes="(max-width: 1100px) 100vw, 33vw"
                />
              )}
            </div>
            <div className={styles.postBody}>
              <div className={styles.postMeta}>
                <span>{post.categoryLabel}</span>
                <span>{post.publishedAt}</span>
                <span>{post.readTime}</span>
              </div>
              <h2>{post.title}</h2>
              <p>{post.excerpt}</p>
              <strong className={styles.readMore}>{post.ctaLabel}</strong>
            </div>
          </Link>
        ))}
      </section>

      <section className={styles.closingSection}>
        <div className={styles.closingCopy}>
          <p className={styles.closingEyebrow}>FROM THE JOURNAL</p>
          <h2>Take the sourcing notes into the collection itself.</h2>
          <p>
            If the journal clarified what to look for, the next step is to see the actual rugs,
            pillows, poufs, and ONE OF A KIND pieces the studio selected in person.
          </p>
        </div>
        <div className={styles.closingActions}>
          <Link className={styles.primaryAction} href={"/shop" as Route}>
            Shop the collection
          </Link>
          <Link className={styles.secondaryAction} href={"/contact?inquiryType=sourcing-question" as Route}>
            Ask a sourcing question
          </Link>
        </div>
      </section>
    </div>
  );
}

function isCloudinaryImage(src: string) {
  return src.startsWith("https://res.cloudinary.com/");
}

