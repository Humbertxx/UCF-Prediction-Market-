/**
 * Live markets preview — pulls real demo markets when the API is up.
 */

import { Link } from "react-router-dom";

import MarketCard from "../market/MarketCard";
import { useMarkets } from "../../hooks/useMarket";
import { MarketCardSkeleton } from "../../motion/components/Skeleton";
import MotionReveal, { MotionRevealItem } from "../../motion/components/MotionReveal";

export default function MarketsPreviewSection() {
  const { markets, status } = useMarkets();
  const preview = markets.slice(0, 3);

  return (
    <MotionReveal
      className="border-b border-line bg-card py-16 sm:py-20"
      aria-labelledby="markets-preview-heading"
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-display text-sm font-medium uppercase tracking-[0.12em] text-gold-ink">
              Live demo
            </p>
            <h2
              id="markets-preview-heading"
              className="mt-2 font-display text-3xl font-semibold text-ink"
            >
              Markets moving now
            </h2>
            <p className="mt-2 max-w-xl text-base text-muted">
              Open any market to trade, chart price history, and read the live
              trade feed. Admin simulation can nudge prices toward hidden beliefs.
            </p>
          </div>
          <Link
            to="/markets"
            className="rounded-btn border border-line bg-surface px-4 py-2 text-sm font-medium text-ink hover:border-gold"
          >
            View all markets
          </Link>
        </div>

        {status === "loading" && preview.length === 0 && (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="status">
            <MarketCardSkeleton />
            <MarketCardSkeleton />
            <MarketCardSkeleton />
          </div>
        )}

        {status === "success" && preview.length === 0 && (
          <p className="mt-10 text-sm text-muted">
            No markets seeded yet. Start the backend to load demo markets.
          </p>
        )}

        {preview.length > 0 && (
          <MotionReveal
            as="div"
            stagger
            className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {preview.map((market) => (
              <MotionRevealItem key={market.id}>
                <MarketCard market={market} />
              </MotionRevealItem>
            ))}
          </MotionReveal>
        )}
      </div>
    </MotionReveal>
  );
}
