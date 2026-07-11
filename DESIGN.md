# DESIGN.md - AI-First Frontend Design System

This file is the visual source of truth for UI generation. AI agents should treat it as executable guidance, not inspiration.

If this file and a prompt conflict, this file wins unless the user explicitly overrides it.

## 1) Quick Rules For Any AI

1. Use Tailwind utilities only. No second CSS framework.
2. Never hardcode hex values in components. Use tokens from this file.
3. One visual hero per page type: marketing home uses the landing hero band; market/trading pages use the live probability bar.
4. Keep UI calm and data-forward. Numbers are the primary content.
5. Use monospace with tabular numbers for price, odds, credits, shares, and PnL.
6. Preserve clear YES (green) and NO (red) semantics.
7. Gold is an accent, not a background theme color.
8. Include loading, empty, error, and disconnected states for user-facing surfaces.
9. Respect `prefers-reduced-motion` and maintain keyboard-visible focus.

## 2) Brand Direction

Product name: **Knightshi**.

Design metaphor: campus exchange floor.

- Calm, high-signal trading interface.
- One loud interaction: live repricing feedback.
- Avoid generic AI defaults:
  - no cream-serifs
  - no neon cyberpunk
  - no ultra-thin broadsheet styling
- Anchor palette on UCF black and gold, but spend gold sparingly.
- Brand first: on marketing surfaces, **Knightshi** is a hero-level signal, not only nav text.

## 3) Design Priorities (Ordered)

1. Readability from distance (projector/demo context).
2. Clarity of market state changes.
3. Fast comprehension of actions and outcomes.
4. Consistency across pages and states.
5. Aesthetic polish.

## 4) Color Tokens

| Token | Hex | Primary use |
| --- | --- | --- |
| `--ink` | `#14161B` | Main text and high-contrast labels |
| `--surface` | `#F7F8FA` | App background |
| `--card` | `#FFFFFF` | Cards and panels |
| `--gold` | `#FFC904` | Accent marker, flash, focus edge |
| `--gold-ink` | `#8A6B00` | Gold-toned text on light backgrounds |
| `--yes` | `#12805C` | YES state, positive move |
| `--no` | `#C6432E` | NO state, negative move |
| `--muted` | `#6B7280` | Secondary labels and helper text |
| `--line` | `#E2E5EA` | Borders, separators, chart grid lines |
| `--deck` | `#1B1E26` | Header/admin bands and dark chrome |

### Color semantics

- `--yes` and `--no` are market semantics only.
- Do not use green/red for generic success or error banners unless market-related.
- Gold should appear as edge, marker, focus ring, or brief flash.
- Avoid large gold fills or gold-heavy gradients.

## 5) Typography

| Role | Family | Usage |
| --- | --- | --- |
| Display | Space Grotesk | Headline and market title |
| Body | Inter | Labels, paragraphs, controls |
| Data | JetBrains Mono | Prices, probabilities, credits, shares, PnL |

Type scale (rem):

- display: `3`
- h1: `1.875`
- h2: `1.5`
- body: `1`
- small: `0.875`

Numeric formatting rules:

- Apply `font-variant-numeric: tabular-nums` for aligned numeric columns.
- Price readout defaults to mono at `1.125rem`.
- Keep decimal precision consistent in a view (usually 2 dp for prices).

## 6) Spacing, Shape, and Layout

- Spacing system: 4px base, 8px rhythm.
- Card padding: 24px desktop, 16px mobile.
- Radius tokens:
  - card: 12px
  - button/input: 8px
  - pills/badges: 999px

Layout defaults:

- Market list page: responsive card grid.
- Market detail page:
  - desktop: chart left, trade panel right
  - mobile: stacked, chart before trade panel
- Keep primary CTA above fold on laptop viewport.

## 7) Signature Component: Probability Bar

This is the highest-priority visual component.

Required behavior:

- Horizontal YES/NO split bar under market title.
- YES fill width reflects `P(YES)`.
- Thin gold marker indicates current price.
- On price update:
  - marker eases to new position (`400ms`, `cubic-bezier(.2,.8,.2,1)`)
  - brief gold flash (`220ms`)

Constraint:

- If there is a design trade-off, preserve probability bar clarity over decorative UI.

## 8) Core Component Guidance

### Market Card

- Show: title, status, current probability, volume/trade count if available.
- Put probability bar near top so list scan is fast.
- Use muted secondary metadata; emphasize actionable information.

### Trade Panel

- Primary controls: amount input, Buy YES button, Buy NO button.
- Buttons must be explicit verbs (`Buy YES`, `Buy NO`).
- Show post-trade feedback clearly (shares bought, effective price).

### Price Chart

- Keep chart styling minimal and legible.
- Use `--line` for grid and subtle axes.
- Use YES/NO semantics for directional movement cues.

### Trade Feed

