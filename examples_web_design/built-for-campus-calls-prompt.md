# Prompt: “Built for campus calls” — Plaid-style feature cards

**Status:** Archive / ready to run  
**Target section:** `FeaturesSection` on the marketing home (`PLATFORM_SECTION` in `frontend/src/lib/landing.ts`)  
**Visual reference:** Plaid enterprise feature grid — light glass cards, split headline (bold + muted), floating UI mockup, arrow CTA, soft pastel gradients, iridescent hover border.

Reference screenshot (local):  
`assets/Screenshot_2026-07-11_at_4.59.33_PM-ca8c15b5-cc91-4f4b-aa50-5aa776ca8b73.png`

---

## Copy this block into an agent session

```
Redesign the “Built for campus calls” platform section on the Knightshi landing page to match a Plaid-style feature card grid.

## Visual target (from reference)

- Three tall cards in a responsive row (1 col mobile → 3 col desktop), generous gap and vertical padding.
- Each card feels premium and airy: near-white base, very subtle pastel gradient wash (light blue / lavender / blush — keep it faint, not loud).
- Large corner radius (~20–24px). Soft diffused shadow on inner UI widgets, not heavy card chrome.
- Headline pattern per card: **bold dark subject** + lighter muted continuation on the same line or wrapped second line.
  - Example shape: “**Live odds bar** built for quick campus reads”
  - Bold = `text-landing-ink font-semibold`; muted = `text-landing-muted font-normal`
- Top-right: small circular arrow button (→) that links to the feature route; subtle border, lifts slightly on card hover.
- Center/bottom of each card: a floating “product widget” mockup — rounded panel, white surface, soft shadow, slight perspective/offset. This is the hero visual inside the card.
- Optional: one card (e.g. first or hovered) shows a thin iridescent/rainbow border glow; reuse existing `.feature-card` / `.feature-card__glow` spin-on-hover from `index.css` where it fits the light theme.
- Section header stays: eyebrow “Platform”, title “Built for campus calls”, existing subtitle from `PLATFORM_SECTION`.

## Knightshi constraints (non-negotiable)

- Stack: React 18 + TS + Vite + Tailwind only. No new dependencies.
- Tokens from `DESIGN.md` / `index.css` — no hardcoded hex in components.
- Keep copy in `frontend/src/lib/landing.ts` (`PLATFORM_FEATURES`); components read from there.
- Preserve `MotionReveal` / `MotionRevealItem` stagger from `FeaturesSection.tsx`.
- Respect `prefers-reduced-motion`: static border or no spin when reduced.
- Cards remain links to `/markets`, `/features`, `/portfolio` (or whatever `href` is in data).
- Demo reliability > pixel-perfect clone. Layout must not break if a mockup asset is missing.

## Files to touch

- `frontend/src/lib/landing.ts` — extend `PLATFORM_FEATURES` with headline split + mockup slot fields
- `frontend/src/components/landing/FeaturesSection.tsx` — new card layout
- `frontend/src/index.css` — light-theme card surface + widget elevation utilities (additive; keep dark elevated variant if used elsewhere)
- Optional: `frontend/src/components/landing/FeatureCardMockup.tsx` — wrapper for placeholder slots

## Card data shape (extend PLATFORM_FEATURES)

Each feature object should support:

```ts
{
  headlineBold: string;      // e.g. "Live odds bar"
  headlineMuted: string;     // e.g. "built for quick campus reads"
  href: string;
  mockup: "placeholder" | ReactNode;  // see slots below
}
```

Remove or demote the old `title` / `body` / `cta` text-only layout if redundant; keep body copy only if it fits below the mockup without crowding.

## Placeholder slots — fill these before polish

Use a visible placeholder component until real mockups exist:
- Light gray dashed border, `rounded-2xl`, min-height ~200px, centered label “Mockup placeholder”.
- `aria-hidden` on decorative mockups; card link still wraps or arrow button handles navigation.

### Card 1 — Live odds bar
- **Headline bold:** `{{CARD_1_HEADLINE_BOLD}}`  
  Default: `Live odds bar`
- **Headline muted:** `{{CARD_1_HEADLINE_MUTED}}`  
  Default: `built for quick campus reads`
- **Mockup:** `{{CARD_1_MOCKUP}}`  
  Suggested widget: miniature `ProbabilityBar` or 3-up market odds strip with one row highlighted (Lock/Doubt + gold marker). Reuse `ProbabilityBar` / `MarketCard` primitives if possible.

### Card 2 — AI Market Brief
- **Headline bold:** `{{CARD_2_HEADLINE_BOLD}}`  
  Default: `AI Market Brief`
- **Headline muted:** `{{CARD_2_HEADLINE_MUTED}}`  
  Default: `with plain-English conviction reads`
- **Mockup:** `{{CARD_2_MOCKUP}}`  
  Suggested widget: narrow “brief” panel — title, 2–3 lines of insight text, subtle sparkle/gold accent. Static demo copy is fine.

### Card 3 — Your call sheet
- **Headline bold:** `{{CARD_3_HEADLINE_BOLD}}`  
  Default: `Your call sheet`
- **Headline muted:** `{{CARD_3_HEADLINE_MUTED}}`  
  Default: `for every Lock and Doubt you take`
- **Mockup:** `{{CARD_3_MOCKUP}}`  
  Suggested widget: mini portfolio table — market name, side badge (Lock/Doubt), credits, small P/L column.

## Layout sketch

```
┌─────────────────────────────────────────────────────────────┐
│  PLATFORM (eyebrow)                                         │
│  Built for campus calls (h2)                                │
│  Subtitle paragraph                                         │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Headline  [→]│  │ Headline  [→]│  │ Headline  [→]│       │
│  │              │  │              │  │              │       │
│  │  ┌────────┐  │  │  ┌────────┐  │  │  ┌────────┐  │       │
│  │  │ MOCKUP │  │  │  │ MOCKUP │  │  │  │ MOCKUP │  │       │
│  │  │ SLOT   │  │  │  │ SLOT   │  │  │  │ SLOT   │  │       │
│  │  └────────┘  │  │  └────────┘  │  │  └────────┘  │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

