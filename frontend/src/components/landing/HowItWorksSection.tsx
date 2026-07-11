/**
 * “How it works” — three-step explainer band.
 */

import { HOW_IT_WORKS_STEPS } from "../../lib/landing";
import MotionReveal, { MotionRevealItem } from "../../motion/components/MotionReveal";

export default function HowItWorksSection() {
  return (
    <MotionReveal
      stagger
      className="border-b border-line bg-surface py-16 sm:py-20"
      aria-labelledby="how-it-works-heading"
    >
      <div className="mx-auto max-w-6xl px-4">
        <MotionRevealItem>
          <p className="font-display text-sm font-medium uppercase tracking-[0.12em] text-gold-ink">
            How it works
          </p>
          <h2
            id="how-it-works-heading"
            className="mt-2 font-display text-3xl font-semibold text-ink"
          >
            Campus questions, exchange-style trading
          </h2>
          <p className="mt-3 max-w-2xl text-base text-muted">
            Each market is a Lock/Doubt contract priced by a constant-product pool.
            You trade virtual credits — the interface stays data-forward so odds
            are readable from across the room.
          </p>
        </MotionRevealItem>

        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {HOW_IT_WORKS_STEPS.map((item) => (
            <MotionRevealItem
              key={item.step}
              as="li"
              className="rounded-card border border-line bg-card p-6"
            >
              <span className="font-data text-sm font-medium tabular-nums text-gold-ink">
                {item.step}
              </span>
              <h3 className="mt-3 font-display text-xl font-semibold text-ink">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {item.body}
              </p>
            </MotionRevealItem>
          ))}
        </ol>
      </div>
    </MotionReveal>
  );
}
