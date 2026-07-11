/**
 * Final CTA band before the global footer.
 */

import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

export default function FinalCtaSection() {
  const { isAuthenticated, user } = useAuth();

  return (
    <section
      className="bg-surface py-16 sm:py-20"
      aria-labelledby="final-cta-heading"
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="rounded-card border border-line bg-card px-6 py-10 text-center sm:px-12">
          <h2
            id="final-cta-heading"
            className="font-display text-2xl font-semibold text-ink sm:text-3xl"
          >
            Ready to place a trade?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-base text-muted">
            Log in with Google or the demo account, receive virtual credits, and
            open any active market. Simulation only — no cash value.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/markets"
                  className="rounded-btn bg-deck px-6 py-3 font-display font-medium text-card"
                >
                  Go to markets
                </Link>
                <Link
                  to="/portfolio"
                  className="rounded-btn border border-line px-6 py-3 font-display font-medium text-ink"
                >
                  Open portfolio
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-btn bg-deck px-6 py-3 font-display font-medium text-card"
                >
                  Log in
                </Link>
                <Link
                  to="/markets"
                  className="rounded-btn border border-line px-6 py-3 font-display font-medium text-ink"
                >
                  Browse first
                </Link>
              </>
            )}
          </div>

          {isAuthenticated && user && (
            <p className="mt-6 font-data text-sm text-muted">
              Signed in as {user.name ?? user.email}
              {user.is_admin ? " · admin" : ""}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
