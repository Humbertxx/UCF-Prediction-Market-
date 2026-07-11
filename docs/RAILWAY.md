# Deploying Knightshi on Railway

Two services from one GitHub monorepo:

| Service | Root Directory | Config file | Role |
| --- | --- | --- | --- |
| **API** | `/` (repo root) | [`railway.toml`](../railway.toml) | FastAPI + uvicorn |
| **Frontend** | `/frontend` | [`frontend/railway.toml`](../frontend/railway.toml) | Vite build + Caddy SPA |

Do **not** set the API root to `/backend` — imports and Alembic expect the repo root (`backend.main:app`).

## 1. Create the project

1. New Railway project → connect this GitHub repo.
2. Add **two empty services** (not one auto-detected service for the whole repo).
3. Name them clearly, e.g. `API` and `Frontend` (reference vars below assume `API`).

### API service settings

- **Root Directory:** `/` (empty / repo root)
- **Config as Code path:** `/railway.toml`
- **Watch Paths:** `/backend/**`, `requirements.txt`, `alembic.ini`, `railway.toml`
- **Replicas:** `1` (bots run in-process; do not scale horizontally)

Start command (from config):  

`uvicorn backend.main:app --host 0.0.0.0 --port $PORT`

Pre-deploy: `alembic upgrade head`  
Health check: `/health`

### Frontend service settings

- **Root Directory:** `/frontend`
- **Config as Code path:** `/frontend/railway.toml`
- **Watch Paths:** `/frontend/**`

Build produces `dist/`; Caddy serves it with SPA `try_files` fallback (refresh on `/markets` works).

## 2. Environment variables

### API service

| Variable | Notes |
| --- | --- |
| `DATABASE_URL` | Supabase Postgres connection string |
| `JWT_SECRET` | Strong secret (not the local default) |
| `ADMIN_EMAILS` | Comma-separated admin emails |
| `GEMINI_API_KEY` | Optional; insight falls back if unset |
| `GOOGLE_CLIENT_ID` | Optional Google sign-in |
| `GOOGLE_CLIENT_SECRET` | Optional |

### Frontend service (build-time)

Vite bakes `VITE_*` into the bundle. Set these **before** (or then **redeploy**) the frontend:

| Variable | Notes |
| --- | --- |
| `VITE_API_BASE_URL` | Must be the public API origin, e.g. `https://${{API.RAILWAY_PUBLIC_DOMAIN}}` |
| `VITE_GOOGLE_CLIENT_ID` | Same as backend `GOOGLE_CLIENT_ID` |
| `VITE_SUPABASE_URL` | Public Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | Anon key |

`frontend/src/lib/api.ts` falls back to `http://localhost:8000` only for local dev. Production **must** set `VITE_API_BASE_URL`.

## 3. Deploy order (important for `VITE_API_BASE_URL`)

1. Deploy **API** first.
2. **Generate Domain** on the API service.
3. On **Frontend**, set:
   ```text
   VITE_API_BASE_URL=https://${{API.RAILWAY_PUBLIC_DOMAIN}}
   ```
   (Use your actual API service name if it is not `API`.)
4. Deploy / redeploy **Frontend** so Vite rebuilds with that URL.
5. **Generate Domain** on the Frontend service.
6. In [Google Cloud Console](https://console.cloud.google.com/) → OAuth client → **Authorized JavaScript origins**, add the frontend public URL (e.g. `https://your-app.up.railway.app`).

## 4. First-run data

Migrations run via `preDeployCommand` (`alembic upgrade head`).

If `/markets` is empty after deploy, seed once from the API service:

```bash
railway run -s API python -m backend.seed
```

(Adjust `-s` to your API service name.)

## 5. Smoke check

- `GET https://<api-domain>/health` → `{"status":"ok"}`
- `GET https://<api-domain>/markets` → seeded markets JSON
- Open the frontend domain → markets load (not localhost)
- Hard-refresh `/markets` → still 200 (SPA rewrite)

## Local vs Railway

| | Local | Railway |
| --- | --- | --- |
| API | `uvicorn ... --reload --port 8000` | `0.0.0.0:$PORT`, no reload |
| Frontend | `npm run dev` on `:5173` | Caddy serves `dist` |
| API URL | `VITE_API_BASE_URL=http://localhost:8000` | Public Railway HTTPS API URL |
