/**
 * Signature probability bar — Lock/Doubt split with gold price marker.
 */

import { useEffect, useRef, useState } from "react";

import {
  formatPercentFromBps,
  formatPriceFromBps,
} from "../../lib/marketFormat";
import { OUTCOME } from "../../lib/terminology";

interface ProbabilityBarProps {
  yesPriceBps: number;
  className?: string;
  showLabels?: boolean;
}

export default function ProbabilityBar({
  yesPriceBps,
  className = "",
  showLabels = true,
}: ProbabilityBarProps) {
  const clampedBps = Math.max(0, Math.min(10000, yesPriceBps));
  const yesPercent = clampedBps / 100;
  const noPercent = 100 - yesPercent;

  const prevBpsRef = useRef(clampedBps);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (prevBpsRef.current !== clampedBps) {
      prevBpsRef.current = clampedBps;
      setFlash(true);
      const timer = window.setTimeout(() => setFlash(false), 220);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [clampedBps]);

  return (
    <div className={className}>
      {showLabels && (
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-yes">
              {OUTCOME.yes.label}
            </span>
            <span className="font-data text-lg tabular-nums text-ink">
              {formatPriceFromBps(clampedBps)}
            </span>
            <span className="font-data text-sm tabular-nums text-muted">
              ({formatPercentFromBps(clampedBps)})
            </span>
          </div>
          <div className="flex items-baseline gap-2 text-right">
            <span className="font-data text-sm tabular-nums text-muted">
              {OUTCOME.no.label} {formatPriceFromBps(10000 - clampedBps)}
            </span>
          </div>
        </div>
      )}

      <div
        className={[
          "relative h-3 overflow-hidden rounded-full border border-line bg-card",
          // DESIGN.md §10: disable the gold flash under prefers-reduced-motion.
          flash ? "ring-2 ring-gold/60 motion-reduce:ring-0" : "",
        ].join(" ")}
        role="img"
        aria-label={`${OUTCOME.yes.label} probability ${formatPercentFromBps(clampedBps)}, ${OUTCOME.no.label} ${formatPercentFromBps(10000 - clampedBps)}`}
      >
        <div className="flex h-full w-full">
          <div
            className="h-full bg-yes transition-[width] duration-400 ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none"
            style={{ width: `${yesPercent}%` }}
          />
          <div
            className="h-full bg-no transition-[width] duration-400 ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none"
            style={{ width: `${noPercent}%` }}
          />
        </div>

        <div
          className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-gold shadow-[0_0_6px_rgba(255,201,4,0.8)] transition-[left] duration-400 ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none"
          style={{ left: `${yesPercent}%` }}
          aria-hidden
        />
      </div>
    </div>
  );
}
