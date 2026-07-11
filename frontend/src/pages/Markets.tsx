/**
 * Markets page — browse active and historical prediction markets.
 */

import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";

import MarketCard from "../components/market/MarketCard";
import { MarketCardSkeleton } from "../components/ui/Skeleton";
import { useMarkets } from "../hooks/useMarket";
import { CAMPUS_DEMO_TOPICS } from "../lib/landing";
import { inferMarketCategory, isOpenMarketStatus } from "../lib/marketCategory";

export default function Markets() {
  const { markets, status, error, refresh } = useMarkets();
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get("category");

  const filteredMarkets = useMemo(() => {
    const openMarkets = markets.filter((market) => isOpenMarketStatus(market.status));

    if (!activeCategory) {
      return openMarkets;
    }

    return openMarkets.filter(
      (market) => inferMarketCategory(market.slug) === activeCategory,
    );
  }, [activeCategory, markets]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-display text-sm font-medium uppercase tracking-[0.12em] text-gold-ink">
            Markets
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
            Browse markets
          </h1>
          <p className="mt-2 max-w-2xl text-base text-muted">
            Virtual-credit Lock/Doubt markets. Open a market to trade and watch
            prices move.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={status === "loading"}
          className="rounded-btn border border-line bg-card px-4 py-2 text-sm text-ink hover:border-gold disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          to="/markets"
          className={[
            "rounded-full border px-3 py-1.5 text-sm font-medium transition",
            activeCategory
              ? "border-line text-muted hover:border-gold hover:text-ink"
              : "border-gold bg-gold/10 text-ink",
          ].join(" ")}
        >
          All live
        </Link>
        {CAMPUS_DEMO_TOPICS.map((topic) => {
          const selected = activeCategory === topic.category;

          return (
            <Link
              key={topic.category}
              to={`/markets?category=${encodeURIComponent(topic.category)}`}
              className={[
                "rounded-full border px-3 py-1.5 text-sm font-medium transition",
                selected
                  ? "border-gold bg-gold/10 text-ink"
                  : "border-line text-muted hover:border-gold hover:text-ink",
              ].join(" ")}
            >
              {topic.label}
            </Link>
          );
        })}
      </div>

      {activeCategory && (
        <p className="mt-4 text-sm text-muted">
          Showing open {activeCategory.toLowerCase()} markets.
        </p>
      )}

      {status === "loading" && markets.length === 0 && (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="status">
          <MarketCardSkeleton />
          <MarketCardSkeleton />
          <MarketCardSkeleton />
        </div>
      )}

      {status === "error" && (
        <div className="mt-10 rounded-card border border-line bg-card p-6">
          <p className="text-sm text-muted">{error}</p>
          <button
            type="button"
            onClick={() => void refresh()}
            className="mt-3 rounded-btn bg-deck px-4 py-2 text-sm font-medium text-card"
          >
            Try again
          </button>
        </div>
      )}

      {status === "success" && markets.length === 0 && (
        <p className="mt-10 text-sm text-muted">
          No markets yet. Run the backend seed to load demo markets.
        </p>
      )}

      {status === "success" && markets.length > 0 && filteredMarkets.length === 0 && (
        <p className="mt-10 text-sm text-muted">
          No open {activeCategory?.toLowerCase() ?? ""} markets right now.
        </p>
      )}

      {filteredMarkets.length > 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMarkets.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>
      )}

      <p className="mt-10 text-xs text-muted">
        Simulation - virtual credits - no cash value
      </p>
    </main>
  );
}
