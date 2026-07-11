/**
 * Decorative prediction-market backdrop for Campus Demo.
 * Two volatile Lock/Doubt lines — fixed frame, fake odds only.
 */

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

const VIEW_W = 900;
const VIEW_H = 320;
const POINT_COUNT = 40;
const TICK_MS = 480;

type SeriesKey = "yes" | "no";

type SeriesConfig = {
  key: SeriesKey;
  color: string;
  /** Midline Y (lower = higher on chart). */
  center: number;
  band: number;
  tickSize: number;
  jumpChance: number;
  strokeWidth: number;
  seed: number;
};

/**
 * Two complementary odds bands — Lock near top, Doubt near bottom,
 * loosely summing toward a market-style split.
 */
const SERIES: SeriesConfig[] = [
  {
    key: "yes",
    color: "var(--color-yes)",
    center: 110,
    band: 48,
    tickSize: 5,
    jumpChance: 0.16,
    strokeWidth: 2.25,
    seed: 11,
  },
  {
    key: "no",
    color: "var(--color-no)",
    center: 210,
    band: 48,
    tickSize: 5,
    jumpChance: 0.16,
    strokeWidth: 2.25,
    seed: 73,
  },
];

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Volatility rises toward the live (right) edge. */
function edgeVolatility(index: number): number {
  const t = index / (POINT_COUNT - 1);
  return 0.75 + t * t * 1.4;
}

function seedWalk(s: SeriesConfig, rand: () => number): number[] {
  const ys: number[] = [];
  let y = s.center;
  for (let i = 0; i < POINT_COUNT; i++) {
    const vol = edgeVolatility(i);
    const shock = rand() < s.jumpChance ? 1.8 + rand() * 2 : 1;
    y = clamp(
      y + (rand() - 0.48) * s.tickSize * 2 * vol * shock,
      s.center - s.band,
      s.center + s.band,
    );
    ys.push(Math.round(y));
  }
  return ys;
}

function printTick(
  prev: number[],
  s: SeriesConfig,
  rand: () => number,
): number[] {
  const next = prev.slice(1);
  let y = prev[prev.length - 1];
  const vol = edgeVolatility(POINT_COUNT - 1);
  const shock = rand() < s.jumpChance ? 2 + rand() * 2.4 : 1;
  const pull = (s.center - y) * 0.045;
  y = clamp(
    y + (rand() - 0.5) * s.tickSize * 2.2 * vol * shock + pull,
    s.center - s.band,
    s.center + s.band,
  );
  next.push(Math.round(y));
  return next;
}

/**
 * When Lock jumps, nudge Doubt the other way so the pair still reads as
 * a prediction-market split (not two unrelated walks).
 */
function couplePrints(
  yes: number[],
  no: number[],
  rand: () => number,
): { yes: number[]; no: number[] } {
  const nextYes = printTick(yes, SERIES[0], rand);
  const nextNo = printTick(no, SERIES[1], rand);

  const yesDelta = nextYes[nextYes.length - 1] - yes[yes.length - 1];
  // Opposite nudge on Doubt (Y coords: Lock down = price up → Doubt should rise in Y).
  const couple = yesDelta * (0.35 + rand() * 0.35);
  const last = nextNo.length - 1;
  nextNo[last] = Math.round(
    clamp(
      nextNo[last] - couple,
      SERIES[1].center - SERIES[1].band,
      SERIES[1].center + SERIES[1].band,
    ),
  );

  return { yes: nextYes, no: nextNo };
}

/** Step-after path — flat hold then vertical print. */
function toStepPath(ys: number[]): string {
  const stepX = VIEW_W / (POINT_COUNT - 1);
  let d = `M 0 ${ys[0]}`;
  for (let i = 1; i < ys.length; i++) {
    const x = i * stepX;
    d += ` L ${x} ${ys[i - 1]} L ${x} ${ys[i]}`;
  }
  return d;
}

export default function DecorativeMarketGraph() {
  const reduceMotion = useReducedMotion();
  const randRef = useRef(mulberry32(2027));
  const seriesRef = useRef({
    yes: seedWalk(SERIES[0], mulberry32(SERIES[0].seed * 9973)),
    no: seedWalk(SERIES[1], mulberry32(SERIES[1].seed * 9973)),
  });
  const pathRefs = useRef<Record<SeriesKey, SVGPathElement | null>>({
    yes: null,
    no: null,
  });
  const tipRefs = useRef<Record<SeriesKey, SVGCircleElement | null>>({
    yes: null,
    no: null,
  });
  const tipGlowRefs = useRef<Record<SeriesKey, SVGCircleElement | null>>({
    yes: null,
    no: null,
  });

  const initial = SERIES.map((s) => {
    const ys = seriesRef.current[s.key];
    return {
      key: s.key,
      d: toStepPath(ys),
      tipY: ys[ys.length - 1],
      color: s.color,
      strokeWidth: s.strokeWidth,
    };
  });

  useEffect(() => {
    const paint = () => {
      for (const s of SERIES) {
        const ys = seriesRef.current[s.key];
        const d = toStepPath(ys);
        pathRefs.current[s.key]?.setAttribute("d", d);
        const tipY = ys[ys.length - 1];
        tipRefs.current[s.key]?.setAttribute("cy", String(tipY));
        tipGlowRefs.current[s.key]?.setAttribute("cy", String(tipY));
      }
    };

    paint();
    if (reduceMotion) return;

    const id = window.setInterval(() => {
      const { yes, no } = couplePrints(
        seriesRef.current.yes,
        seriesRef.current.no,
        randRef.current,
      );
      seriesRef.current = { yes, no };
      paint();
    }, TICK_MS);

    return () => window.clearInterval(id);
  }, [reduceMotion]);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.58]"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {[70, 115, 160, 205, 250].map((y) => (
          <line
            key={y}
            x1={0}
            y1={y}
            x2={VIEW_W}
            y2={y}
            stroke="currentColor"
            className="text-card/14"
            strokeWidth={1}
            strokeDasharray="2 8"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {initial.map((p) => (
          <g key={p.key}>
            <path
              ref={(el) => {
                pathRefs.current[p.key] = el;
              }}
              d={p.d}
              fill="none"
              stroke={p.color}
              strokeWidth={p.strokeWidth}
              strokeLinecap="square"
              strokeLinejoin="miter"
              vectorEffect="non-scaling-stroke"
            />
            <circle
              ref={(el) => {
                tipGlowRefs.current[p.key] = el;
              }}
              cx={VIEW_W}
              cy={p.tipY}
              r={6}
              fill={p.color}
              opacity={0.25}
            />
            <circle
              ref={(el) => {
                tipRefs.current[p.key] = el;
              }}
              cx={VIEW_W}
              cy={p.tipY}
              r={2.75}
              fill={p.color}
            />
          </g>
        ))}
      </svg>

      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-deck via-deck/70 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-deck via-deck/50 to-transparent" />
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-deck to-transparent sm:w-28" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-deck to-transparent sm:w-28" />
    </div>
  );
}
