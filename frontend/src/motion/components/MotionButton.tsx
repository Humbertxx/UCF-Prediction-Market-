/**
 * CTA link/button with spring tap — color transitions stay in CSS.
 */

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";

import { springs } from "../tokens";

type MotionLinkProps = LinkProps & {
  children: ReactNode;
  spring?: boolean;
  className?: string;
};

export function MotionLink({
  children,
  className = "",
  spring = true,
  ...props
}: MotionLinkProps) {
  return (
    <motion.div
      className="inline-flex"
      whileHover={spring ? { scale: 1.03 } : undefined}
      whileTap={spring ? { scale: 0.97 } : undefined}
      transition={spring ? springs.button : undefined}
    >
      <Link className={className} {...props}>
        {children}
      </Link>
    </motion.div>
  );
}

interface MotionButtonProps {
  children: ReactNode;
  spring?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
}

export function MotionButton({
  children,
  className = "",
  spring = true,
  type = "button",
  disabled,
  onClick,
}: MotionButtonProps) {
  return (
    <motion.button
      type={type}
      className={className}
      disabled={disabled}
      onClick={onClick}
      whileHover={spring && !disabled ? { scale: 1.03 } : undefined}
      whileTap={spring && !disabled ? { scale: 0.97 } : undefined}
      transition={spring ? springs.button : undefined}
    >
      {children}
    </motion.button>
  );
}
