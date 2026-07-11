/**
 * Home — entry point into markets and demo login.
 */

import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <p className="font-display text-sm font-medium uppercase tracking-[0.16em] text-gold-ink">
        BloomKnights · UCF
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
        UCF Prediction Market
      </h1>
      <p className="mt-4 max-w-xl text-lg text-muted">
        Virtual-credit YES/NO markets. Log in to trade; prices move through a
        constant-product AMM.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        {isAuthenticated ? (
          <Link
            to="/markets"
            className="rounded-btn bg-deck px-5 py-2.5 font-display font-medium text-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            Open markets
          </Link>
        ) : (
          <Link
            to="/login"
            className="rounded-btn bg-deck px-5 py-2.5 font-display font-medium text-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            Log in to trade
          </Link>
        )}
        {isAuthenticated && (
          <Link
            to="/portfolio"
            className="rounded-btn border border-line bg-card px-5 py-2.5 font-display font-medium text-ink"
          >
            View portfolio
          </Link>
        )}
        <Link
          to="/markets"
          className="rounded-btn border border-line bg-card px-5 py-2.5 font-display font-medium text-ink"
        >
          Browse markets
        </Link>
      </div>

      {isAuthenticated && user && (
        <p className="mt-6 font-data text-sm text-muted">
          Signed in as {user.name ?? user.email}
          {user.is_admin ? " · admin" : ""}.{" "}
          <Link to="/portfolio" className="text-ink underline-offset-2 hover:underline">
            Open portfolio
          </Link>
        </p>
      )}
    </main>
  );
}
