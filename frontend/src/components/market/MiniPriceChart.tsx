/**
 * Compact YES-price sparkline for market cards (Polymarket/Kalshi style).
 *
 * Auto-scales to the series' own min/max so small moves stay legible, colors the
 * line by direction (YES up = green, down = red, flat = muted), and marks the
 * latest price with an end dot. Falls back to a flat baseline at the current
 * price when a market has no trades yet, so every card shows a live line.
 */

import { Line, LineChart, ReferenceDot, ResponsiveContainer, YAxis } from "recharts";

import { toChartRows, type ChartRow } from "../../lib/priceChart";
import type { PricePoint } from "../../types/market";

interface MiniPriceChartProps {
  priceSeries: PricePoint[];
  currentYesPriceBps: number;
  className?: string;
}

function flatBaseline(currentYesPriceBps: number): ChartRow[] {
  const yesPrice = currentYesPriceBps / 10000;
  const point = {
    trade_id: 0,
    timeLabel: "",
    yesPrice,
    yes_price_bps: currentYesPriceBps,
    created_at: "",
  };
  return [point, { ...point, trade_id: 1 }];
}

export default function MiniPriceChart({
  priceSeries,
  currentYesPriceBps,
  className = "",
}: MiniPriceChartProps) {
  const hasSeries = priceSeries.length >= 2;
  const rows = hasSeries ? toChartRows(priceSeries) : flatBaseline(currentYesPriceBps);

  const firstBps = rows[0].yes_price_bps;
  const lastRow = rows[rows.length - 1];
  const lastBps = lastRow.yes_price_bps;
  const color =
    !hasSeries || lastBps === firstBps
      ? "var(--color-muted)"
      : lastBps > firstBps
        ? "var(--color-yes)"
        : "var(--color-no)";

  return (
    <div
      className={`h-16 w-full ${className}`}
      role="img"
      aria-label={
        hasSeries
          ? `YES price trend across ${priceSeries.length} trades`
          : "No trades yet"
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 6, right: 6, bottom: 6, left: 6 }}>
          <YAxis
            hide
            domain={[
              (min: number) => min - 0.02,
              (max: number) => max + 0.02,
            ]}
          />
          <Line
            type="monotone"
            dataKey="yesPrice"
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          {hasSeries && (
            <ReferenceDot
              x={rows.length - 1}
              y={lastRow.yesPrice}
              r={3}
              fill={color}
              stroke="none"
              isFront
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
