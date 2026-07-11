/**
 * Final CTA band before the global footer.
 */

import { motion } from "framer-motion";

import { useAuth } from "../../context/AuthContext";
import { MotionLink } from "../../motion/components/MotionButton";
import MotionReveal from "../../motion/components/MotionReveal";
import { useMotionSafe } from "../../motion/hooks/useMotionSafe";
import { scalePop } from "../../motion/variants";

export default function FinalCtaSection() {
  const { isAuthenticated, user } = useAuth();
  const motionSafe = useMotionSafe();

  return (
    <MotionReveal
      className="bg-surface py-16 sm:py-20"
      aria-labelledby="final-cta-heading"
    >
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          variants={motionSafe.variants(scalePop)}
          className="rounded-card border border-line bg-card px-6 py-10 text-center sm:px-12"
        >
          <h2
            id="final-cta-heading"
            className="font-display text-2xl font-semibold text-ink sm:text-3xl"
          >
            Ready to place a trade?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-base text-muted">
            Log in with Google or the demo account, receive virtual credits, and
            open any active market. Simulation only — no cash value.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {isAuthenticated ? (
              <>
                <MotionLink
                  to="/markets"
                  className="rounded-btn bg-deck px-6 py-3 font-display font-medium text-card"
                >
                  Go to markets
                </MotionLink>
                <MotionLink
                  to="/portfolio"
                  className="rounded-btn border border-line px-6 py-3 font-display font-medium text-ink"
                  spring={false}
                >
                  Open portfolio
                </MotionLink>
              </>
            ) : (
              <>
                <MotionLink
                  to="/login"
                  className="rounded-btn bg-deck px-6 py-3 font-display font-medium text-card"
                >
                  Log in
                </MotionLink>
                <MotionLink
                  to="/markets"
                  className="rounded-btn border border-line px-6 py-3 font-display font-medium text-ink"
                  spring={false}
                >
                  Browse first
                </MotionLink>
              </>
            )}
          </div>

          {isAuthenticated && user && (
            <p className="mt-6 font-data text-sm text-muted">
              Signed in as {user.name ?? user.email}
              {user.is_admin ? " · admin" : ""}
            </p>
          )}
        </motion.div>
      </div>
    </MotionReveal>
  );
}
