/**
 * Profile page — authenticated trading stats for the signed-in user.
 */

import { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";

import UserProfileSummary from "../components/layout/UserProfileSummary";
import { useAuth } from "../context/AuthContext";
import { getMyProfileStats } from "../lib/user";
import type { CurrentUserProfile } from "../types/user";

export default function Profile() {
  const { isAuthenticated, loading: authLoading, accessToken } = useAuth();
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
        Username, volume, total P/L, and category breakdown for your trades.
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
          <UserProfileSummary profile={profileData} />
        </div>
      )}

      <p className="mt-8 text-center text-sm text-muted">
        <Link to="/markets" className="text-ink underline-offset-2 hover:underline">
          Back to markets
        </Link>
      </p>
    </main>
  );
}
