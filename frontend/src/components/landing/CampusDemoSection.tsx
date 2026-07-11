/**
 * Campus demo context — seeded market categories.
 */

import { CAMPUS_DEMO_TOPICS } from "../../lib/landing";
import { MotionLink } from "../../motion/components/MotionButton";
import MotionReveal, { MotionRevealItem } from "../../motion/components/MotionReveal";

export default function CampusDemoSection() {
  return (
    <MotionReveal
      stagger
      className="border-b border-line bg-deck py-16 text-card sm:py-20"
      aria-labelledby="campus-demo-heading"
    >
      <div className="mx-auto max-w-6xl px-4">
        <MotionRevealItem>
          <p className="font-display text-sm font-medium uppercase tracking-[0.12em] text-gold">
            Campus demo
          </p>
          <h2
            id="campus-demo-heading"
            className="mt-2 font-display text-3xl font-semibold"
          >
            Questions UCF students actually argue about
          </h2>
          <p className="mt-3 max-w-2xl text-base text-card/80">
            Seeded markets cover sports, academics, and enrollment — enough variety
            to show category breakdowns in portfolio without overwhelming the demo.
          </p>
        </MotionRevealItem>

        <ul className="mt-10 grid gap-4 sm:grid-cols-3">
          {CAMPUS_DEMO_TOPICS.map((topic) => (
            <MotionRevealItem
              key={topic.label}
              as="li"
              className="rounded-card border border-card/15 bg-card/5 p-5 backdrop-blur-sm"
            >
              <span className="text-xs font-medium uppercase tracking-wide text-gold">
                {topic.label}
              </span>
              <p className="mt-2 font-display text-base font-medium text-card">
                {topic.example}
              </p>
            </MotionRevealItem>
          ))}
        </ul>

        <div className="mt-10 flex flex-wrap gap-3">
          <MotionLink
            to="/markets"
            className="rounded-btn bg-gold px-5 py-2.5 font-display font-semibold text-ink"
          >
            Explore demo markets
          </MotionLink>
          <MotionLink
            to="/features"
            className="rounded-btn border border-card/30 px-5 py-2.5 font-display font-medium text-card hover:border-gold/60"
            spring={false}
          >
            Read AI brief
          </MotionLink>
        </div>
      </div>
    </MotionReveal>
  );
}
