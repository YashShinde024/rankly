"use client";

import React from "react";
import { motion, useScroll, useSpring, useReducedMotion } from "framer-motion";

/**
 * Global spectral scroll-progress hairline.
 * Rendered once in the root layout so every page shares the same effect.
 * - Fixed directly beneath the navbar (no layout shift)
 * - Smooth spring interpolation of real document scroll progress
 * - Hidden entirely for users who prefer reduced motion
 */
export function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });

  if (reduce) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-14 z-[60] h-[2px] origin-left spectrum-border opacity-70"
      style={{ scaleX }}
    />
  );
}
