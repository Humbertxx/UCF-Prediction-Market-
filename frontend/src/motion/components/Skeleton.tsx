/**
 * Shimmer skeleton — mounts only while data is loading.
 */

import { motion } from "framer-motion";

interface SkeletonProps {
  className?: string;
  tone?: "default" | "landing";
}

export default function Skeleton({ className = "", tone = "default" }: SkeletonProps) {
  const bg = tone === "landing" ? "bg-landing-line/60" : "bg-line/60";

  return (
    <div
      className={`relative overflow-hidden rounded-card ${bg} ${className}`}
      aria-hidden
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)",
        }}
        animate={{ x: ["-100%", "100%"] }}
        transition={{
          duration: 1.6,
          ease: "linear",
          repeat: Infinity,
          repeatDelay: 0.4,
        }}
      />
    </div>
  );
}

export function MarketCardSkeleton({ tone = "default" }: { tone?: "default" | "landing" }) {
  const shell =
    tone === "landing"
      ? "rounded-card border border-landing-line bg-landing-elevated p-4 md:p-6"
      : "rounded-card border border-line bg-card p-4 md:p-6";

  return (
    <div className={shell}>
      <Skeleton tone={tone} className="h-6 w-3/4" />
      <Skeleton tone={tone} className="mt-4 h-3 w-full rounded-full" />
      <Skeleton tone={tone} className="mt-3 h-4 w-1/2" />
    </div>
  );
}
