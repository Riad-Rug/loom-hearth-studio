"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function BackToTopButton() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsVisible(window.scrollY > 480);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <a
      className={`global-back-to-top-button ${
        isVisible ? "global-back-to-top-button-visible" : ""
      }`}
      href="#top"
    >
      Top
    </a>
  );
}