## Acceptance criteria

1. Section reads clearly as Plaid-inspired: light cards, split headline, widget-forward, arrow CTA.
2. All three `{{CARD_*_MOCKUP}}` slots render without layout shift when set to placeholder.
3. Hover: card lifts slightly; border glow or shadow intensifies; arrow button visible focus ring.
4. Mobile: cards stack; mockups scale down but remain legible.
5. `npm run build` passes; no new packages.
6. Swapping `{{CARD_*_MOCKUP}}` for real components requires only `landing.ts` + mockup component edits.

## Out of scope

- Changing hero, markets preview, or final CTA sections
- Backend or auth changes
- Generating final marketing illustrations (use placeholders until provided)
```

---

## Placeholder cheat sheet

| Token | Purpose | Default |
| --- | --- | --- |
| `{{CARD_1_HEADLINE_BOLD}}` | Card 1 bold headline | Live odds bar |
| `{{CARD_1_HEADLINE_MUTED}}` | Card 1 muted tail | built for quick campus reads |
| `{{CARD_1_MOCKUP}}` | Card 1 UI widget | Placeholder / ProbabilityBar mini |
| `{{CARD_2_HEADLINE_BOLD}}` | Card 2 bold headline | AI Market Brief |
| `{{CARD_2_HEADLINE_MUTED}}` | Card 2 muted tail | with plain-English conviction reads |
| `{{CARD_2_MOCKUP}}` | Card 2 UI widget | Placeholder / brief panel |
| `{{CARD_3_HEADLINE_BOLD}}` | Card 3 bold headline | Your call sheet |
| `{{CARD_3_HEADLINE_MUTED}}` | Card 3 muted tail | for every Lock and Doubt you take |
| `{{CARD_3_MOCKUP}}` | Card 3 UI widget | Placeholder / mini portfolio table |

Replace `{{…}}` tokens in the prompt block before handing to an agent, or leave defaults and implement placeholders first.

## Related code today

- Section component: `frontend/src/components/landing/FeaturesSection.tsx`
- Copy: `frontend/src/lib/landing.ts` → `PLATFORM_SECTION`, `PLATFORM_FEATURES`
- Existing hover border prototype: `examples_web_design/card-grid-hover.html`, `.feature-card` in `frontend/src/index.css`
