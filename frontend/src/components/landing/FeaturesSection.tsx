/**
 * Platform capabilities — links into app surfaces.
 */

import { Link } from "react-router-dom";

import HoverCard from "../ui/HoverCard";
import { PLATFORM_FEATURES, PLATFORM_SECTION } from "../../lib/landing";
import MotionReveal, { MotionRevealItem } from "../../motion/components/MotionReveal";

export default function FeaturesSection() {
  return (
    <MotionReveal
      stagger
      className="border-b border-landing-line bg-landing-panel py-16 sm:py-20"
      aria-labelledby="platform-features-heading"
    >
      <div className="mx-auto max-w-6xl px-4">
        <MotionRevealItem>
          <p className="font-display text-sm font-medium uppercase tracking-[0.12em] text-gold">
            {PLATFORM_SECTION.eyebrow}
          </p>
          <h2
            id="platform-features-heading"
            className="mt-2 font-display text-3xl font-semibold text-landing-ink"
          >
            {PLATFORM_SECTION.title}
          </h2>
          <p className="mt-3 max-w-2xl text-base text-landing-muted">
            {PLATFORM_SECTION.subtitle}
          </p>
        </MotionRevealItem>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PLATFORM_FEATURES.map((feature) => (
            <MotionRevealItem key={feature.title} as="article" className="h-full">
              <HoverCard tone="landing" innerClassName="flex h-full flex-col p-6">
                <h3 className="font-display text-lg font-semibold text-landing-ink">
                  {feature.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-landing-muted">
                  {feature.body}
                </p>
                <Link
                  to={feature.href}
                  className="mt-4 inline-flex text-sm font-medium text-landing-ink underline-offset-2 hover:text-gold hover:underline"
                >
                  {feature.cta} →
                </Link>
              </HoverCard>
            </MotionRevealItem>
          ))}
        </div>
      </div>
    </MotionReveal>
  );
}
