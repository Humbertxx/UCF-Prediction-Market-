/**
 * Full-bleed marketing hero — animated GIF background, gold/black system, live market cards.
 */

import { motion } from "framer-motion";
import { useCallback, useState } from "react";

import {
  HERO_HEADLINE,
  HERO_STATIC_SUBLINE,
  LANDING_HERO_ANIMATED_BACKGROUND,
  LANDING_HERO_STATIC_BACKGROUNDS,
} from "../../lib/landing";
import MarketCardGrid from "./MarketCardGrid";
import { MotionLink } from "../../motion/components/MotionButton";
import { useMotionSafe } from "../../motion/hooks/useMotionSafe";

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp = (delay: number) => ({
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: EASE },
  },
});

export default function HeroSection() {
  const motionSafe = useMotionSafe();
  const [bgIndex, setBgIndex] = useState(0);
  const [bgLoaded, setBgLoaded] = useState(false);
  const [useAnimatedBg, setUseAnimatedBg] = useState(!motionSafe.reduce);

  const bgSources = LANDING_HERO_STATIC_BACKGROUNDS;
  const bgSrc = bgSources[bgIndex];
  const hasMoreFallbacks = bgIndex < bgSources.length - 1;

  const onStaticBgError = useCallback(() => {
    if (hasMoreFallbacks) {
      setBgIndex((i) => i + 1);
      setBgLoaded(false);
    } else {
      setBgLoaded(false);
    }
  }, [hasMoreFallbacks]);

  const onAnimatedBgError = useCallback(() => {
    setUseAnimatedBg(false);
  }, []);

  const motionInitial = motionSafe.initial;
  const motionAnimate = "visible";

  return (
    <section
      className="relative flex min-h-screen flex-col overflow-hidden bg-deck text-card"
      aria-labelledby="hero-heading"
    >
      <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden>
        {useAnimatedBg ? (
          <motion.img
            src={LANDING_HERO_ANIMATED_BACKGROUND}
            alt=""
            className="h-full w-full object-cover object-center"
            initial={motionSafe.reduce ? false : { scale: 1.05 }}
            animate={motionSafe.reduce ? undefined : { scale: 1.1 }}
            transition={
              motionSafe.reduce
                ? undefined
                : {
                    duration: 48,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "reverse",
                  }
            }
            onError={onAnimatedBgError}
          />
        ) : (
          <img
            src={bgSrc}
            alt=""
            className={[
              "h-full w-full object-cover object-center transition-opacity duration-500",
              bgLoaded ? "opacity-100" : "opacity-0",
            ].join(" ")}
            onLoad={() => setBgLoaded(true)}
            onError={onStaticBgError}
          />
        )}
      </div>

      <div
        className="absolute inset-0 z-[1] bg-gradient-to-b from-deck/85 via-deck/55 to-deck/90"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center px-4 pb-12 pt-20 text-center sm:px-6 sm:pb-16 sm:pt-24 md:pt-32">
        <motion.h1
          id="hero-heading"
          variants={motionSafe.variants(fadeUp(0.1))}
          initial={motionInitial}
          animate={motionAnimate}
          className="max-w-4xl font-display text-[clamp(2rem,9vw,3rem)] font-bold leading-[1.08] text-card sm:text-[clamp(2.5rem,8vw,3.75rem)] md:text-[clamp(3rem,8vw,6rem)]"
        >
          {HERO_HEADLINE.before}{" "}
          <em className="not-italic text-gold">{HERO_HEADLINE.accent}</em>{" "}
          {HERO_HEADLINE.after}
        </motion.h1>

        <motion.p
          variants={motionSafe.variants(fadeUp(0.2))}
          initial={motionInitial}
          animate={motionAnimate}
          className="mt-4 max-w-[42rem] font-body text-base text-card/70 sm:mt-5 sm:text-lg"
        >
          {HERO_STATIC_SUBLINE}
        </motion.p>

        <motion.div
          variants={motionSafe.variants(fadeUp(0.3))}
          initial={motionInitial}
          animate={motionAnimate}
          className="mt-6 flex w-full max-w-sm flex-col gap-3 sm:mt-8 sm:max-w-none sm:w-auto sm:flex-row"
        >
          <MotionLink
            to="/markets"
            className="rounded-[10px] bg-gold px-6 py-3 font-display text-base font-semibold text-ink shadow-lg transition hover:bg-gold/85 sm:w-auto"
          >
            View Live Markets
          </MotionLink>
          <MotionLink
            to="/how-it-works"
            className="rounded-[10px] border border-card/20 bg-card/10 px-6 py-3 font-display text-base font-semibold text-card transition hover:bg-card/20 sm:w-auto"
            spring={false}
          >
            How It Works
          </MotionLink>
        </motion.div>

        <motion.div
          variants={motionSafe.variants({
            hidden: { opacity: 0, y: 32 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.7, delay: 0.45, ease: EASE },
            },
          })}
          initial={motionInitial}
          animate={motionAnimate}
          className="mt-10 w-full sm:mt-16"
        >
          <MarketCardGrid density="compact" hideEmptyState />
        </motion.div>
      </div>
    </section>
  );
}
