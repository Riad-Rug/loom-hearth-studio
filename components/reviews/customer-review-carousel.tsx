"use client";

import { useEffect, useMemo, useState } from "react";

import type { CustomerReview } from "@/lib/reviews/customer-reviews";

import styles from "./customer-review-carousel.module.css";

type CustomerReviewCarouselProps = {
  reviews: CustomerReview[];
  className?: string;
  eyebrow?: string;
  title?: string;
  variant?: "pdp" | "home";
};

const rotationMs = 6500;

export function CustomerReviewCarousel({
  reviews,
  className,
  eyebrow = "Customer reviews",
  title = "What buyers say after living with the piece.",
  variant = "home",
}: CustomerReviewCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const activeReview = reviews[activeIndex] ?? reviews[0];
  const rootClassName = [
    styles.carousel,
    variant === "pdp" ? styles.carouselPdp : styles.carouselHome,
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const activeMeta = useMemo(
    () =>
      activeReview
        ? `${activeReview.customerName} - ${activeReview.country} - ${activeReview.productType}`
        : "",
    [activeReview],
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (isPaused || prefersReducedMotion || reviews.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % reviews.length);
    }, rotationMs);

    return () => window.clearInterval(timer);
  }, [isPaused, prefersReducedMotion, reviews.length]);

  if (!activeReview) {
    return null;
  }

  return (
    <section
      className={rootClassName}
      aria-label="Customer reviews"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className={styles.copy}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2>{title}</h2>
      </div>

      <figure className={styles.reviewCard} aria-live="polite">
        <blockquote key={activeReview.id}>{activeReview.body}</blockquote>
        <figcaption>
          <span>{activeMeta}</span>
        </figcaption>
      </figure>

      <div className={styles.controls} aria-label="Review carousel controls">
        <button
          className={styles.arrowButton}
          type="button"
          aria-label="Show previous review"
          onClick={() =>
            setActiveIndex((currentIndex) =>
              currentIndex === 0 ? reviews.length - 1 : currentIndex - 1,
            )
          }
        >
          Prev
        </button>
        <div className={styles.dots} aria-label="Review position">
          {reviews.map((review, index) => (
            <button
              key={review.id}
              className={`${styles.dot} ${index === activeIndex ? styles.dotActive : ""}`}
              type="button"
              aria-label={`Show review ${index + 1} of ${reviews.length}`}
              aria-current={index === activeIndex ? "true" : undefined}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
        <button
          className={styles.arrowButton}
          type="button"
          aria-label="Show next review"
          onClick={() => setActiveIndex((currentIndex) => (currentIndex + 1) % reviews.length)}
        >
          Next
        </button>
      </div>
    </section>
  );
}
