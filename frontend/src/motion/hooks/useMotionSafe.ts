/**
 * Respects prefers-reduced-motion for Framer Motion trees.
 */

import { useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";

export function useMotionSafe() {
  const reduce = useReducedMotion();

  return {
    reduce: Boolean(reduce),
    initial: reduce ? false : ("hidden" as const),
    animate: "visible" as const,
    variants: (v: Variants) => (reduce ? {} : v),
    transition: reduce ? { duration: 0 } : undefined,
    whileInView: reduce ? undefined : ("visible" as const),
    viewport: { once: true, amount: 0.2 } as const,
  };
}
