/** Market domain types — mirror backend schemas. */

export type MarketStatus = "seeded" | "trading" | "resolving" | "resolved";

export type MarketOutcome = "yes" | "no";

export type TradeSide = "yes" | "no";

export interface MarketSummary {
  id: string;
  slug: string;
  title: string;
  status: MarketStatus;
  pool_yes: number;
  pool_no: number;
  yes_price_bps: number;
  created_at: string;
}

export interface MarketDetail extends MarketSummary {
  description: string;
  k_constant: number;
  resolution_outcome: MarketOutcome | null;
  resolved_at: string | null;
}

export interface PricePoint {
  trade_id: number;
  yes_price_bps: number;
  created_at: string;
}

export interface TradeHistoryItem {
  id: number;
  side: TradeSide;
  shares: number;
  cost_credits: number;
  yes_price_bps: number;
  is_bot: boolean;
  bot_label: string | null;
  created_at: string;
}

export interface TradeCreatePayload {
  market_id: string;
  side: TradeSide;
  amount: number;
}

export interface TradeResult {
  trade_id: number;
  market_id: string;
  side: TradeSide;
  shares: number;
  cost: number;
  yes_price_bps: number;
  balance_after: number;
}

export interface Position {
  market_id: string;
  market_title: string;
  market_slug: string;
  market_status: MarketStatus;
  yes_price_bps: number;
  resolution_outcome: MarketOutcome | null;
  resolved_at: string | null;
  yes_shares: number;
  no_shares: number;
  cost_basis_credits: number;
  realized_pnl: number;
  market_value_credits: number;
  unrealized_pnl: number;
}

export interface Wallet {
  user_id: string;
  balance_credits: number;
  initial_grant: number;
}
