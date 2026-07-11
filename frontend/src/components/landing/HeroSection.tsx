/**
 * Full-bleed marketing hero — Polymarket-style dark band with optional
 * background image from `public/landing/` and 3s rotating headline lines.
 */

import { useCallback, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useRotatingPhrase } from "../../hooks/useRotatingPhrase";
import {
  HERO_EYEBROW,
  HERO_ROTATING_LINES,
  HERO_STATIC_SUBLINE,
  LANDING_HERO_BACKGROUNDS,
} from "../../lib/landing";

export default function HeroSection() {
  const { isAuthenticated } = useAuth();
  const { phrase, index, visible, motionReduced, count } = useRotatingPhrase(
    HERO_ROTATING_LINES,
    3000,
  );

  const [bgIndex, setBgIndex] = useState(0);
  const [bgLoaded, setBgLoaded] = useState(false);

  const bgSrc = LANDING_HERO_BACKGROUNDS[bgIndex];
  const hasMoreFallbacks = bgIndex < LANDING_HERO_BACKGROUNDS.length - 1;

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

  return (
    <section
      className="relative isolate min-h-[min(88vh,52rem)] overflow-hidden bg-deck text-card"
      aria-labelledby="hero-heading"
    >
      {/* Background image (user uploads to public/landing/) */}
      <img
        key={bgSrc}
        src={bgSrc}
        alt=""
        aria-hidden
        className={[
          "absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-500",
          bgLoaded ? "opacity-100" : "opacity-0",
        ].join(" ")}
        onLoad={onBgLoad}
        onError={onBgError}
      />

      {/* Fallback gradient when no image is uploaded */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-deck via-[#252a35] to-deck"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-deck via-deck/75 to-deck/40"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 top-1/4 h-96 w-96 rounded-full bg-gold/10 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-[min(88vh,52rem)] max-w-6xl flex-col justify-center px-4 py-20 sm:py-24">
        <p className="font-display text-sm font-medium uppercase tracking-[0.18em] text-gold">
          {HERO_EYEBROW}
        </p>

        <div className="mt-6 min-h-[4.5rem] sm:min-h-[5.5rem] lg:min-h-[6.5rem]">
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
        </div>

        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-card/85">
          {HERO_STATIC_SUBLINE}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          {isAuthenticated ? (
            <Link
              to="/markets"
              className="rounded-btn bg-gold px-6 py-3 font-display font-semibold text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              Open markets
            </Link>
          ) : (
            <Link
              to="/login"
              className="rounded-btn bg-gold px-6 py-3 font-display font-semibold text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              Log in to trade
            </Link>
          )}
          <Link
            to="/markets"
            className="rounded-btn border border-card/35 bg-card/10 px-6 py-3 font-display font-medium text-card backdrop-blur-sm hover:bg-card/15"
          >
            Browse markets
          </Link>
          <Link
            to="/features"
            className="rounded-btn border border-card/20 px-6 py-3 font-display font-medium text-card/90 hover:border-gold/50"
          >
            AI Market Brief
          </Link>
        </div>

        {/* Phase indicators — one dot per rotating line */}
        <div
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
        </div>

        <p className="sr-only">
          {count} rotating messages, {motionReduced ? "static display" : "3 second"} cycle
        </p>
      </div>
    </section>
  );
}
