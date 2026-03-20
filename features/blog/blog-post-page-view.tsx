import Image from "next/image";
import type { Route } from "next";
import Link from "next/link";

import { BlogAuthorBlock } from "@/features/blog/blog-author-block";
import { blogPosts } from "@/features/blog/blog-post-data";
import type { BlogAuthor, BlogPost } from "@/types/domain";

import styles from "./blog.module.css";

type PlaceholderBlogPost = BlogPost & {
  categoryLabel: string;
  readTime: string;
  imageAlt: string;
  imageSrc: string;
};

type BlogPostPageViewProps = {
  post: PlaceholderBlogPost;
  author: BlogAuthor;
};

export function BlogPostPageView({ post, author }: BlogPostPageViewProps) {
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
          <Image
            alt={post.imageAlt}
            className={styles.articleImage}
            fill
            priority
            sizes="(max-width: 1100px) 100vw, 80vw"
            src={post.imageSrc}
          />
        </div>

        <div className={styles.articleBody}>
          {bodyParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <BlogAuthorBlock author={author} />
      </article>

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
    </div>
  );
}
