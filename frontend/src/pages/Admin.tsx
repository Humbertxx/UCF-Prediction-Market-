/**
 * Admin page — bot simulation and market resolution.
 */

import { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useMarkets } from "../hooks/useMarket";
import {
  getSimulationStatus,
  resolveMarket,
  simulateBurst,
  startSimulation,
  stopSimulation,
  type SimulateStatus,
} from "../lib/api";
import {
  formatMarketStatus,
  formatPriceFromBps,
  isMarketTradeable,
} from "../lib/marketFormat";
import { OUTCOME } from "../lib/terminology";
import type { MarketSummary } from "../types/market";

type BusyAction =
  | "start"
  | "stop"
  | "burst-belief"
  | "burst-scripted"
  | "resolve-yes"
  | "resolve-no"
  | null;

export default function Admin() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { markets, status, error, refresh } = useMarkets();
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [busyMarketId, setBusyMarketId] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<BusyAction>(null);
  const [simStatus, setSimStatus] = useState<Record<string, SimulateStatus>>({});

  const refreshSimStatuses = useCallback(async (rows: MarketSummary[]) => {
    const tradeable = rows.filter((m) => isMarketTradeable(m.status));
    const results = await Promise.all(
      tradeable.map(async (market) => {
        const result = await getSimulationStatus(market.id);
        return result.success && result.data
          ? ([market.id, result.data] as const)
          : null;
      }),
    );
    const next: Record<string, SimulateStatus> = {};
    for (const row of results) {
      if (row) next[row[0]] = row[1];
    }
    setSimStatus(next);
  }, []);

  useEffect(() => {
    if (status !== "success" || markets.length === 0) return;
    void refreshSimStatuses(markets);
  }, [status, markets, refreshSimStatuses]);

  // Poll running simulations so trade counts update while bots are live.
  useEffect(() => {
    const runningIds = Object.values(simStatus)
      .filter((s) => s.running)
      .map((s) => s.market_id);
    if (runningIds.length === 0) return;

    const timer = window.setInterval(() => {
      void (async () => {
        const updates = await Promise.all(
          runningIds.map(async (id) => {
            const result = await getSimulationStatus(id);
            return result.success && result.data
              ? ([id, result.data] as const)
              : null;
          }),
        );
        setSimStatus((prev) => {
          const next = { ...prev };
          for (const row of updates) {
            if (row) next[row[0]] = row[1];
          }
          return next;
        });
        void refresh();
      })();
    }, 3000);

    return () => window.clearInterval(timer);
  }, [simStatus, refresh]);

  if (!authLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!authLoading && !user?.is_admin) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-display text-2xl font-semibold text-ink">Admin</h1>
        <p className="mt-4 text-sm text-muted">Admin access required.</p>
        <Link to="/markets" className="mt-6 inline-block text-sm text-ink underline">
          Back to markets
        </Link>
      </main>
    );
  }

  const runAction = async (
    marketId: string,
    action: BusyAction,
    fn: () => Promise<void>,
  ) => {
    setBusyMarketId(marketId);
    setBusyAction(action);
    setActionError(null);
    setActionMessage(null);
    try {
      await fn();
    } finally {
      setBusyMarketId(null);
      setBusyAction(null);
    }
  };

  const handleStart = (marketId: string) =>
    runAction(marketId, "start", async () => {
      const result = await startSimulation(marketId);
      if (!result.success || !result.data) {
        setActionError(result.error ?? "Could not start simulation.");
        return;
      }
      setSimStatus((prev) => ({ ...prev, [marketId]: result.data! }));
      setActionMessage("Belief simulation started (trades every 1–3s).");
    });

  const handleStop = (marketId: string) =>
    runAction(marketId, "stop", async () => {
      const result = await stopSimulation(marketId);
      if (!result.success || !result.data) {
        setActionError(result.error ?? "Could not stop simulation.");
        return;
      }
      setSimStatus((prev) => ({ ...prev, [marketId]: result.data! }));
      setActionMessage(
        `Simulation stopped · ${result.data.trades_executed} bot trade(s).`,
      );
      void refresh();
    });

  const handleBurst = (
    marketId: string,
    mode: "belief" | "scripted",
    tradeCount = 10,
  ) =>
    runAction(
      marketId,
      mode === "belief" ? "burst-belief" : "burst-scripted",
      async () => {
        const result = await simulateBurst(marketId, {
          mode,
          trade_count: tradeCount,
        });
        if (!result.success || !result.data) {
          setActionError(result.error ?? "Burst simulation failed.");
          return;
        }
        setActionMessage(
          `Burst (${mode}): ${result.data.trades_executed} trade(s) · ${OUTCOME.yes.label} now ${formatPriceFromBps(result.data.yes_price_bps)}`,
        );
        void refresh();
        void refreshSimStatuses(markets);
      },
    );

  const handleResolve = (marketId: string, outcome: "yes" | "no") =>
    runAction(
      marketId,
      outcome === "yes" ? "resolve-yes" : "resolve-no",
      async () => {
        // Stop bots before resolving so they don't race the closed market.
        const sim = simStatus[marketId];
        if (sim?.running) {
          await stopSimulation(marketId);
        }
        const result = await resolveMarket(marketId, { outcome });
        if (!result.success || !result.data) {
          setActionError(result.error ?? "Resolution failed.");
          return;
        }
        setActionMessage(
          `Resolved ${outcome.toUpperCase()} · ${result.data.positions_settled} position(s) · ${result.data.total_payout_credits.toLocaleString()} cr paid out`,
        );
        void refresh();
      },
    );

  const openMarkets = markets.filter((market) => market.status !== "resolved");
  const resolvedMarkets = markets.filter((market) => market.status === "resolved");
  const isBusy = (marketId: string, action: BusyAction) =>
    busyMarketId === marketId && busyAction === action;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <p className="font-display text-sm font-medium uppercase tracking-[0.12em] text-gold-ink">
        Admin
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
        Simulation & resolution
      </h1>
      <p className="mt-2 max-w-2xl text-base text-muted">
        Start bot traders to move prices toward each market&apos;s hidden truth,
        then resolve and pay out when the demo is ready.
      </p>

      {actionMessage && (
        <p
          className="mt-6 rounded-btn border border-line bg-card px-4 py-3 text-sm text-ink"
          role="status"
        >
          {actionMessage}
        </p>
      )}

      {actionError && (
        <p
          className="mt-6 rounded-btn border border-line bg-card px-4 py-3 text-sm text-no"
          role="alert"
        >
          {actionError}
        </p>
      )}

      {status === "loading" && (
        <p className="mt-8 text-sm text-muted">Loading markets…</p>
      )}

      {status === "error" && (
        <p className="mt-8 text-sm text-muted" role="alert">
          {error}
        </p>
      )}

      {status === "success" && (
        <div className="mt-8 space-y-10">
          <section>
            <h2 className="font-display text-lg font-semibold text-ink">
              Bot simulation
            </h2>
            <p className="mt-1 text-sm text-muted">
              Belief bots trade every 1–3s. Burst runs a quick batch for demos.
            </p>

            {openMarkets.filter((m) => isMarketTradeable(m.status)).length ===
            0 ? (
              <p className="mt-3 text-sm text-muted">
                No open markets available to simulate.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {openMarkets
                  .filter((m) => isMarketTradeable(m.status))
                  .map((market) => {
                    const sim = simStatus[market.id];
                    const running = sim?.running ?? false;
                    return (
                      <li
                        key={market.id}
                        className="rounded-card border border-line bg-card px-4 py-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-display font-medium text-ink">
                              {market.title}
                            </p>
                            <p className="mt-1 font-data text-sm tabular-nums text-muted">
                              {OUTCOME.yes.label} {formatPriceFromBps(market.yes_price_bps)} ·{" "}
                              {formatMarketStatus(market.status)}
                              {running && (
                                <>
                                  {" "}
                                  ·{" "}
                                  <span className="text-gold-ink">
                                    simulating
                                  </span>{" "}
                                  · {sim?.trades_executed ?? 0} trades
                                </>
                              )}
                            </p>
                            {sim?.last_reason && (
                              <p className="mt-1 max-w-xl text-xs text-muted">
                                {sim.last_reason}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {running ? (
                              <button
                                type="button"
                                disabled={busyMarketId === market.id}
                                onClick={() => void handleStop(market.id)}
                                className="rounded-btn border border-line bg-deck px-3 py-2 text-sm font-medium text-card disabled:opacity-50"
                              >
                                {isBusy(market.id, "stop")
                                  ? "Stopping…"
                                  : "Stop"}
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={busyMarketId === market.id}
                                onClick={() => void handleStart(market.id)}
                                className="rounded-btn bg-deck px-3 py-2 text-sm font-medium text-card disabled:opacity-50"
                              >
                                {isBusy(market.id, "start")
                                  ? "Starting…"
                                  : "Simulate"}
                              </button>
                            )}
                            <button
                              type="button"
                              disabled={busyMarketId === market.id || running}
                              onClick={() =>
                                void handleBurst(market.id, "belief", 10)
                              }
                              className="rounded-btn border border-line px-3 py-2 text-sm text-ink hover:border-gold disabled:opacity-50"
                            >
                              {isBusy(market.id, "burst-belief")
                                ? "Bursting…"
                                : "Burst belief"}
                            </button>
                            <button
                              type="button"
                              disabled={busyMarketId === market.id || running}
                              onClick={() =>
                                void handleBurst(market.id, "scripted", 8)
                              }
                              className="rounded-btn border border-line px-3 py-2 text-sm text-ink hover:border-gold disabled:opacity-50"
                            >
                              {isBusy(market.id, "burst-scripted")
                                ? "Bursting…"
                                : "Burst scripted"}
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
              </ul>
            )}
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">
              Market resolution ({openMarkets.length})
            </h2>
            {openMarkets.length === 0 ? (
              <p className="mt-3 text-sm text-muted">No open markets to resolve.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {openMarkets.map((market) => (
                  <li
                    key={market.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-card px-4 py-4"
                  >
                    <div>
                      <p className="font-display font-medium text-ink">
                        {market.title}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {formatMarketStatus(market.status)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={busyMarketId === market.id}
                        onClick={() => void handleResolve(market.id, "yes")}
                        className="rounded-btn bg-yes px-3 py-2 text-sm font-medium text-card disabled:opacity-50"
                      >
                        {isBusy(market.id, "resolve-yes")
                          ? "Resolving…"
                          : `Resolve ${OUTCOME.yes.resolved}`}
                      </button>
                      <button
                        type="button"
                        disabled={busyMarketId === market.id}
                        onClick={() => void handleResolve(market.id, "no")}
                        className="rounded-btn bg-no px-3 py-2 text-sm font-medium text-card disabled:opacity-50"
                      >
                        {isBusy(market.id, "resolve-no")
                          ? "Resolving…"
                          : `Resolve ${OUTCOME.no.resolved}`}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {resolvedMarkets.length > 0 && (
            <section>
              <h2 className="font-display text-lg font-semibold text-ink">
                Resolved ({resolvedMarkets.length})
              </h2>
              <ul className="mt-4 space-y-2">
                {resolvedMarkets.map((market) => (
                  <li
                    key={market.id}
                    className="rounded-card border border-line bg-surface px-4 py-3 text-sm text-muted"
                  >
                    {market.title}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      <p className="mt-10 text-center text-sm text-muted">
        Simulation - virtual credits - no cash value ·{" "}
        <Link to="/markets" className="text-ink underline-offset-2 hover:underline">
          View markets
        </Link>
      </p>
    </main>
  );
}
