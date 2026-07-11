/**
 * Market list card — title, status, and probability bar for fast scanning.
 */

import { motion, type Variants } from "framer-motion";
import { Link } from "react-router-dom";

import HoverCard from "../ui/HoverCard";
import {
  formatMarketStatus,
  formatPriceFromBps,
} from "../../lib/marketFormat";
import { OUTCOME } from "../../lib/terminology";
import { useMotionSafe } from "../../motion/hooks/useMotionSafe";
import type { MarketSummary } from "../../types/market";
import ProbabilityBar from "./ProbabilityBar";

interface MarketCardProps {
  market: MarketSummary;
  tone?: "default" | "landing";
  /** Framer Motion entrance, bar sweep, live dot, price pulse. */
  animated?: boolean;
  density?: "default" | "compact";
}

const toneClasses = {
  default: {
    title: "text-ink group-hover:text-gold-ink",
    status: "border-line text-muted",
    price: "text-ink",
    cta: "text-muted",
  },
  landing: {
    title: "text-landing-ink group-hover:text-gold",
    status: "border-landing-line text-landing-muted",
    price: "text-landing-muted",
    cta: "text-gold/70 group-hover:text-gold",
  },
} as const;

export const marketCardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

function isLiveStatus(status: MarketSummary["status"]) {
  return status === "trading" || status === "seeded";
}

export default function MarketCard({
  market,
  tone = "default",
  animated = false,
  density = "default",
}: MarketCardProps) {
  const motionSafe = useMotionSafe();
  const styles = toneClasses[tone];
  const compact = density === "compact";
  const live = isLiveStatus(market.status);
  const lockPrice = formatPriceFromBps(market.yes_price_bps);
  const useGlowHover = tone === "landing";

  const innerPadding = compact ? "p-5" : "p-4 md:p-6";

  const inner = (
    <>
      {!compact && (
        <div
          className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent"
          aria-hidden
        />
      )}

      <div className="flex items-start justify-between gap-3">
        <h2
          className={[
            "font-display font-semibold leading-snug",
            compact ? "min-w-0 flex-1 text-sm sm:max-w-[10rem]" : "text-xl",
            styles.title,
          ].join(" ")}
        >
          {market.title}
        </h2>

        {animated && live ? (
          <span className="flex shrink-0 items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              {!motionSafe.reduce && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
              )}
              <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
            </span>
            <span className={`font-body text-xs ${styles.status}`}>
              {formatMarketStatus(market.status)}
            </span>
          </span>
        ) : (
          <span
            className={[
              "shrink-0 rounded-full border px-2 py-0.5 text-xs",
              styles.status,
            ].join(" ")}
          >
            {formatMarketStatus(market.status)}
          </span>
        )}
      </div>

      <ProbabilityBar
        yesPriceBps={market.yes_price_bps}
        className={compact ? "mt-3" : "mt-4"}
        showLabels={false}
        variant={compact ? "compact" : "default"}
        animateOnMount={animated}
        tone={tone}
      />

      <div
        className={[
          "mt-3 flex items-center justify-between",
          compact ? "text-xs" : "text-sm",
        ].join(" ")}
      >
        {animated ? (
          <motion.span
            className={["font-data tabular-nums", styles.price].join(" ")}
            animate={motionSafe.reduce ? undefined : { scale: [1, 1.08, 1] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
            }}
          >
            {OUTCOME.yes.label}{" "}
            <span className="font-semibold text-gold">{lockPrice}</span>
          </motion.span>
        ) : (
          <span className={["font-data tabular-nums", styles.price].join(" ")}>
            {OUTCOME.yes.label} {lockPrice}
          </span>
        )}
        <span
          className={[
            "font-body transition-colors",
            compact ? "text-xs" : "",
            styles.cta,
          ].join(" ")}
        >
          View market →
        </span>
      </div>
    </>
  );

  const card = (
    <HoverCard
      as={Link}
      to={`/markets/${market.id}`}
      variant={useGlowHover ? "glow" : "subtle"}
      tone={useGlowHover ? "landing" : "card"}
      className={[
        "group h-full",
        compact && "cursor-pointer",
      ]
        .filter(Boolean)
        .join(" ")}
      innerClassName={["relative overflow-hidden", innerPadding].join(" ")}
    >
      {inner}
    </HoverCard>
  );

  if (!animated) {
    return card;
  }

  return (
    <motion.div
      variants={motionSafe.variants(marketCardVariants)}
      className="h-full"
    >
      {card}
    </motion.div>
  );
}
