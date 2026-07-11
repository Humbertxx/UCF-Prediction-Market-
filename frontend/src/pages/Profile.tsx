/**
 * Profile page — authenticated account strip + trading stats.
 */

import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import UserProfileSummary from "../components/layout/UserProfileSummary";
import { useAuth } from "../context/AuthContext";
import { useWallet } from "../hooks/useWallet";
import { getMyProfileStats } from "../lib/user";
import { MotionLink } from "../motion/components/MotionButton";
import MotionReveal from "../motion/components/MotionReveal";
import type { CurrentUserProfile } from "../types/user";

export default function Profile() {
  const {
    user,
    isAuthenticated,
    loading: authLoading,
    accessToken,
  } = useAuth();
  const { wallet, status: walletStatus } = useWallet(isAuthenticated);
  const [profileData, setProfileData] = useState<CurrentUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!accessToken) {
      setProfileData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const result = await getMyProfileStats(accessToken);
    setLoading(false);

    if (result.success && result.data) {
      setProfileData(result.data);
      return;
    }

    setProfileData(null);
    setError(result.error ?? "Could not load profile stats.");
  }, [accessToken]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    void loadProfile();
  }, [authLoading, isAuthenticated, loadProfile]);

  if (!authLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <p className="font-display text-sm font-medium uppercase tracking-[0.12em] text-gold-ink">
        Account
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold text-ink">Profile</h1>
      <p className="mt-2 text-base text-muted">
        Cash balance, volume, total P/L, and category breakdown for your trades.
      </p>

      {loading && (
        <p className="mt-8 text-sm text-muted" aria-live="polite">
          Loading profile…
        </p>
      )}

      {!loading && error && (
        <div className="mt-8 space-y-3">
          <p
            className="rounded-btn border border-line bg-card px-3 py-2 text-sm text-ink"
            role="alert"
          >
            {error}
          </p>
          <button
            type="button"
            onClick={() => void loadProfile()}
            className="rounded-btn border border-line bg-card px-4 py-2 text-sm font-medium text-ink hover:bg-surface"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && profileData && (
        <div className="mt-8">
          <UserProfileSummary
            profile={profileData}
            wallet={wallet}
            walletLoading={walletStatus === "loading"}
            isAdmin={Boolean(user?.is_admin)}
          />
        </div>
      )}

      <MotionReveal className="mt-10">
        <div className="rounded-card border border-line bg-card px-6 py-8 text-center">
          <p className="font-display text-lg font-semibold text-ink">
            Ready to move a market?
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Open the board, pick a question, and lock in or doubt with virtual
            credits.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <MotionLink
              to="/markets"
              className="rounded-btn bg-gold px-6 py-3 font-display text-base font-semibold text-ink shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              Go to markets →
            </MotionLink>
            <MotionLink
              to="/portfolio"
              spring={false}
              className="rounded-btn border border-line bg-card px-5 py-3 font-display text-base font-medium text-ink hover:border-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              View portfolio
            </MotionLink>
          </div>
        </div>
      </MotionReveal>
    </main>
  );
}
