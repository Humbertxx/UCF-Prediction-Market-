/** Copy and asset paths for the marketing home page. */

/** Hero background — served from `frontend/public/landing/`. */
export const LANDING_HERO_BACKGROUNDS = [
  "/landing/hero-background.webp",
] as const;

export const LANDING_HERO_STATIC_BACKGROUNDS = LANDING_HERO_BACKGROUNDS;

/** Slow pan/zoom for still images; set false when using animated WebP or video. */
export const LANDING_HERO_KEN_BURNS = true;

/** Rotates every 3s in the hero (see DESIGN.md §15). */
export const HERO_ROTATING_LINES = [
  "Lock or Doubt campus outcomes before you commit.",
  "Watch odds move as every trade lands.",
  "Track your calls and P/L as markets resolve.",
  "Read AI briefs on live price action.",
] as const;

export const HERO_EYEBROW = "Knightshi";

export const HERO_STATIC_SUBLINE =
  "Knightshi — virtual-credit prediction markets for UCF. Browse, trade, and follow live Lock/Doubt odds on football, exams, and enrollment.";

export const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Pick a market",
    body: "Browse campus questions — sports, classes, enrollment — and see where the crowd stands.",
  },
  {
    step: "02",
    title: "Make your call",
    body: "Spend virtual credits to Lock In (you think it'll happen) or Doubt It (you don't). Prices reprice after each trade.",
  },
  {
    step: "03",
    title: "Follow the signal",
    body: "Watch the odds bar, price chart, and your portfolio as conviction builds.",
  },
] as const;

export const PLATFORM_SECTION = {
  eyebrow: "Platform",
  title: "Built for campus calls",
  subtitle:
    "Not sure whether to grind for an exam, show up to the game, or call it early? See where students are putting credits before you decide.",
} as const;

export const PLATFORM_FEATURES = [
  {
    title: "Live odds bar",
    body: "Can't tell if that COP mean is worth a late-night cram? Check the bar — Lock vs Doubt split with a gold marker shows the crowd's take in one glance.",
    href: "/markets",
    cta: "See markets",
  },
  {
    title: "AI Market Brief",
    body: "Wonder what traders think about that exam cutoff or game outcome? Gemini turns recent trades into a plain-English read — with a safe fallback if the API is quiet.",
    href: "/features",
    cta: "Open AI brief",
  },
  {
    title: "Your call sheet",
    body: "Every Lock and Doubt you've taken, credits spent, and how your picks moved — a scoreboard for your campus calls after you log in.",
    href: "/portfolio",
    cta: "View call sheet",
  },
] as const;

export const CAMPUS_DEMO_TOPICS = [
  { label: "Sports", example: "UCF football historical replay" },
  { label: "Academics", example: "COP 3502 Exam 1 mean ≥ 80" },
  { label: "Campus", example: "Fall 2026 enrollment over 75,000" },
] as const;
