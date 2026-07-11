/**
 * Motion duration, easing, and spring tokens.
 * Adapted from MOTION.md — visual colors stay in DESIGN.md / index.css.
 */

export const duration = {
  instant: 80,
  fast: 120,
  quick: 150,
  short: 200,
  base: 250,
  moderate: 300,
  slow: 400,
  long: 500,
  dramatic: 600,
  ambient: 2000,
} as const;

export const easing = {
  decelerate: [0.0, 0.0, 0.2, 1.0] as const,
  accelerate: [0.4, 0.0, 1.0, 1.0] as const,
  standard: [0.4, 0.0, 0.2, 1.0] as const,
  expressive: [0.34, 1.56, 0.64, 1.0] as const,
  linear: [0.0, 0.0, 1.0, 1.0] as const,
  /** DESIGN.md §7 — probability marker */
  priceMarker: [0.2, 0.8, 0.2, 1.0] as const,
} as const;

export const springs = {
  button: { type: "spring" as const, stiffness: 400, damping: 15 },
  card: { type: "spring" as const, stiffness: 260, damping: 24 },
  modal: { type: "spring" as const, stiffness: 200, damping: 22, mass: 1.1 },
  counter: { type: "spring" as const, stiffness: 120, damping: 18 },
  tooltip: { type: "spring" as const, stiffness: 500, damping: 28 },
} as const;
