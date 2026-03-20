import Image from "next/image";

import type { BlogAuthor } from "@/types/domain";

import styles from "./blog.module.css";

type BlogAuthorBlockProps = {
  author: BlogAuthor;
};

export function BlogAuthorBlock({ author }: BlogAuthorBlockProps) {
  const initials = author.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "LH";

  return (
    <section className={styles.authorBlock} aria-label="Article author">
      {author.photoUrl ? (
        <div className={styles.authorPhotoFrame}>
          <Image alt={author.name} fill sizes="80px" src={author.photoUrl} />
        </div>
      ) : (
        <div className={styles.authorFallback} aria-hidden="true">
          {initials}
        </div>
      )}
      <div className={styles.authorCopy}>
        <p className={styles.authorLabel}>Written by</p>
        <h2>{author.name}</h2>
        <p>{author.bio}</p>
      </div>
    </section>
  );
}
