/**
 * Supabase browser client (Realtime only).
 *
 * App auth uses ``POST /auth/demo`` + localStorage JWT (see ``lib/auth.ts``);
 * this client exists solely for ``postgres_changes`` on the ``trades`` table
 * (see ``hooks/useTrades.ts``). Returns ``null`` when the public env vars are
 * missing, so the app still runs on the 3s polling fallback.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const viteEnv = (import.meta as { env?: Record<string, string | undefined> }).env;
const SUPABASE_URL = viteEnv?.VITE_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = viteEnv?.VITE_SUPABASE_ANON_KEY ?? "";

let client: SupabaseClient | null | undefined;

export function getSupabaseClient(): SupabaseClient | null {
  if (client !== undefined) return client;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    client = null;
    return client;
  }
  client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
    // No app-auth token flows here; realtime read is authorized by the anon
    // RLS policy on `trades`.
  });
  return client;
}
