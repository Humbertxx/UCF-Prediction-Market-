/**
 * Market detail page — probability bar, chart, trade panel, and feed.
 */

import { Link, useParams } from "react-router-dom";

import MarketInsight from "../components/market/MarketInsight";
import PriceChart from "../components/market/PriceChart";
import ProbabilityBar from "../components/market/ProbabilityBar";
import ResolvedOutcomeBanner from "../components/market/ResolvedOutcomeBanner";
import TradeFeed from "../components/market/TradeFeed";
import TradePanel from "../components/market/TradePanel";
import { useAuth } from "../context/AuthContext";
import { useMarketDetail } from "../hooks/useMarket";
import { useMarketPosition } from "../hooks/usePositions";
import { useTrades } from "../hooks/useTrades";
import { formatMarketStatus } from "../lib/marketFormat";
import { outcomeResolvedLabel } from "../lib/terminology";

export default function MarketPage() {
  const { marketId } = useParams<{ marketId: string }>();
  const { isAuthenticated } = useAuth();
  const {
    market,
    status: marketStatus,
    error: marketError,
    refresh: refreshMarket,
  } = useMarketDetail(marketId);

  const { position } = useMarketPosition(marketId, isAuthenticated);

  const {
    trades,
    priceHistory,
    status: tradesStatus,
    error: tradesError,
    realtimeConnected,
    refresh: refreshTrades,
  } = useTrades(marketId);

  // Prefer latest trade price so the bar tracks bots/polling without waiting
  // for a full market refetch.
  const liveYesPriceBps =
    priceHistory.length > 0
      ? priceHistory[priceHistory.length - 1].yes_price_bps
      : (market?.yes_price_bps ?? 5000);

  function handleTradeSuccess() {
    void refreshMarket();
    void refreshTrades();
  }

  if (!marketId) {
    return (
      <main className="mx-auto max-w-5xl p-4">
        <p className="text-sm text-muted">Market not found.</p>
      </main>
    );
  }

  if (marketStatus === "loading" && !market) {
    return (
      <main className="mx-auto max-w-5xl p-4">
        <p className="text-sm text-muted" role="status">
          Loading market…
        </p>
      </main>
    );
  }

  if (marketStatus === "error" || !market) {
    return (
      <main className="mx-auto max-w-5xl space-y-4 p-4">
        <Link to="/markets" className="text-sm text-muted hover:text-ink">
          ← Back to markets
        </Link>
        <p className="text-sm text-muted">
          {marketError ?? "Market not found."}
        </p>
      </main>
    );
  }

  const settlementPnl =
    position && position.cost_basis_credits > 0
      ? position.realized_pnl !== 0
        ? position.realized_pnl
        : position.unrealized_pnl
      : null;

  const statusLabel =
    market.status === "resolved" && market.resolution_outcome
      ? `${formatMarketStatus(market.status)} · ${outcomeResolvedLabel(market.resolution_outcome === "yes")}`
      : formatMarketStatus(market.status);

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div>
        <Link
          to="/markets"
          className="text-sm text-muted hover:text-ink"
        >
          ← Back to markets
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-semibold text-ink">
              {market.title}
            </h1>
            <p className="mt-2 max-w-3xl text-base text-muted">
              {market.description}
            </p>
          </div>
          <span className="rounded-full border border-line px-3 py-1 text-sm text-muted">
            {statusLabel}
          </span>
        </div>

        {market.status === "resolved" && market.resolution_outcome && (
          <ResolvedOutcomeBanner
            outcome={market.resolution_outcome}
            resolvedAt={market.resolved_at}
            settlementPnl={settlementPnl}
          />
        )}

        <ProbabilityBar yesPriceBps={liveYesPriceBps} className="mt-6" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <PriceChart
            priceHistory={priceHistory}
            currentYesPriceBps={liveYesPriceBps}
            loading={tradesStatus === "loading"}
          />
          <TradeFeed
            trades={trades}
            loading={tradesStatus === "loading"}
            error={tradesError}
            realtimeConnected={realtimeConnected}
          />
        </div>

        <div className="space-y-6">
          <TradePanel market={market} onTradeSuccess={handleTradeSuccess} />
          <MarketInsight marketId={marketId} />
        </div>
      </div>
    </main>
  );
}
