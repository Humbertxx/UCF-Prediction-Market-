/**
 * Final CTA — featured-video layout with glass overlay and auth-aware CTAs.
 */

import { motion, type Variants } from "framer-motion";

import { useAuth } from "../../context/AuthContext";
import { FINAL_CTA_SECTION, LANDING_FINAL_CTA_IMAGE } from "../../lib/landing";
import { MotionLink } from "../../motion/components/MotionButton";
import { useMotionSafe } from "../../motion/hooks/useMotionSafe";

const cinematicReveal: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function FinalCtaSection() {
  const { isAuthenticated, user } = useAuth();
  const motionSafe = useMotionSafe();

  return (
    <section
      className="overflow-hidden bg-landing-deep px-4 pt-6 pb-20 sm:px-6 md:pt-10 md:pb-32"
      aria-labelledby="final-cta-heading"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="relative aspect-video overflow-hidden rounded-3xl"
          initial={motionSafe.initial}
          whileInView={motionSafe.whileInView}
          viewport={motionSafe.viewport}
          variants={motionSafe.variants(cinematicReveal)}
        >
          <img
            src={LANDING_FINAL_CTA_IMAGE}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover object-center"
          />

          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-landing-deep/70 via-transparent to-transparent"
            aria-hidden
          />

          <div className="absolute right-0 bottom-0 left-0 flex flex-col gap-4 p-6 md:flex-row md:items-end md:gap-6 md:p-10">
            <div className="landing-glass max-w-md rounded-card p-6 md:p-8">
              <p className="font-display text-xs tracking-[0.12em] text-landing-muted uppercase">
                {FINAL_CTA_SECTION.eyebrow}
              </p>
              <h2
                id="final-cta-heading"
                className="mt-3 font-display text-xl font-semibold text-landing-ink md:text-2xl"
              >
                {FINAL_CTA_SECTION.heading}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-landing-muted md:text-base">
                {FINAL_CTA_SECTION.body}
              </p>
            </div>

            <div className="flex flex-col gap-3 md:ml-auto">
              <div className="flex flex-wrap gap-3">
                {isAuthenticated ? (
                  <>
                    <MotionLink
                      to="/markets"
                      className="rounded-btn bg-gold px-6 py-3 font-display text-sm font-medium text-ink"
                    >
                      Go to markets
                    </MotionLink>
                    <MotionLink
                      to="/portfolio"
                      className="landing-glass rounded-btn px-6 py-3 font-display text-sm font-medium text-landing-ink"
                      spring={false}
                    >
                      Open portfolio
                    </MotionLink>
                  </>
                ) : (
                  <>
                    <MotionLink
                      to="/login"
                      className="rounded-btn bg-gold px-6 py-3 font-display text-sm font-medium text-ink"
                    >
                      Log in
                    </MotionLink>
                    <MotionLink
                      to="/markets"
                      className="landing-glass rounded-btn px-6 py-3 font-display text-sm font-medium text-landing-ink"
                      spring={false}
                    >
                      Browse first
                    </MotionLink>
                  </>
                )}
              </div>

              {isAuthenticated && user && (
                <p className="font-data text-sm text-landing-muted">
                  Signed in as {user.name ?? user.email}
                  {user.is_admin ? " · admin" : ""}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
