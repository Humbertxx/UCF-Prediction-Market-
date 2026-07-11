/** Copy and asset paths for the marketing home page. */

export const LANDING_HERO_BACKGROUNDS = [
  "/landing/hero-background.webp",
  "/landing/hero-background.jpg",
  "/landing/hero-background.png",
] as const;

/** Rotates every 3s in the hero (see DESIGN.md §15). */
export const HERO_ROTATING_LINES = [
  "Trade YES or NO on campus outcomes.",
  "Watch prices move as every trade lands.",
  "Track portfolio P/L as markets resolve.",
  "Read AI briefs on live price action.",
] as const;

export const HERO_EYEBROW = "Knightshi";

export const HERO_STATIC_SUBLINE =
  "Knightshi — virtual-credit prediction markets for UCF. Browse, trade, and follow live odds on football, exams, and enrollment.";

export const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Pick a market",
    body: "Browse YES/NO questions about campus life — sports, classes, and enrollment.",
  },
  {
    step: "02",
    title: "Buy shares",
    body: "Spend virtual credits on YES or NO. The AMM reprices instantly after each trade.",
  },
  {
    step: "03",
    title: "Follow the signal",
    body: "Watch the probability bar, price chart, and your portfolio as conviction builds.",
  },
] as const;

export const PLATFORM_FEATURES = [
  {
    title: "Live probability bar",
    body: "The signature YES/NO split with a gold price marker — the fastest read on market state.",
    href: "/markets",
    cta: "See markets",
  },
  {
    title: "AI Market Brief",
    body: "Gemini explains what recent trades suggest — plain English, safe fallback if the API is quiet.",
    href: "/features",
    cta: "Open AI brief",
  },
  {
    title: "Portfolio & history",
    body: "Positions, activity, and mark-to-market P/L in one place after you log in.",
    href: "/portfolio",
    cta: "View portfolio",
  },
] as const;

export const CAMPUS_DEMO_TOPICS = [
  { label: "Sports", example: "UCF football historical replay" },
  { label: "Academics", example: "COP 3502 Exam 1 mean ≥ 80" },
  { label: "Campus", example: "Fall 2026 enrollment over 75,000" },
] as const;
