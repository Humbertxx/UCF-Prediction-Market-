# DESIGN.md

Design guidance for Bloomknights UI implementation.

## Purpose

- Define visual system conventions and token naming.
- Keep frontend components consistent across market, leaderboard, and admin views.
- Serve as the contract between design intent and Tailwind/component implementation.

## Token strategy (initial)

- **Color**: semantic tokens like `bg-surface`, `text-primary`, `border-muted`.
- **Typography**: shared scale for headings, labels, body, and numeric emphasis.
- **Spacing**: use a predictable spacing scale for cards, sections, and dense lists.
- **Radius/Shadow**: standard surface elevation and corner profiles.
- **State**: explicit styles for positive/negative market movement, disabled, loading.

## Component consistency goals

- Reuse common card, table, and badge patterns between pages.
- Keep market probability and P/L values visually distinct and scannable.
- Ensure admin panels clearly separate risky actions from read-only analytics.
