/**
 * App shell.
 *
 * Purpose:
 * - Define client-side routes for the demo pages.
 *
 * Intended behavior:
 * - Keep routing thin; each page owns its own data fetching via hooks.
 */

import { BrowserRouter, Route, Routes } from "react-router-dom";

import Admin from "./pages/Admin";
import Home from "./pages/Home";
import Leaderboard from "./pages/Leaderboard";
import MarketPage from "./pages/MarketPage";
import Markets from "./pages/Markets";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/markets" element={<Markets />} />
        <Route path="/markets/:marketId" element={<MarketPage />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}
