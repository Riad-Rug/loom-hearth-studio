"use client";

import { useEffect, useRef, useState } from "react";

import type { CustomerReview } from "@/lib/reviews/customer-reviews";

import styles from "./customer-review-carousel.module.css";

type CustomerReviewCarouselProps = {
  reviews: CustomerReview[];
  className?: string;
  eyebrow?: string;
  title?: string;
  variant?: "pdp" | "home";
};

export function CustomerReviewCarousel({
  reviews,
  className,
  eyebrow = "Customer reviews",
  title = "What buyers say after living with the piece.",
  variant = "home",
}: CustomerReviewCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const rootClassName = [
    styles.carousel,
    variant === "pdp" ? styles.carouselPdp : styles.carouselHome,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  useEffect(() => {
    const trackElement = trackRef.current;
    if (!trackElement) {
      return;
    }

    function handleScroll() {
      const currentTrack = trackRef.current;
      if (!currentTrack) {
        return;
      }

      const nextIndex = Math.round(
        currentTrack.scrollLeft / Math.max(currentTrack.clientWidth, 1),
      );
      setActiveIndex((currentIndex) => (currentIndex === nextIndex ? currentIndex : nextIndex));
    }

    trackElement.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      trackElement.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (!reviews.length) {
    return null;
  }

  function scrollToReview(index: number) {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    const nextIndex = (index + reviews.length) % reviews.length;
    track.scrollTo({
      left: track.clientWidth * nextIndex,
      behavior: "smooth",
    });
    setActiveIndex(nextIndex);
  }

  return (
    <section className={rootClassName} aria-label="Customer reviews">
      <div className={styles.copy}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2>{title}</h2>
      </div>

      <div className={styles.carouselStage}>
        <button
          className={`${styles.arrowButton} ${styles.arrowButtonPrev}`}
          type="button"
          aria-label="Show previous review"
          onClick={() => scrollToReview(activeIndex - 1)}
        >
          <ArrowIcon direction="left" />
        </button>

        <div ref={trackRef} className={styles.reviewTrack}>
          {reviews.map((review, index) => (
            <figure
              key={review.id}
              className={styles.reviewCard}
              aria-current={index === activeIndex ? "true" : undefined}
            >
              <div className={styles.reviewStars} aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <StarIcon key={`${review.id}-star-${starIndex}`} />
                ))}
              </div>
              <blockquote>{review.body}</blockquote>
              <figcaption>
                <span>{review.customerName}</span>
                <span>{review.country}</span>
                <span>{review.productType}</span>
              </figcaption>
            </figure>
          ))}
        </div>

        <button
          className={`${styles.arrowButton} ${styles.arrowButtonNext}`}
          type="button"
          aria-label="Show next review"
          onClick={() => scrollToReview(activeIndex + 1)}
        >
          <ArrowIcon direction="right" />
        </button>
      </div>

      <div className={styles.controls} aria-label="Review carousel controls">
        <div className={styles.dots} aria-label="Review position">
          {reviews.map((review, index) => (
            <button
              key={review.id}
              className={`${styles.dot} ${index === activeIndex ? styles.dotActive : ""}`}
              type="button"
              aria-label={`Show review ${index + 1} of ${reviews.length}`}
              aria-current={index === activeIndex ? "true" : undefined}
              onClick={() => scrollToReview(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {direction === "left" ? (
        <path d="M14.5 5.5 8 12l6.5 6.5" />
      ) : (
        <path d="M9.5 5.5 16 12l-6.5 6.5" />
      )}
    </svg>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m12 3.9 2.39 4.84 5.34.78-3.87 3.77.91 5.32L12 16.11 7.23 18.62l.91-5.32-3.87-3.77 5.34-.78L12 3.9Z" />
    </svg>
  );
}
