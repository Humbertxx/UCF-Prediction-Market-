/**
 * App shell — routes for the demo pages.
 */

import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";

import AppHeader from "./components/layout/AppHeader";
import Admin from "./pages/Admin";
import Features from "./pages/Features";
import HowItWorks from "./pages/HowItWorks";
import Login from "./pages/Login";
import MarketPage from "./pages/MarketPage";
import Markets from "./pages/Markets";
import Portfolio from "./pages/Portfolio";
import Profile from "./pages/Profile";

const Home = lazy(() => import("./pages/Home"));

function HomeFallback() {
  return (
    <div
      className="min-h-[min(88vh,52rem)] bg-deck"
      role="status"
      aria-label="Loading home page"
    />
  );
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-surface">
      <AppHeader />
      <Suspense fallback={<HomeFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/markets" element={<Markets />} />
          <Route path="/features" element={<Features />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/markets/:marketId" element={<MarketPage />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Suspense>
      <footer className="mt-auto border-t border-line py-4 text-center text-xs text-muted">
        Simulation - virtual credits - no cash value
      </footer>
    </div>
  );
}
