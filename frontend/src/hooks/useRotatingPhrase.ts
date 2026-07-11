/**
 * Cycles through hero headline lines on a fixed interval.
 * Pauses rotation when prefers-reduced-motion is set.
 */

import { useEffect, useState } from "react";

const DEFAULT_INTERVAL_MS = 3000;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useRotatingPhrase(
  phrases: readonly string[],
  intervalMs = DEFAULT_INTERVAL_MS,
) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [motionReduced, setMotionReduced] = useState(prefersReducedMotion);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setMotionReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (phrases.length <= 1 || motionReduced) return undefined;

    const fadeMs = 280;
    const timer = window.setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setIndex((current) => (current + 1) % phrases.length);
        setVisible(true);
      }, fadeMs);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [phrases.length, intervalMs, motionReduced]);

  return {
    phrase: phrases[index] ?? phrases[0] ?? "",
    index,
    visible: motionReduced ? true : visible,
    motionReduced,
    count: phrases.length,
  };
}
