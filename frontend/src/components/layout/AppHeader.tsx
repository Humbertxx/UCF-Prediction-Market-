/**
 * Shared app chrome — brand band + auth-aware nav.
 * Trading P/L lives on /portfolio and /profile — not in this header.
 */

import { Link, NavLink } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-btn px-2 py-1 text-small transition",
    isActive ? "bg-gold/20 text-ink" : "text-muted hover:text-ink",
  ].join(" ");

export default function AppHeader() {
  const { user, isAuthenticated, logout, loading } = useAuth();

  return (
    <header className="border-b border-line bg-deck text-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="font-display text-body font-semibold tracking-tight">
          UCF Prediction Market
        </Link>

        <nav className="flex flex-wrap items-center gap-1">
          <NavLink to="/markets" className={linkClass}>
            Markets
          </NavLink>
          <NavLink to="/features" className={linkClass}>
            AI Brief
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/portfolio" className={linkClass}>
              Portfolio
            </NavLink>
          )}
          {isAuthenticated && (
            <NavLink to="/profile" className={linkClass}>
              Profile
            </NavLink>
          )}
          {user?.is_admin && (
            <NavLink to="/admin" className={linkClass}>
              Admin
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-3 text-small">
          {loading ? (
            <span className="text-muted">…</span>
          ) : isAuthenticated && user ? (
            <>
              <Link
                to="/profile"
                className="hidden max-w-[12rem] truncate font-data text-card/80 sm:inline hover:text-card"
              >
                {user.name ?? user.email}
              </Link>
              <button
                type="button"
                onClick={logout}
                className="rounded-btn border border-card/30 px-2 py-1 text-card hover:bg-card/10"
              >
                Log out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-btn bg-gold px-3 py-1 font-medium text-ink"
            >
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