- New rows can animate in, but do not distract from chart and bar.
- Include timestamp and compact action summary.

### Admin Controls

- Keep admin controls clearly separated from user trading actions.
- `Simulate` should be visible but not stylistically dominant.

## 9) Interaction States (Must Implement)

Every major surface should define:

- default
- hover (if pointer device)
- focus-visible (keyboard)
- loading
- empty
- error
- realtime-disconnected (when applicable)

Use copy that tells users what to do next, not only what failed.

## 10) Motion Rules

| Interaction | Effect | Duration |
| --- | --- | --- |
| Trade lands | Gold glow on price and bar | 220ms |
| Price change | Marker/bar easing | 400ms |
| New trade row | Fade/highlight in | 600ms |
| Card hover | 2px lift + soft shadow | 150ms |

For `prefers-reduced-motion: reduce`:

- disable flash and lift transitions
- snap probability marker to new value
- keep state changes visible through color and copy only

## 11) Accessibility Baseline

- Meet WCAG AA contrast for text and interactive elements.
- Keep keyboard focus visible with gold-accent outline.
- Do not encode meaning with color alone (pair with label/icon/text).
- Ensure chart and bar changes have textual companions (price label, percent label).

## 12) Copy Voice

- Plain, active, exchange-native.
- Label by user intent: credits, shares, price.
- Avoid internal jargon in user-visible copy (pools, invariant, etc.).
- Empty states should suggest a next action.

Preferred examples:

- `Buy YES`
- `Buy NO`
- `Simulate`
- `Bought 42 YES @ 0.61`

Footer legal line:

`Simulation - virtual credits - no cash value`

## 13) Tailwind Token Mapping

```javascript
// tailwind.config.cjs
theme: {
  extend: {
    colors: {
      ink: "#14161B",
      surface: "#F7F8FA",
      card: "#FFFFFF",
      gold: "#FFC904",
      "gold-ink": "#8A6B00",
      yes: "#12805C",
      no: "#C6432E",
      muted: "#6B7280",
      line: "#E2E5EA",
      deck: "#1B1E26",
    },
    fontFamily: {
      display: ['"Space Grotesk"', "sans-serif"],
      body: ["Inter", "sans-serif"],
      data: ['"JetBrains Mono"', "monospace"],
    },
    borderRadius: {
      card: "12px",
      btn: "8px",
    },
  },
}
```

## 14) Landing Page (Home)

The home route (`/`) is a section-by-section marketing page. It explains the product; it is not a trading surface.

### Section order (fixed)

1. **Hero** — full-bleed dark band, optional background image, rotating headline.
2. **How it works** — three steps (browse → trade → track).
3. **Markets preview** — up to three live `MarketCard` components.
4. **Platform features** — probability bar, AI brief, portfolio.
5. **Campus demo** — seeded category examples on deck background.
6. **Final CTA** — login / markets entry.

### Hero band (Polymarket-inspired)

- Full width, min-height ~`88vh`, `--deck` base with gradient overlays.
- Background image is optional and loaded from static assets (see below).
- Eyebrow: gold uppercase label (`Knightshi`).
- **Rotating headline**: 4 lines, **3 second** interval, fade transition ~280ms.
- Static subline below the rotator (does not rotate).
- Primary CTA: gold fill; secondary: ghost on dark.
- Phase dots under CTAs — one per rotating line; active dot uses `--gold`.

### Hero assets folder

Upload images to:

`frontend/public/landing/`

| File | Role |
| --- | --- |
| `hero-background.webp` | Primary hero background (recommended) |
| `hero-background.jpg` | Fallback |
| `hero-background.png` | Second fallback |

Served at `/landing/…`. If no file loads, use deck gradient only — do not break layout.

Optional section art: `section-how-it-works.webp`, `section-campus.webp` (documented in that folder’s README).

### Landing motion

| Element | Behavior | Duration |
| --- | --- | --- |
| Hero headline rotation | Fade out/in between lines | 280ms transition, 3000ms hold |
| Phase dots | Width expand on active | 300ms |
| Hero background | Opacity fade-in on load | 500ms |

For `prefers-reduced-motion: reduce`:

- Stop headline rotation; show the first line only.
- Keep phase dots static on the first line.
- No fade on headline swap.

### Landing vs trading

- Do not embed a trade panel or live chart in the home hero.
- Use real market cards only in the preview section (API-driven).
- Keep footer legal line on the global app shell, not duplicated in every section.

## 15) AI Decision Tree (When Unsure)

If an AI must choose between options:

1. Choose readability over novelty.
2. Choose existing token/class reuse over new styling.
3. Choose explicit labels over short/clever labels.
4. Choose stable layout over motion-heavy interaction.
5. On market pages, choose probability-bar clarity over decorative UI.
6. On the landing page, choose clear section rhythm over a single dense block.

If still ambiguous, ask the user before introducing new visual patterns.
