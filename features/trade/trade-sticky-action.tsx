"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import styles from "./trade-page.module.css";

export function TradeStickyAction() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hero = document.querySelector("[data-hero-sentinel]");
    const finalCta = document.querySelector("[data-final-cta]");

    if (!hero || !finalCta) {
      return;
    }

    // Shows once the hero has scrolled out of view (the hero itself no longer
    // carries a CTA), hides again once the closing CTA band scrolls into
    // view, so the bar never floats over either.
    let heroVisible = true;
    let finalCtaVisible = false;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === hero) {
            heroVisible = entry.isIntersecting;
          } else if (entry.target === finalCta) {
            finalCtaVisible = entry.isIntersecting;
          }
        }

        setIsVisible(!heroVisible && !finalCtaVisible);
      },
      { rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(hero);
    observer.observe(finalCta);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      className={`${styles.stickyAction} ${isVisible ? styles.stickyActionVisible : ""}`}
      aria-hidden={!isVisible}
      inert={!isVisible}
    >
      <Link className={styles.stickyActionButton} href="/contact?inquiryType=trade-request">
        Start trade inquiry
      </Link>
    </div>
  );
}
