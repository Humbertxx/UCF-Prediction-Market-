/**
 * Staggered landing grid of animated market cards — live API data when available.
 */

import { motion, type Variants } from "framer-motion";

import { useMarkets } from "../../hooks/useMarket";
import MarketCard from "../market/MarketCard";
import { MarketCardSkeleton } from "../../motion/components/Skeleton";
import { useMotionSafe } from "../../motion/hooks/useMotionSafe";

const gridVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

interface MarketCardGridProps {
  limit?: number;
  density?: "default" | "compact";
  surface?: "hero" | "landing";
  className?: string;
  /** When true, render nothing instead of the empty/error copy. */
  hideEmptyState?: boolean;
}

export default function MarketCardGrid({
  limit = 3,
  density = "compact",
  surface = "hero",
  className = "",
  hideEmptyState = false,
}: MarketCardGridProps) {
  const { markets, status } = useMarkets();
  const motionSafe = useMotionSafe();
  const preview = markets.slice(0, limit);

  if (status === "loading" && preview.length === 0) {
    return (
      <div
        className={[
          "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
          className,
        ].join(" ")}
        role="status"
        aria-label="Loading markets"
      >
        <MarketCardSkeleton tone="landing" />
        <MarketCardSkeleton tone="landing" />
        <MarketCardSkeleton tone="landing" />
      </div>
    );
  }

  if (preview.length === 0) {
    if (hideEmptyState) {
      return null;
    }

    return (
      <p
        className={[
          "text-center text-sm",
          surface === "hero" ? "text-card/60" : "text-landing-muted",
        ].join(" ")}
      >
        {status === "error"
          ? "Markets unavailable — start the backend to load the demo."
          : "No markets seeded yet. Start the backend to load demo markets."}
      </p>
    );
  }

  return (
    <motion.div
      variants={motionSafe.variants(gridVariants)}
      initial={motionSafe.initial}
      animate={motionSafe.animate}
      className={[
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
        className,
      ].join(" ")}
    >
      {preview.map((market) => (
        <MarketCard
          key={market.id}
          market={market}
          tone="landing"
          animated
          density={density}
        />
      ))}
    </motion.div>
  );
}
