/**
 * Framer Motion variant presets — GPU-safe transform + opacity only.
 */

import type { Variants } from "framer-motion";

import { duration, easing, springs } from "./tokens";

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.slow / 1000, ease: easing.decelerate },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: duration.base / 1000, ease: easing.accelerate },
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
      when: "beforeChildren",
    },
  },
};

export const slideInRight: Variants = {
  hidden: { x: "100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: springs.modal,
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: { duration: duration.moderate / 1000, ease: easing.accelerate },
  },
};

export const scalePop: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springs.modal,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: duration.short / 1000, ease: easing.accelerate },
  },
};

export const fadeThrough: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: duration.short / 1000, ease: easing.standard },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15, ease: easing.accelerate },
  },
};

export const pageVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: easing.decelerate },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.22, ease: easing.accelerate },
  },
};

export const toastVariants: Variants = {
  hidden: { opacity: 0, x: 80, scale: 0.92 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 280, damping: 20 },
  },
  exit: {
    opacity: 0,
    x: 60,
    scale: 0.95,
    transition: { duration: duration.short / 1000, ease: easing.accelerate },
  },
};

/** DESIGN.md §10 — new trade row fade-in (gold highlight via CSS) */
export const tradeRowEnter: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: duration.dramatic / 1000, ease: easing.decelerate },
  },
};

export const glowPulse = {
  animate: {
    opacity: [0.25, 0.45, 0.25],
    scale: [1, 1.06, 1],
    transition: { duration: 4, ease: "linear" as const, repeat: Infinity },
  },
};
