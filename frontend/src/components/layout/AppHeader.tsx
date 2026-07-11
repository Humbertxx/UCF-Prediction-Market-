/**
 * Shared app chrome — brand band + auth-aware nav.
 * Trading P/L lives on /portfolio and /profile — not in this header.
 */

import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

const desktopLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-btn px-2 py-1 text-sm transition",
    isActive ? "bg-gold/20 text-card" : "text-card/70 hover:text-card",
  ].join(" ");

const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "block rounded-btn px-3 py-2.5 text-sm font-medium transition",
    isActive ? "bg-gold/20 text-card" : "text-card/80 hover:bg-card/10 hover:text-card",
  ].join(" ");

function NavItems({ className }: { className: string }) {
  const { user, isAuthenticated } = useAuth();

  return (
    <nav className={className}>
      <NavLink to="/markets" className={mobileLinkClass}>
        Markets
      </NavLink>
      <NavLink to="/how-it-works" className={mobileLinkClass}>
        How it works
      </NavLink>
      <NavLink to="/features" className={mobileLinkClass}>
        AI Brief
      </NavLink>
      {isAuthenticated && (
        <NavLink to="/portfolio" className={mobileLinkClass}>
          Portfolio
        </NavLink>
      )}
      {isAuthenticated && (
        <NavLink to="/profile" className={mobileLinkClass}>
          Profile
        </NavLink>
      )}
      {user?.is_admin && (
        <NavLink to="/admin" className={mobileLinkClass}>
          Admin
        </NavLink>
      )}
    </nav>
  );
}

function DesktopNavItems() {
  const { user, isAuthenticated } = useAuth();

  return (
    <nav className="hidden items-center gap-1 md:flex">
      <NavLink to="/markets" className={desktopLinkClass}>
        Markets
      </NavLink>
      <NavLink to="/how-it-works" className={desktopLinkClass}>
        How it works
      </NavLink>
      <NavLink to="/features" className={desktopLinkClass}>
        AI Brief
      </NavLink>
      {isAuthenticated && (
        <NavLink to="/portfolio" className={desktopLinkClass}>
          Portfolio
        </NavLink>
      )}
      {isAuthenticated && (
        <NavLink to="/profile" className={desktopLinkClass}>
          Profile
        </NavLink>
      )}
      {user?.is_admin && (
        <NavLink to="/admin" className={desktopLinkClass}>
          Admin
        </NavLink>
      )}
    </nav>
  );
}

export default function AppHeader() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <header className="border-b border-line bg-deck text-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link
          to="/"
          className="shrink-0 font-display text-base font-semibold tracking-tight sm:text-lg"
        >
          Knightshi
        </Link>

        <DesktopNavItems />

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-3 text-sm md:flex">
            {loading ? (
              <span className="text-card/60">…</span>
            ) : isAuthenticated && user ? (
              <>
                <Link
                  to="/profile"
                  className="hidden max-w-[12rem] truncate font-data text-card/80 lg:inline hover:text-card"
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

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-btn border border-card/30 text-card hover:bg-card/10 md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
            {menuOpen ? (
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          id="mobile-nav"
          className="border-t border-card/15 px-4 py-3 md:hidden"
        >
          <NavItems className="flex flex-col gap-1" />

          <div className="mt-3 border-t border-card/15 pt-3">
            {loading ? (
              <span className="text-sm text-card/60">…</span>
            ) : isAuthenticated && user ? (
              <div className="flex flex-col gap-2">
                <p className="truncate px-3 font-data text-sm text-card/70">
                  {user.name ?? user.email}
                </p>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-btn border border-card/30 px-3 py-2.5 text-left text-sm text-card hover:bg-card/10"
                >
                  Log out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="block rounded-btn bg-gold px-3 py-2.5 text-center text-sm font-medium text-ink"
              >
                Log in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
