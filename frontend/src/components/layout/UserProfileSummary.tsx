/**
 * Profile trading stats — full layout for the Profile page only.
 * Do not mount this in the navigation bar.
 */

import type { CurrentUserProfile } from "../../types/user";

function formatCredits(value: number): string {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toLocaleString()}`;
}

function pnlClass(value: number): string {
  if (value > 0) return "text-yes";
  if (value < 0) return "text-no";
  return "text-muted";
}

interface UserProfileSummaryProps {
  profile: CurrentUserProfile;
}

export default function UserProfileSummary({ profile }: UserProfileSummaryProps) {
  const { stats } = profile;

  return (
    <section className="rounded-card border border-line bg-card p-6">
      <p className="font-display text-sm font-medium uppercase tracking-[0.12em] text-gold-ink">
        Your account
      </p>
      <h2 className="mt-2 font-display text-2xl font-semibold text-ink">
        {profile.username}
      </h2>
      <p className="mt-1 text-sm text-muted">{profile.email}</p>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-muted">Total P/L</dt>
          <dd
            className={`mt-1 font-data text-sm tabular-nums ${pnlClass(stats.totalPnlCredits)}`}
          >
            {formatCredits(stats.totalPnlCredits)} cr
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Volume</dt>
          <dd className="mt-1 font-data text-sm tabular-nums text-ink">
            {stats.totalVolumeCredits.toLocaleString()} cr
          </dd>
        </div>
      </dl>

      {stats.categoryPnl.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-ink">Category P/L</h3>
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
                  {formatCredits(row.pnlCredits)} cr
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
