/**
 * Market detail page.
 *
 * Purpose:
 * - Show deep market context, pricing, order inputs, and trade history.
 *
 * Intended behavior:
 * - Be the primary interaction surface for placing trades in one market.
 *
 * Current state: only the Gemini insight panel is mounted. The probability
 * bar, price chart, trade panel, and trade feed are built in their own phases
 * and slot in around it (insight stays visually secondary per DESIGN.md).
 */

import { useParams } from "react-router-dom";

import MarketInsight from "../components/market/MarketInsight";

export default function MarketPage() {
  const { marketId } = useParams<{ marketId: string }>();

  if (!marketId) {
    return (
      <main className="mx-auto max-w-5xl p-4">
        <p className="text-sm text-muted">Market not found.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl space-y-4 p-4">
      {/* Probability bar, chart, and trade panel mount here (later phases). */}
      <MarketInsight marketId={marketId} />
    </main>
  );
}
