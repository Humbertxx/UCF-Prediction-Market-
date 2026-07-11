/**
 * How it works — dedicated explainer for Lock/Doubt trading.
 */

import { Link } from "react-router-dom";

import HoverCard from "../components/ui/HoverCard";
import { HOW_IT_WORKS_STEPS, PLATFORM_FEATURES } from "../lib/landing";
import { OUTCOME } from "../lib/terminology";

const DETAILS = [
  {
    title: `${OUTCOME.yes.label} vs ${OUTCOME.no.label}`,
    body: `${OUTCOME.yes.buyLabel} if you think the outcome will happen. ${OUTCOME.no.buyLabel} if you don't. Each side has its own share price from the pool.`,
  },
  {
    title: "Virtual credits only",
    body: "You trade with simulation credits — no cash value. Balances, shares, and payouts stay integers so the demo stays readable on a projector.",
  },
  {
    title: "Prices move with every trade",
    body: "A constant-product pool (x·y = k) reprices after each buy. The odds bar and chart update live so the room can see conviction build.",
  },
] as const;

export default function HowItWorks() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div>
        <p className="font-display text-sm font-medium uppercase tracking-[0.12em] text-gold-ink">
          How it works
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
          Campus questions, exchange-style trading
        </h1>
        <p className="mt-2 max-w-2xl text-base text-muted">
          Each market is a Lock/Doubt contract. Pick a campus question, spend
          credits on your call, and watch the odds move as students trade.
        </p>
      </div>

      <ol className="mt-12 grid items-stretch gap-6 md:grid-cols-3">
        {HOW_IT_WORKS_STEPS.map((item) => (
          <li key={item.step} className="h-full min-h-0">
            <HoverCard
              variant="subtle"
              tone="card"
              className="h-full"
              innerClassName="flex h-full flex-col p-6"
            >
              <span className="font-data text-sm font-medium tabular-nums text-gold-ink">
                {item.step}
              </span>
              <h2 className="mt-3 font-display text-xl font-semibold text-ink">
                {item.title}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                {item.body}
              </p>
            </HoverCard>
          </li>
        ))}
      </ol>

      <section className="mt-16" aria-labelledby="how-details-heading">
        <h2
          id="how-details-heading"
          className="font-display text-2xl font-semibold text-ink"
        >
          What to know before you trade
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
          {DETAILS.map((detail) => (
            <li
              key={detail.title}
              className="rounded-card border border-line bg-card p-5"
            >
              <h3 className="font-display text-base font-semibold text-ink">
                {detail.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {detail.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16" aria-labelledby="how-surfaces-heading">
        <h2
          id="how-surfaces-heading"
          className="font-display text-2xl font-semibold text-ink"
        >
          Where to go next
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {PLATFORM_FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="flex flex-col rounded-card border border-line bg-card p-5"
            >
              <h3 className="font-display text-base font-semibold text-ink">
                {feature.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                {feature.body}
              </p>
              <Link
                to={feature.href}
                className="mt-4 text-sm font-medium text-ink underline-offset-2 hover:text-gold-ink hover:underline"
              >
                {feature.cta} →
              </Link>
            </article>
          ))}
        </div>
      </section>

      <div className="mt-14 flex flex-wrap gap-3">
        <Link
          to="/markets"
          className="rounded-btn bg-gold px-5 py-2.5 font-display font-semibold text-ink"
        >
          View live markets
        </Link>
        <Link
          to="/login"
          className="rounded-btn border border-line bg-card px-5 py-2.5 font-display font-medium text-ink hover:border-gold"
        >
          Log in to trade
        </Link>
      </div>
    </main>
  );
}
