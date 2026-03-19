// ============================================================
// Groww MCP — Shared TypeScript Interfaces
// ============================================================

// ---------- PORTFOLIO ----------

export interface Holding {
  symbol: string;
  exchange: string;
  name: string;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  currentValue: number;
  investedValue: number;
  pnl: number;
  pnlPercent: number;
  dayChange: number;
  dayChangePercent: number;
}

export interface PortfolioSummary {
  totalInvested: number;
  currentValue: number;
  totalPnl: number;
  totalPnlPercent: number;
  dayPnl: number;
  dayPnlPercent: number;
  holdingsCount: number;
}

export interface Position {
  symbol: string;
  exchange: string;
  name: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  orderType: "BUY" | "SELL";
  productType: "MIS" | "CNC" | "NRML";
}

export interface Order {
  orderId: string;
  symbol: string;
  exchange: string;
  orderType: "BUY" | "SELL";
  productType: "CNC" | "MIS" | "NRML";
  priceType: "MARKET" | "LIMIT";
  quantity: number;
  price: number;
  triggerPrice: number;
  status: "PENDING" | "EXECUTED" | "CANCELLED" | "REJECTED" | "PARTIAL";
  filledQuantity: number;
  avgFilledPrice: number;
  timestamp: string;
  remarks: string;
}

// ---------- MARKET ----------

export interface Quote {
  symbol: string;
  exchange: string;
  name: string;
  ltp: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  marketCap: number;
  bid: number;
  ask: number;
  timestamp: string;
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: "EQUITY" | "MF" | "ETF";
  isin: string;
}

export interface OHLCCandle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TopMover {
  symbol: string;
  name: string;
  ltp: number;
  change: number;
  changePercent: number;
}

export interface MarketStatus {
  exchange: string;
  status: "OPEN" | "CLOSED" | "PRE_OPEN" | "POST_CLOSE";
  message: string;
  timestamp: string;
}

// ---------- ORDERS ----------

export interface PlaceOrderRequest {
  symbol: string;
  exchange: string;
  orderType: "BUY" | "SELL";
  productType: "CNC" | "MIS" | "NRML";
  priceType: "MARKET" | "LIMIT";
  quantity: number;
  price?: number;
  triggerPrice?: number;
}

export interface PlaceOrderResponse {
  orderId: string;
  status: string;
  message: string;
}

export interface ModifyOrderRequest {
  orderId: string;
  quantity?: number;
  price?: number;
  triggerPrice?: number;
}

// ---------- WATCHLIST ----------

export interface WatchlistItem {
  symbol: string;
  exchange: string;
  name: string;
  ltp: number;
  change: number;
  changePercent: number;
}

// ---------- SIP ----------

export interface SIP {
  sipId: string;
  fundName: string;
  isin: string;
  amount: number;
  frequency: "MONTHLY" | "WEEKLY" | "QUARTERLY";
  startDate: string;
  nextDate: string;
  status: "ACTIVE" | "PAUSED" | "CANCELLED";
  totalInvested: number;
  currentValue: number;
  instalments: number;
}

export interface CreateSIPRequest {
  isin: string;
  amount: number;
  frequency: "MONTHLY" | "WEEKLY" | "QUARTERLY";
  startDate: string;
}

// ---------- MUTUAL FUNDS ----------

export interface MutualFund {
  isin: string;
  name: string;
  amc: string;
  category: string;
  subCategory: string;
  nav: number;
  aum: number;
  expenseRatio: number;
  riskGrade: "LOW" | "MODERATELY_LOW" | "MODERATE" | "MODERATELY_HIGH" | "HIGH";
  returns1y: number;
  returns3y: number;
  returns5y: number;
  minInvestment: number;
  minSIPAmount: number;
  exitLoad: string;
  rating: number;
}

export interface MutualFundSearchResult {
  isin: string;
  name: string;
  amc: string;
  category: string;
  nav: number;
  returns1y: number;
  rating: number;
}

export interface InvestRequest {
  isin: string;
  amount: number;
}

export interface InvestResponse {
  transactionId: string;
  status: string;
  message: string;
  units: number;
  nav: number;
}

// ---------- API RESPONSE WRAPPER ----------

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errorCode?: string;
}

// ---------- TOOL ERROR ----------

export interface ToolError {
  isError: true;
  content: Array<{ type: "text"; text: string }>;
}
