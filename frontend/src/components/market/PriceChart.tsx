/**
 * YES price history chart (Recharts).
 *
 * X = trade time, Y = YES price in [0, 1]. Uses DESIGN tokens via CSS variables.
 */

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatPriceFromBps } from "../../lib/marketFormat";
import {
  latestYesPriceBps,
  toChartRows,
  type ChartRow,
} from "../../lib/priceChart";
import type { PricePoint } from "../../types/market";

interface PriceChartProps {
  priceHistory: PricePoint[];
  currentYesPriceBps: number;
  loading?: boolean;
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartRow }>;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-btn border border-line bg-card px-3 py-2 shadow-sm">
      <p className="font-data text-sm tabular-nums text-ink">
        YES {formatPriceFromBps(row.yes_price_bps)}
      </p>
      <p className="mt-0.5 text-xs text-muted">{row.timeLabel}</p>
    </div>
  );
}

export default function PriceChart({
  priceHistory,
  currentYesPriceBps,
  loading = false,
}: PriceChartProps) {
  const data = toChartRows(priceHistory);
  const latestBps = latestYesPriceBps(priceHistory, currentYesPriceBps);

  return (
    <section className="rounded-card border border-line bg-card p-4 md:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-base font-semibold text-ink">
          Price history
        </h2>
        {data.length > 0 && (
          <p className="font-data text-sm tabular-nums text-muted">
            {data.length} trade{data.length === 1 ? "" : "s"} · YES{" "}
            <span className="text-ink">{formatPriceFromBps(latestBps)}</span>
          </p>
        )}
      </div>

      {loading && data.length === 0 ? (
        <p className="mt-3 text-sm text-muted" role="status">
          Loading chart data…
        </p>
      ) : data.length === 0 ? (
        <p className="mt-3 text-sm text-muted">
          No trades yet — the chart will appear after the first trade.
        </p>
      ) : (
        <div
          className="mt-4 h-56 w-full"
          role="img"
          aria-label="YES price over time"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                stroke="var(--color-line)"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="timeLabel"
                tick={{ fill: "var(--color-muted)", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "var(--color-line)" }}
                minTickGap={40}
              />
              <YAxis
                domain={[0, 1]}
                ticks={[0, 0.25, 0.5, 0.75, 1]}
                tickFormatter={(value: number) => value.toFixed(2)}
                tick={{ fill: "var(--color-muted)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="yesPrice"
                name="YES"
                stroke="var(--color-yes)"
                strokeWidth={2}
                dot={data.length < 40}
                activeDot={{ r: 4, fill: "var(--color-gold)" }}
                isAnimationActive={data.length < 80}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
