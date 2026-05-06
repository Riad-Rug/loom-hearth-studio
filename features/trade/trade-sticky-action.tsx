"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import styles from "./trade-page.module.css";

export function TradeStickyAction() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 520);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className={`${styles.stickyAction} ${isVisible ? styles.stickyActionVisible : ""}`}
      aria-hidden={!isVisible}
    >
      <Link className={styles.stickyActionButton} href="/trade/apply">
        Start trade inquiry
      </Link>
    </div>
  );
}
