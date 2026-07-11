/**
 * Live markets preview — pulls real demo markets when the API is up.
 */

import { Link } from "react-router-dom";

import MarketCardGrid from "./MarketCardGrid";
import ReviewTicker from "./ReviewTicker";
import MotionReveal from "../../motion/components/MotionReveal";

export default function MarketsPreviewSection() {
  return (
    <MotionReveal
      id="live-demo"
      className="border-b border-landing-line bg-landing-surface py-16 sm:py-20"
      aria-labelledby="markets-preview-heading"
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-display text-sm font-medium uppercase tracking-[0.12em] text-gold">
              Live demo
            </p>
            <h2
              id="markets-preview-heading"
              className="mt-2 font-display text-3xl font-semibold text-landing-ink"
            >
              Markets moving now
            </h2>
            <p className="mt-2 max-w-xl text-base text-landing-muted">
              Open any market to trade, chart price history, and read the live
              trade feed. Admin simulation can nudge prices toward hidden beliefs.
            </p>
          </div>
          <Link
            to="/markets"
            className="rounded-btn border border-landing-line bg-landing-panel px-4 py-2 text-sm font-medium text-landing-ink hover:border-gold"
          >
            View all markets
          </Link>
        </div>

        <MarketCardGrid
          limit={3}
          density="default"
          surface="landing"
          hideEmptyState
          className="mt-10"
        />
      </div>

      <ReviewTicker />
    </MotionReveal>
  );
}
