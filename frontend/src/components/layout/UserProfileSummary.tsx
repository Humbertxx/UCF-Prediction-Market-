/**
 * Profile trading stats — full layout for the Profile page only.
 * Do not mount this in the navigation bar.
 */

import { Link } from "react-router-dom";

import type { Wallet } from "../../types/market";
import type { CurrentUserProfile } from "../../types/user";

function formatSignedCredits(value: number): string {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toLocaleString()}`;
}

function pnlClass(value: number): string {
  if (value > 0) return "text-yes";
  if (value < 0) return "text-no";
  return "text-muted";
}

function initialsFrom(profile: CurrentUserProfile): string {
  const source = (profile.name?.trim() || profile.username || profile.email).trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase() || "?";
}

interface UserProfileSummaryProps {
  profile: CurrentUserProfile;
  wallet?: Wallet | null;
  walletLoading?: boolean;
  isAdmin?: boolean;
}

export default function UserProfileSummary({
  profile,
  wallet = null,
  walletLoading = false,
  isAdmin = false,
}: UserProfileSummaryProps) {
  const { stats } = profile;
  const initials = initialsFrom(profile);
  const cashLabel = walletLoading
    ? "…"
    : wallet
      ? `${wallet.balance_credits.toLocaleString()} cr`
      : "—";
  const grantLabel = walletLoading
    ? "…"
    : wallet
      ? `${wallet.initial_grant.toLocaleString()} cr`
      : "—";

  return (
    <section className="rounded-card border border-line bg-card p-6">
      <div className="flex flex-wrap items-start gap-4">
        {profile.profilePicture ? (
          <img
            src={profile.profilePicture}
            alt=""
            className="h-14 w-14 shrink-0 rounded-full border border-line object-cover"
          />
        ) : (
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-line bg-surface font-display text-lg font-semibold text-ink"
            aria-hidden
          >
            {initials}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-display text-sm font-medium uppercase tracking-[0.12em] text-gold-ink">
              Your account
            </p>
            {isAdmin && (
              <span className="rounded-full border border-gold/40 bg-gold/15 px-2 py-0.5 text-xs font-medium text-gold-ink">
                Admin
              </span>
            )}
          </div>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink">
            {profile.username}
          </h2>
          {profile.name && profile.name !== profile.username && (
            <p className="mt-0.5 text-sm text-ink">{profile.name}</p>
          )}
          <p className="mt-1 text-sm text-muted">{profile.email}</p>
        </div>
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-muted">Cash</dt>
          <dd className="mt-1 font-data text-sm tabular-nums text-ink">{cashLabel}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Starting grant</dt>
          <dd className="mt-1 font-data text-sm tabular-nums text-ink">{grantLabel}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Total P/L</dt>
          <dd
            className={`mt-1 font-data text-sm tabular-nums ${pnlClass(stats.totalPnlCredits)}`}
          >
            {formatSignedCredits(stats.totalPnlCredits)} cr
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Volume</dt>
          <dd className="mt-1 font-data text-sm tabular-nums text-ink">
            {stats.totalVolumeCredits.toLocaleString()} cr
          </dd>
        </div>
      </dl>

      <div className="mt-6">
        <h3 className="text-sm font-medium text-ink">Category P/L</h3>
        {stats.categoryPnl.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {stats.categoryPnl.map((row) => (
              <li
                key={row.category}
                className="flex items-center justify-between rounded-btn border border-line bg-surface px-3 py-2"
              >
                <span className="text-sm text-ink">{row.category}</span>
                <span
                  className={`font-data text-sm tabular-nums ${pnlClass(row.pnlCredits)}`}
                >
                  {formatSignedCredits(row.pnlCredits)} cr
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted">
            No category P/L yet — place a trade to see a breakdown.
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-3 border-t border-line pt-4">
        <Link
          to="/portfolio"
          className="rounded-btn bg-deck px-4 py-2 text-sm font-medium text-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          View portfolio
        </Link>
        <Link
          to="/markets"
          className="rounded-btn border border-line bg-card px-4 py-2 text-sm font-medium text-ink hover:border-gold"
        >
          Browse markets
        </Link>
      </div>
    </section>
  );
}
