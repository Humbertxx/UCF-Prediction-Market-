/**
 * Full-bleed marketing hero — Polymarket-style dark band with optional
 * background image from `public/landing/` and 3s rotating headline lines.
 */

import { motion } from "framer-motion";
import { useCallback, useState } from "react";

import { useAuth } from "../../context/AuthContext";
import { useRotatingPhrase } from "../../hooks/useRotatingPhrase";
import {
  HERO_EYEBROW,
  HERO_ROTATING_LINES,
  HERO_STATIC_SUBLINE,
  LANDING_HERO_BACKGROUNDS,
  LANDING_HERO_KEN_BURNS,
  LANDING_HERO_STATIC_BACKGROUNDS,
} from "../../lib/landing";
import { MotionLink } from "../../motion/components/MotionButton";
import { useMotionSafe } from "../../motion/hooks/useMotionSafe";
import { fadeUp } from "../../motion/variants";

const heroItem = (delay: number) => ({
  hidden: fadeUp.hidden,
  visible: {
    ...fadeUp.visible,
    transition: {
      ...(typeof fadeUp.visible === "object" && "transition" in fadeUp.visible
        ? fadeUp.visible.transition
        : {}),
      delay,
    },
  },
});

export default function HeroSection() {
  const { isAuthenticated } = useAuth();
  const { phrase, index, visible, motionReduced, count } = useRotatingPhrase(
    HERO_ROTATING_LINES,
    3000,
  );
  const motionSafe = useMotionSafe();

  const [bgIndex, setBgIndex] = useState(0);
  const [bgLoaded, setBgLoaded] = useState(false);

  const bgSources = motionReduced
    ? LANDING_HERO_STATIC_BACKGROUNDS
    : LANDING_HERO_BACKGROUNDS;
  const bgSrc = bgSources[bgIndex];
  const hasMoreFallbacks = bgIndex < bgSources.length - 1;

  const onBgError = useCallback(() => {
    if (hasMoreFallbacks) {
      setBgIndex((i) => i + 1);
      setBgLoaded(false);
    } else {
      setBgLoaded(false);
    }
  }, [hasMoreFallbacks]);

  const onBgLoad = useCallback(() => {
    setBgLoaded(true);
  }, []);

  const kenBurns = LANDING_HERO_KEN_BURNS && !motionReduced;

  return (
    <section
      className="relative isolate min-h-[min(88vh,52rem)] overflow-hidden bg-deck text-card"
      aria-labelledby="hero-heading"
    >
      <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <motion.img
          key={bgSrc}
          src={bgSrc}
          alt=""
          className={[
            "h-full w-full object-cover object-center transition-opacity duration-500",
            bgLoaded ? "opacity-100" : "opacity-0",
          ].join(" ")}
          animate={
            kenBurns
              ? { scale: [1, 1.08], x: ["0%", "-2%"], y: ["0%", "-1.5%"] }
              : undefined
          }
          transition={
            kenBurns
              ? { duration: 18, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }
              : undefined
          }
          onLoad={onBgLoad}
          onError={onBgError}
        />
      </div>

      <div
        className="absolute inset-0 z-[1] bg-gradient-to-br from-deck/85 via-deck/55 to-deck/75"
        aria-hidden
      />
      <div
        className="absolute inset-0 z-[1] bg-gradient-to-t from-deck via-deck/70 to-transparent"
        aria-hidden
      />

      <motion.div
        className="relative z-[2] mx-auto flex min-h-[min(88vh,52rem)] max-w-6xl flex-col justify-center px-4 py-20 sm:py-24"
        initial={motionSafe.initial}
        animate="visible"
      >
        <motion.p
          variants={motionSafe.variants(heroItem(0))}
          className="font-display text-sm font-medium uppercase tracking-[0.18em] text-gold"
        >
          {HERO_EYEBROW}
        </motion.p>

        <motion.div
          variants={motionSafe.variants(heroItem(0.15))}
          className="mt-6 min-h-[4.5rem] sm:min-h-[5.5rem] lg:min-h-[6.5rem]"
        >
          <h1
            id="hero-heading"
            className={[
              "font-display text-[clamp(2rem,5vw,3.75rem)] font-bold leading-[1.08] tracking-tight text-card transition-opacity duration-300 motion-reduce:transition-none",
              visible ? "opacity-100" : "opacity-0",
            ].join(" ")}
            aria-live={motionReduced ? "off" : "polite"}
          >
            {phrase}
          </h1>
        </motion.div>

        <motion.p
          variants={motionSafe.variants(heroItem(0.3))}
          className="mt-5 max-w-2xl text-lg leading-relaxed text-card/85"
        >
          {HERO_STATIC_SUBLINE}
        </motion.p>

        <motion.div
          variants={motionSafe.variants(heroItem(0.45))}
          className="mt-8 flex flex-wrap gap-3"
        >
          {isAuthenticated ? (
            <MotionLink
              to="/markets"
              className="rounded-btn bg-gold px-6 py-3 font-display font-semibold text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              Open markets
            </MotionLink>
          ) : (
            <MotionLink
              to="/login"
              className="rounded-btn bg-gold px-6 py-3 font-display font-semibold text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              Log in to trade
            </MotionLink>
          )}
          <MotionLink
            to="/markets"
            className="rounded-btn border border-card/35 bg-card/10 px-6 py-3 font-display font-medium text-card backdrop-blur-sm hover:bg-card/15"
            spring={false}
          >
            Browse markets
          </MotionLink>
          <MotionLink
            to="/features"
            className="rounded-btn border border-card/20 px-6 py-3 font-display font-medium text-card/90 hover:border-gold/50"
            spring={false}
          >
            AI Market Brief
          </MotionLink>
        </motion.div>

        <motion.div
          variants={motionSafe.variants(heroItem(0.6))}
          className="mt-10 flex items-center gap-2"
          role="tablist"
          aria-label="Hero message phases"
        >
          {HERO_ROTATING_LINES.map((line, i) => (
            <span
              key={line}
              role="tab"
              aria-selected={i === index}
              aria-label={line}
              className={[
                "h-1.5 rounded-full transition-all duration-300 motion-reduce:transition-none",
                i === index ? "w-8 bg-gold" : "w-1.5 bg-card/35",
              ].join(" ")}
            />
          ))}
          {motionReduced && (
            <span className="ml-2 text-xs text-card/50">
              Motion reduced — headline paused
            </span>
          )}
        </motion.div>

        <p className="sr-only">
          {count} rotating messages, {motionReduced ? "static display" : "3 second"} cycle
        </p>
      </motion.div>
    </section>
  );
}
