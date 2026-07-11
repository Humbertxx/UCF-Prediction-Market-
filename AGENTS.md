# AGENTS.md

Cross-agent operating guide for Cursor, Claude Code, Codex, Gemini CLI, and similar assistants working on BloomKnights.

## Read Order

1. `AGENTS.md` for build order, locked decisions, and guardrails.
2. `.cursor/rules/*.mdc` for scoped coding rules.
3. `DESIGN.md` for frontend tokens, motion, and visual style.
4. `CLAUDE.md` for Claude Code session bootstrap.
5. `README.md` for the public project overview only.

## Prime Directives

1. Demo reliability beats completeness.
2. Ask before adding dependencies.
3. Keep changes small, reversible, and scoped to the current task.
4. Commit only when the user explicitly asks.
5. Keep secrets in `.env` only. Never put real keys in docs, rules, prompts, frontend code, or skill files.

## Locked Decisions

| Area | Decision |
| --- | --- |
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Charts | Recharts |
| Backend | FastAPI + SQLAlchemy + Alembic |
| Database | Supabase Postgres |
| Realtime | Supabase `postgres_changes` on `trades` plus 3-second polling fallback |
| AMM | Constant-product market maker, `x*y=k`, integer credits only |
| AI | One Gemini insight feature via `google-genai` |
| Auth | Google OAuth -> app JWT |
| Bots | Admin-triggered belief traders around hardcoded `p_true` |

Explicit cuts: no blockchain, wallets, or on-chain work; no React Native or Expo; no Prisma; no alternate CSS framework; no alternate ORM; no Redux unless the user explicitly approves a later architecture change. Do not add blockchain or wallet packages.

## Implementation Order

Build in this order unless the user asks for a narrower task:

1. Backend market core.
2. Database migration and seed markets.
3. AMM math in `backend/services/amm.py`.
4. Atomic trade execution.
5. Realtime trade updates and polling fallback.
6. Admin-triggered bot simulation.
7. Frontend market list, detail page, trade panel, positions, and leaderboard.
8. Gemini market insight.
9. Admin resolution, payouts, and PnL.
10. Demo polish and reliability checks.

Do not start with UI polish, bots, or Gemini before the backend trading path is stable.

## Phase Gates

- Gate A: migrations apply cleanly and seed markets exist.
- Gate B: AMM tests show price movement and invariant behavior.
- Gate C: trade endpoint atomically updates trade, pools, user balance, and position.
- Gate D: realtime updates work, with polling fallback.
- Gate E: bot simulation visibly moves prices toward `p_true`.
- Gate F: frontend demo path works from market list to trade to leaderboard.
- Gate G: Gemini insight renders from demo market data and degrades safely.
- Gate H: admin resolution pays out correctly and recomputes leaderboard.

## Backend Rules

- Keep backend changes additive. Do not refactor auth internals unless the user explicitly asks.
- Routes should stay thin; business logic belongs in `backend/services/`.
- All market math belongs in `backend/services/amm.py`.
- Use integer credits and shares. Do not use floats for stored balances, payouts, or positions.
- Trading must update market pools, trade records, positions, and balances atomically.
- Resolve markets through explicit admin routes with evidence/attestation data.

## Frontend Rules

- Use Tailwind utilities and `DESIGN.md` tokens. Do not introduce another styling system.
- Use Recharts for market visualizations.
- Keep Supabase client setup in `frontend/src/lib/supabase.ts`.
- Keep HTTP API setup in `frontend/src/lib/api.ts`.
- Prefer focused hooks such as `useMarket`, `useTrades`, `usePositions`, and `useLeaderboard`.
- Demo states matter: handle loading, empty, error, and disconnected realtime states.

## Realtime Rules

- Subscribe to Supabase `postgres_changes` on `trades`.
- Keep a 3-second polling fallback in the same hook so the chart still moves if the websocket drops.
- Avoid duplicating trade events when realtime and polling both return the same row.

## Bot Rules

- Bots are admin-triggered only.
- Each market has a hardcoded hidden `p_true` for deterministic demo behavior.
- Bots sample a private belief around `p_true`, compare it to the current CPMM price, and buy YES or NO based on conviction.
- Cadence should feel live but controlled, roughly every 1-3 seconds.
- Keep bot code under `backend/bots/`.

## Gemini Rules

- Use the unified `google-genai` SDK only.
- Do not install or use the legacy `google-generativeai` package.
- Keep `GEMINI_API_KEY` server-side.
- Build exactly one AI feature: a market insight explaining what the price/time series suggests.
- Prefer structured JSON output with a schema.
- Add exponential backoff for rate limits and cache one good demo response if practical.
- Send only demo market data, not sensitive user data.

## Environment

Use `.env.example` as the template and copy it to `.env` locally. `.env` is ignored by git.

Required categories:

- Supabase URL, anon key, service role key, and database URL.
- Google OAuth client values.
- JWT secret.
- Gemini API key.
- Frontend public values prefixed with `VITE_`.
- Local dev URLs such as `VITE_API_BASE_URL`, `FRONTEND_URL`, and CORS origins.

## AI Working Style

- Name the file and function you intend to change before editing.
- Prefer one feature per prompt.
- Verify current package names and APIs when wiring SDKs or external services.
- Ask before touching auth, deleting data, adding dependencies, or making external APIs part of the critical demo path.
- If context gets long, commit only when requested, then start a new chat and read this file first.
