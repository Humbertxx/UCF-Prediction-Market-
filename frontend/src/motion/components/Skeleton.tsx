/**
 * Shimmer skeleton — mounts only while data is loading.
 */

import { motion } from "framer-motion";

interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-card bg-line/60 ${className}`}
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

export function MarketCardSkeleton() {
  return (
    <div className="rounded-card border border-line bg-card p-4 md:p-6">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="mt-4 h-3 w-full rounded-full" />
      <Skeleton className="mt-3 h-4 w-1/2" />
    </div>
  );
}
