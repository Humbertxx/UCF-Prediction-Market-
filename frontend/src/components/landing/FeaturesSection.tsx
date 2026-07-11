/**
 * Platform capabilities — links into app surfaces.
 */

import { Link } from "react-router-dom";

import { PLATFORM_FEATURES, PLATFORM_SECTION } from "../../lib/landing";
import MotionReveal, { MotionRevealItem } from "../../motion/components/MotionReveal";

export default function FeaturesSection() {
  return (
    <MotionReveal
      stagger
      className="border-b border-line bg-surface py-16 sm:py-20"
      aria-labelledby="platform-features-heading"
    >
      <div className="mx-auto max-w-6xl px-4">
        <MotionRevealItem>
          <p className="font-display text-sm font-medium uppercase tracking-[0.12em] text-gold-ink">
            {PLATFORM_SECTION.eyebrow}
          </p>
          <h2
            id="platform-features-heading"
            className="mt-2 font-display text-3xl font-semibold text-ink"
          >
            {PLATFORM_SECTION.title}
          </h2>
          <p className="mt-3 max-w-2xl text-base text-muted">
            {PLATFORM_SECTION.subtitle}
          </p>
        </MotionRevealItem>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PLATFORM_FEATURES.map((feature) => (
            <MotionRevealItem
              key={feature.title}
              as="article"
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
            </MotionRevealItem>
          ))}
        </div>
      </div>
    </MotionReveal>
  );
}
