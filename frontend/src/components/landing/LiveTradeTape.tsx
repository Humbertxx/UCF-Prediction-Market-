/**
 * Static historic trade prints for the live-demo section —
 * two rows of recent trades between market cards and the review ticker.
 */

const TRADES = [
  { side: "YES", market: "Knights win opener", size: 120, price: "64¢", when: "2m ago" },
  { side: "NO", market: "R1 open by 9am", size: 80, price: "41¢", when: "5m ago" },
  { side: "YES", market: "Enrollment > 70k", size: 200, price: "58¢", when: "8m ago" },
  { side: "NO", market: "Rain delay Friday", size: 45, price: "33¢", when: "12m ago" },
  { side: "YES", market: "Finals week surge", size: 95, price: "71¢", when: "18m ago" },
  { side: "NO", market: "Parking lot full", size: 60, price: "47¢", when: "24m ago" },
] as const;

export default function LiveTradeTape() {
  return (
    <div className="mx-auto mt-12 w-full max-w-6xl px-4" aria-hidden="true">
      <div className="mb-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-landing-line to-landing-line" />
        <p className="shrink-0 font-display text-xs tracking-widest text-landing-muted uppercase">
          Recent prints
        </p>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-landing-line to-landing-line" />
      </div>

      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:grid-rows-2">
        {TRADES.map((trade) => {
          const isYes = trade.side === "YES";
          return (
            <li
              key={`${trade.market}-${trade.when}`}
              className="flex items-center gap-3 rounded-btn border border-landing-line bg-landing-panel px-3 py-2.5"
            >
              <span
                className={[
                  "shrink-0 font-data text-xs font-semibold",
                  isYes ? "text-yes" : "text-no",
                ].join(" ")}
              >
                {trade.side}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm text-landing-ink">
                {trade.market}
              </span>
              <span className="shrink-0 font-data text-xs tabular-nums text-landing-muted">
                {trade.size}
              </span>
              <span className="shrink-0 font-data text-xs tabular-nums text-gold">
                {trade.price}
              </span>
              <span className="hidden shrink-0 font-data text-[11px] text-landing-muted sm:inline">
                {trade.when}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
