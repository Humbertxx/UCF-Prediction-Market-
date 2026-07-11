/**
 * Portfolio page — Kalshi-style open positions and settled market history.
 */

import { useState } from "react";
import { Link, Navigate } from "react-router-dom";

import PortfolioActivityTable from "../components/portfolio/PortfolioActivityTable";
import PortfolioPositionTable from "../components/portfolio/PortfolioPositionTable";
import PortfolioSummary from "../components/portfolio/PortfolioSummary";
import { useAuth } from "../context/AuthContext";
import { usePortfolio } from "../hooks/usePositions";
import { useMyTradeHistory } from "../hooks/useTradeHistory";
import { useWallet } from "../hooks/useWallet";

type PortfolioTab = "open" | "history" | "activity";

export default function Portfolio() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<PortfolioTab>("open");
  const { open, history, status, error, refresh } = usePortfolio(isAuthenticated);
  const {
    trades: activity,
    status: activityStatus,
    error: activityError,
    refresh: refreshActivity,
  } = useMyTradeHistory(isAuthenticated);
  const { wallet, status: walletStatus } = useWallet(isAuthenticated);

  if (!authLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const tabClass = (value: PortfolioTab) =>
    [
      "rounded-btn px-4 py-2 text-sm font-medium transition",
      tab === value
        ? "bg-deck text-card"
        : "border border-line bg-card text-muted hover:text-ink",
    ].join(" ");

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-display text-sm font-medium uppercase tracking-[0.12em] text-gold-ink">
            Portfolio
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
            Your positions
          </h1>
          <p className="mt-2 max-w-2xl text-base text-muted">
            Open contracts and settled markets you have traded in — similar to a
            Kalshi portfolio view.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            void refresh();
            void refreshActivity();
          }}
          disabled={status === "loading" || activityStatus === "loading"}
          className="rounded-btn border border-line bg-card px-4 py-2 text-sm text-ink hover:border-gold disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      <div className="mt-8">
        <PortfolioSummary
          wallet={wallet}
          openPositions={open}
          walletLoading={walletStatus === "loading"}
        />
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <button type="button" className={tabClass("open")} onClick={() => setTab("open")}>
          Open positions ({open.length})
        </button>
        <button
          type="button"
          className={tabClass("history")}
          onClick={() => setTab("history")}
        >
          Market history ({history.length})
        </button>
        <button
          type="button"
          className={tabClass("activity")}
          onClick={() => setTab("activity")}
        >
          Activity ({activity.length})
        </button>
      </div>

      {(status === "loading" || (tab === "activity" && activityStatus === "loading")) && (
        <p className="mt-8 text-sm text-muted" aria-live="polite">
          Loading portfolio…
        </p>
      )}

      {status === "error" && tab !== "activity" && (
        <div className="mt-8 rounded-card border border-line bg-card p-6">
          <p className="text-sm text-muted" role="alert">
            {error}
          </p>
          <button
            type="button"
            onClick={() => void refresh()}
            className="mt-3 rounded-btn bg-deck px-4 py-2 text-sm font-medium text-card"
          >
            Try again
          </button>
        </div>
      )}

      {tab === "activity" && activityStatus === "error" && (
        <div className="mt-8 rounded-card border border-line bg-card p-6">
          <p className="text-sm text-muted" role="alert">
            {activityError}
          </p>
          <button
            type="button"
            onClick={() => void refreshActivity()}
            className="mt-3 rounded-btn bg-deck px-4 py-2 text-sm font-medium text-card"
          >
            Try again
          </button>
        </div>
      )}

      {status !== "loading" && status !== "error" && tab !== "activity" && (
        <div className="mt-6">
          {tab === "open" ? (
            <PortfolioPositionTable
              positions={open}
              variant="open"
              emptyMessage="No open positions. Browse markets and place a trade to get started."
            />
          ) : (
            <PortfolioPositionTable
              positions={history}
              variant="history"
              emptyMessage="No settled markets yet. Resolved markets you traded in will appear here."
            />
          )}
        </div>
      )}

      {tab === "activity" && activityStatus !== "loading" && activityStatus !== "error" && (
        <div className="mt-6">
          <PortfolioActivityTable
            trades={activity}
            emptyMessage="No trades yet. Your buy orders will show up here."
          />
        </div>
      )}

      <p className="mt-8 text-center text-sm text-muted">
        <Link to="/markets" className="text-ink underline-offset-2 hover:underline">
          Browse markets
        </Link>
        {" · "}
        <Link to="/profile" className="text-ink underline-offset-2 hover:underline">
          Account stats
        </Link>
      </p>
    </main>
  );
}
