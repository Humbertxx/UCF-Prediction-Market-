/**
 * Login — Google Identity Services (primary) + demo email fallback.
 */

import { type FormEvent, useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { isGoogleAuthConfigured, renderGoogleSignInButton } from "../lib/googleAuth";

export default function Login() {
  const {
    login,
    loginWithGoogleIdToken,
    isAuthenticated,
    loading,
    error,
  } = useAuth();
  const navigate = useNavigate();
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [googleReady, setGoogleReady] = useState(false);

  const googleConfigured = isGoogleAuthConfigured();

  useEffect(() => {
    if (!googleConfigured || !googleButtonRef.current) return;

    let cancelled = false;
    void renderGoogleSignInButton(googleButtonRef.current, async (idToken) => {
      setLocalError(null);
      setSubmitting(true);
      const ok = await loginWithGoogleIdToken(idToken);
      setSubmitting(false);
      if (ok) navigate("/markets", { replace: true });
    })
      .then(() => {
        if (!cancelled) setGoogleReady(true);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLocalError(
            err instanceof Error
              ? err.message
              : "Google Sign-In failed to load.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [googleConfigured, loginWithGoogleIdToken, navigate]);

  if (!loading && isAuthenticated) {
    return <Navigate to="/markets" replace />;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLocalError(null);
    const trimmed = email.trim();
    if (!trimmed.includes("@")) {
      setLocalError("Enter a valid email address.");
      return;
    }
    setSubmitting(true);
    const ok = await login({
      email: trimmed,
      name: name.trim() || undefined,
    });
    setSubmitting(false);
    if (ok) navigate("/markets", { replace: true });
  }

  return (
    <main className="mx-auto flex max-w-md flex-col px-4 py-12">
      <p className="font-display text-sm font-medium uppercase tracking-[0.16em] text-gold-ink">
        Knightshi
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold text-ink">
        Sign in
      </h1>
      <p className="mt-2 text-base text-muted">
        Continue with Google for a real account, or use demo email login. Admin
        is gated by{" "}
        <span className="font-data text-sm">ADMIN_EMAILS</span>.
      </p>

      {googleConfigured && (
        <div className="mt-8 rounded-card border border-line bg-card p-6">
          <p className="mb-3 text-sm font-medium text-ink">Google</p>
          <div ref={googleButtonRef} className="flex min-h-[44px] justify-center" />
          {!googleReady && !localError && (
            <p className="mt-2 text-center text-sm text-muted">Loading Google…</p>
          )}
        </div>
      )}

      {!googleConfigured && (
        <p className="mt-6 rounded-btn border border-line bg-card px-3 py-2 text-sm text-muted">
          Set <span className="font-data">VITE_GOOGLE_CLIENT_ID</span> to enable
          Google Sign-In. Demo login still works below.
        </p>
      )}

      <form
        onSubmit={onSubmit}
        className="mt-6 space-y-4 rounded-card border border-line bg-card p-6"
      >
        <p className="text-sm font-medium text-ink">Demo email</p>
        <label className="block">
          <span className="text-sm font-medium text-ink">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-btn border border-line bg-surface px-3 py-2 text-base text-ink outline-hidden focus:ring-2 focus:ring-gold"
            placeholder="you@gmail.com"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink">
            Display name <span className="text-muted">(optional)</span>
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-btn border border-line bg-surface px-3 py-2 text-base text-ink outline-hidden focus:ring-2 focus:ring-gold"
            placeholder="Judge"
          />
        </label>

        {(localError || error) && (
          <p
            className="rounded-btn border border-line bg-surface px-3 py-2 text-sm text-ink"
            role="alert"
          >
            {localError || error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || loading}
          className="w-full rounded-btn bg-deck px-4 py-2.5 font-display text-base font-medium text-card transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:opacity-50"
        >
          {submitting ? "Signing in…" : "Continue with email"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        <Link to="/" className="text-ink underline-offset-2 hover:underline">
          Back home
        </Link>
      </p>
    </main>
  );
}
