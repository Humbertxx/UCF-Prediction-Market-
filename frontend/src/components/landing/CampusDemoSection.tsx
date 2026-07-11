/**
 * Campus demo context — seeded market categories.
 */

import { Link } from "react-router-dom";

import HoverCard from "../ui/HoverCard";
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

        <ul className="mt-8 grid gap-2 sm:grid-cols-3">
          {CAMPUS_DEMO_TOPICS.map((topic) => (
            <MotionRevealItem key={topic.label} as="li" className="h-full">
              <HoverCard
                as={Link}
                to={`/markets?category=${encodeURIComponent(topic.category)}`}
                tone="deck"
                className="group h-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                innerClassName="flex h-full min-h-[11rem] flex-col p-7 sm:min-h-[12rem]"
              >
                <span className="text-sm font-semibold uppercase tracking-wide text-gold transition-colors group-hover:text-ink">
                  {topic.label}
                </span>
                <p className="mt-3 flex-1 font-display text-lg font-semibold leading-snug text-card transition-colors group-hover:text-ink sm:text-xl">
                  {topic.example}
                </p>
                <p className="mt-4 text-base text-card/60 transition-colors group-hover:text-ink/70">
                  View live {topic.label.toLowerCase()} markets →
                </p>
              </HoverCard>
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
