"use client";

import { useLayoutEffect } from "react";

/**
 * Scroll reveals for the public marketing surfaces.
 *
 * Adds `.reveal-ready` to <html> before paint (so there is no visible flash of
 * already-styled content) and `.is-in` to each target as it enters the
 * viewport. Without JavaScript, or with reduced motion, the CSS keeps every
 * target fully visible.
 */
const TARGETS = [
  ".hero-plate",
  ".role-showcase",
  ".atlas-band",
  ".marketing-section",
  ".privacy-section",
  ".library-section",
  ".approach-section",
  ".closing-section",
  ".privacy-visual",
  ".capability-card",
  ".library-card",
].join(", ");

export function ScrollReveal() {
  useLayoutEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const root = document.documentElement;
    root.classList.add("reveal-ready");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 },
    );
    const targets = document.querySelectorAll(TARGETS);
    targets.forEach((target) => observer.observe(target));
    return () => {
      root.classList.remove("reveal-ready");
      targets.forEach((target) => target.classList.remove("is-in"));
      observer.disconnect();
    };
  }, []);
  return null;
}
