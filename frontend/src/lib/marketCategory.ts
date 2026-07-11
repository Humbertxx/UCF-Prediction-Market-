/** Demo market categories — mirrors `backend/services/market_service.py`. */

const CATEGORY_BY_SLUG: Record<string, string> = {
  "ucf-football-historical-replay": "Sports",
  "cop3502-exam1-mean-at-least-80": "Academics",
  "ucf-fall-2026-enrollment-over-75000": "Campus",
  "ucf-vs-usf-football-ucf-covers": "Sports",
  "ucf-hackathon-2026-over-400-hackers": "Campus",
  "ucf-dining-meal-plan-price-flat-fall-2026": "Campus",
};

export function inferMarketCategory(slug: string): string {
  return CATEGORY_BY_SLUG[slug] ?? "General";
}

export function isOpenMarketStatus(status: string): boolean {
  return status === "seeded" || status === "trading";
}
