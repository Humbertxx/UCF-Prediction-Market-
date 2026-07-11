Agent-facing context auto-loaded by Claude Code from repo root. Read `AGENTS.md` for build order and detailed guardrails, `DESIGN.md` for UI guidance, and `.cursor/rules/*.mdc` for Cursor-scoped rules. `README.md` is the public project overview.

# Prime directives

1. **Demo reliability > completeness.**
2. **Ask before adding any dependency.** Verify current package/model names against docs — don't trust memory.
3. **Stay on the locked stack.**
4. **Additive backend** — add new models/tables; do NOT refactor StudySpot's `auth/` or user models.
5. **Commit at every green checkpoint.** One feature per change.
6. **Secrets in `.env` only** — never in this file, rules, skills, or the frontend bundle.

# Locked stack

- Frontend: React 18 + TS + **Vite** + **Tailwind** + Recharts + `@supabase/supabase-js` + Axios. No React Native, no other CSS framework.
- Backend: FastAPI + SQLAlchemy + Alembic + Supabase Postgres/Realtime + JWT.
- AI: **Gemini `gemini-2.5-flash` via `google-genai`** (NOT google-generativeai, NOT Groq/llama). JSON via response_mime_type + response_schema. Key server-side.
- Auth: Google OAuth reused from StudySpot.
- Out of scope: blockchain, wallets, Solana, or any on-chain features/packages.

# Core rules

- All CPMM math only in `backend/services/amm.py`. Invariant `x·y=k`. **Integer credits only.**
- Bots: admin-triggered, 1–3s, belief `~ Normal(hardcoded p_true, σ)`.
- Realtime: Supabase `postgres_changes` on `trades` + 3s polling fallback in the same hook.
- Frontend derives all color/type/motion from DESIGN tokens via Tailwind — no hardcoded hex.

# When unsure

State the assumption, make the smallest reversible change, flag it. If a task would touch auth, delete data, add a dependency, or put an external API on the critical path — stop and ask.
