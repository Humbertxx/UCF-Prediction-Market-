/**
 * Platform capabilities — links into app surfaces.
 */

import { Link } from "react-router-dom";

import { PLATFORM_FEATURES } from "../../lib/landing";

export default function FeaturesSection() {
  return (
    <section
      className="border-b border-line bg-surface py-16 sm:py-20"
      aria-labelledby="platform-features-heading"
    >
      <div className="mx-auto max-w-6xl px-4">
        <p className="font-display text-sm font-medium uppercase tracking-[0.12em] text-gold-ink">
          Platform
        </p>
        <h2
          id="platform-features-heading"
          className="mt-2 font-display text-3xl font-semibold text-ink"
        >
          Built for demo clarity
        </h2>
        <p className="mt-3 max-w-2xl text-base text-muted">
          Trading pages keep the probability bar as the visual hero. The landing
          page explains the product; the market detail page shows the live signal.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PLATFORM_FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="flex flex-col rounded-card border border-line bg-card p-6"
            >
              <h3 className="font-display text-lg font-semibold text-ink">
                {feature.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                {feature.body}
              </p>
              <Link
                to={feature.href}
                className="mt-4 inline-flex text-sm font-medium text-ink underline-offset-2 hover:text-gold-ink hover:underline"
              >
                {feature.cta} →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
