/**
 * Scroll-triggered section reveal with optional stagger for child grids.
 */

import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { useMotionSafe } from "../hooks/useMotionSafe";
import { fadeUp, staggerContainer } from "../variants";

interface MotionRevealProps {
  children: ReactNode;
  className?: string;
  as?: "section" | "div";
  stagger?: boolean;
  id?: string;
  "aria-labelledby"?: string;
}

export default function MotionReveal({
  children,
  className = "",
  as = "section",
  stagger = false,
  id,
  "aria-labelledby": ariaLabelledby,
}: MotionRevealProps) {
  const motionSafe = useMotionSafe();
  const Component = motion[as];

  return (
    <Component
      id={id}
      aria-labelledby={ariaLabelledby}
      className={className}
      variants={motionSafe.variants(stagger ? staggerContainer : fadeUp)}
      initial={motionSafe.initial}
      whileInView={motionSafe.whileInView}
      viewport={motionSafe.viewport}
    >
      {children}
    </Component>
  );
}

interface MotionRevealItemProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "article";
}

export function MotionRevealItem({
  children,
  className = "",
  as = "div",
}: MotionRevealItemProps) {
  const motionSafe = useMotionSafe();
  const Component = motion[as];

  return (
    <Component
      className={className}
      variants={motionSafe.variants(fadeUp)}
    >
      {children}
    </Component>
  );
}
