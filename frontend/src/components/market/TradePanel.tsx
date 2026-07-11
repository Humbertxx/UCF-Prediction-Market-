/**
 * Trade panel — amount input and Buy YES / Buy NO actions.
 */

import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { usePlaceTrade } from "../../hooks/useTrades";
import { useWallet } from "../../hooks/useWallet";
import {
  formatPriceFromBps,
  formatResolvedAt,
  isMarketTradeable,
} from "../../lib/marketFormat";
import {
  formatTradeSideAction,
  outcomeBuyLabel,
  outcomeBuyingLabel,
  outcomeResolvedLabel,
} from "../../lib/terminology";
import type { MarketDetail, TradeSide } from "../../types/market";

interface TradePanelProps {
  market: MarketDetail;
  onTradeSuccess: () => void;
}

const QUICK_AMOUNTS = [10, 25, 50, 100];

export default function TradePanel({ market, onTradeSuccess }: TradePanelProps) {
  const { isAuthenticated } = useAuth();
  const { wallet, status: walletStatus, refresh: refreshWallet } = useWallet(
    isAuthenticated,
  );
  const { status, result, error, submit, reset } = usePlaceTrade(() => {
    onTradeSuccess();
    void refreshWallet();
  });

  const [amount, setAmount] = useState("25");
  const tradeable = isMarketTradeable(market.status);
  const parsedAmount = Number.parseInt(amount, 10);
  const amountValid = Number.isFinite(parsedAmount) && parsedAmount > 0;
  const busy = status === "submitting";

  async function handleTrade(side: TradeSide) {
    if (!amountValid || busy || !tradeable) return;
    await submit(market.id, side, parsedAmount);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void handleTrade("yes");
  }

  return (
    <section className="rounded-card border border-line bg-card p-4 md:p-6">
      <h2 className="font-display text-base font-semibold text-ink">Trade</h2>

      {!isAuthenticated && (
        <p className="mt-3 text-sm text-muted">
          <Link to="/login" className="text-ink underline-offset-2 hover:underline">
            Log in
          </Link>{" "}
          to place trades with virtual credits.
        </p>
      )}

      {isAuthenticated && walletStatus === "success" && wallet && (
        <p className="mt-2 font-data text-sm tabular-nums text-muted">
          Balance:{" "}
          <span className="text-ink">{wallet.balance_credits}</span> credits
        </p>
      )}

      {!tradeable && market.status === "resolved" && market.resolution_outcome && (
        <p className="mt-3 text-sm text-muted">
          This market resolved as{" "}
          <span className="font-medium text-ink">
            {outcomeResolvedLabel(market.resolution_outcome === "yes")}
          </span>
          {market.resolved_at
            ? ` on ${formatResolvedAt(market.resolved_at)}`
            : ""}
          .
        </p>
      )}

      {!tradeable && market.status !== "resolved" && (
        <p className="mt-3 text-sm text-muted">
          This market is not open for trading.
        </p>
      )}

      {isAuthenticated && tradeable && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="trade-amount"
              className="block text-sm font-medium text-ink"
            >
              Credits to spend
            </label>
            <input
              id="trade-amount"
              type="number"
              min={1}
              step={1}
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value);
                reset();
              }}
              className="mt-1 w-full rounded-btn border border-line bg-surface px-3 py-2 font-data tabular-nums text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setAmount(String(value));
                    reset();
                  }}
                  className="rounded-full border border-line px-2.5 py-0.5 text-xs text-muted hover:border-gold hover:text-ink"
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={!amountValid || busy}
              onClick={() => void handleTrade("yes")}
              className="rounded-btn bg-yes px-4 py-2.5 font-display font-medium text-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:opacity-50"
            >
              {busy ? outcomeBuyingLabel("yes") : outcomeBuyLabel("yes")}
            </button>
            <button
              type="button"
              disabled={!amountValid || busy}
              onClick={() => void handleTrade("no")}
              className="rounded-btn bg-no px-4 py-2.5 font-display font-medium text-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:opacity-50"
            >
              {busy ? outcomeBuyingLabel("no") : outcomeBuyLabel("no")}
            </button>
          </div>
        </form>
      )}

      {status === "success" && result && (
        <p className="mt-4 font-data text-sm tabular-nums text-ink" role="status">
          {formatTradeSideAction(result.side, result.shares)} @{" "}
          {formatPriceFromBps(result.yes_price_bps)} · Balance{" "}
          {result.balance_after}
        </p>
      )}

      {status === "error" && error && (
        <p className="mt-4 text-sm text-muted" role="alert">
          {error}
        </p>
      )}

      <p className="mt-4 text-xs text-muted">
        Simulation - virtual credits - no cash value
      </p>
    </section>
  );
}
