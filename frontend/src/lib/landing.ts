/** Copy and asset paths for the marketing home page. */

/** Hero animated background — slowed derivative of `final-cta-art.gif` (~12× frame delay, ~9s loop). */
export const LANDING_HERO_ANIMATED_BACKGROUND = "/landing/hero-background-slow.gif";

/** Hero background — served from `frontend/public/landing/`. */
export const LANDING_HERO_BACKGROUNDS = [
  "/landing/hero-background.webp",
] as const;

export const LANDING_HERO_STATIC_BACKGROUNDS = LANDING_HERO_BACKGROUNDS;

/** Slow pan/zoom for still images; set false when using animated WebP or video. */
export const LANDING_HERO_KEN_BURNS = false;

export const LANDING_FINAL_CTA_IMAGE =
  "/landing/Glow%20Black%20And%20White%20GIF%20by%20xponentialdesign.gif";

export const FINAL_CTA_SECTION = {
  eyebrow: "Get started",
  heading: "Ready to place a trade?",
  body: "Log in with Google or the demo account, receive virtual credits, and open any active market. Simulation only — no cash value.",
} as const;

export const MARKETS_PREVIEW_SECTION = {
  eyebrow: "Markets",
  heading: "Campus questions with live odds",
  body: "Browse open markets across sports, academics, and enrollment. Prices move as students trade — virtual credits only, no cash value.",
  cta: "View all markets",
} as const;

/** Hero motion timing (see DESIGN.md §15). */
export const HERO_ROTATING_INTERVAL_MS = 4500;
export const LANDING_HERO_KEN_BURNS_DURATION_S = 26;

/** Rotates on `HERO_ROTATING_INTERVAL_MS` in the hero. */
export const HERO_ROTATING_LINES = [
  "Lock or Doubt campus outcomes before you commit.",
  "Watch odds move as every trade lands.",
  "Track your calls and P/L as markets resolve.",
  "Read AI briefs on live price action.",
] as const;

export const HERO_HEADLINE = {
  before: "Predict campus outcomes",
  accent: "and",
  after: "win credits",
} as const;

export const HERO_STATIC_SUBLINE =
  "Trade on UCF exam scores, game results, and enrollment numbers. See what the crowd believes — before it happens.";

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
    body: "Wonder what traders think about that exam cutoff or game outcome? Get a plain-English read of recent trades — with a safe fallback if the feed is quiet.",
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
  {
    label: "Sports",
    category: "Sports",
    example: "UCF football historical replay",
    exampleSlug: "ucf-football-historical-replay",
  },
  {
    label: "Academics",
    category: "Academics",
    example: "COP 3502 Exam 1 mean ≥ 80",
    exampleSlug: "cop3502-exam1-mean-at-least-80",
  },
  {
    label: "Campus",
    category: "Campus",
    example: "Fall 2026 enrollment over 75,000",
    exampleSlug: "ucf-fall-2026-enrollment-over-75000",
  },
] as const;
