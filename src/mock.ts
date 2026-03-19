// ============================================================
// Groww MCP — Mock Data Layer
// Realistic Indian stock market data for demo mode
// ============================================================

import type {
  Holding, PortfolioSummary, Position, Order,
  Quote, StockSearchResult, OHLCCandle, TopMover, MarketStatus,
  PlaceOrderRequest, PlaceOrderResponse, ModifyOrderRequest,
  WatchlistItem,
  SIP, CreateSIPRequest,
  MutualFund, MutualFundSearchResult, InvestRequest, InvestResponse,
} from "./types.js";

function randomId(): string {
  return "GRW" + Math.random().toString(36).substring(2, 10).toUpperCase();
}

function isoNow(): string {
  return new Date().toISOString();
}

const STOCK_DB: Record<string, { name: string; price: number; marketCap: number }> = {
  RELIANCE: { name: "Reliance Industries Ltd", price: 2847.60, marketCap: 19_24_000_00_00_000 },
  TCS: { name: "Tata Consultancy Services Ltd", price: 3945.30, marketCap: 14_32_000_00_00_000 },
  INFY: { name: "Infosys Ltd", price: 1623.75, marketCap: 6_73_000_00_00_000 },
  HDFCBANK: { name: "HDFC Bank Ltd", price: 1712.50, marketCap: 12_98_000_00_00_000 },
  ICICIBANK: { name: "ICICI Bank Ltd", price: 1098.20, marketCap: 7_71_000_00_00_000 },
  WIPRO: { name: "Wipro Ltd", price: 462.35, marketCap: 2_41_000_00_00_000 },
  BAJFINANCE: { name: "Bajaj Finance Ltd", price: 7485.90, marketCap: 4_63_000_00_00_000 },
  SBIN: { name: "State Bank of India", price: 782.45, marketCap: 6_98_000_00_00_000 },
  ITC: { name: "ITC Ltd", price: 438.90, marketCap: 5_47_000_00_00_000 },
  KOTAKBANK: { name: "Kotak Mahindra Bank Ltd", price: 1843.60, marketCap: 3_66_000_00_00_000 },
};

export const MOCK = {
  holdings(): Holding[] {
    return [
      { symbol: "RELIANCE", exchange: "NSE", name: "Reliance Industries Ltd", quantity: 25, avgBuyPrice: 2650.00, currentPrice: 2847.60, currentValue: 71190.00, investedValue: 66250.00, pnl: 4940.00, pnlPercent: 7.46, dayChange: 34.50, dayChangePercent: 1.23 },
      { symbol: "TCS", exchange: "NSE", name: "Tata Consultancy Services Ltd", quantity: 15, avgBuyPrice: 3820.00, currentPrice: 3945.30, currentValue: 59179.50, investedValue: 57300.00, pnl: 1879.50, pnlPercent: 3.28, dayChange: -12.40, dayChangePercent: -0.31 },
      { symbol: "INFY", exchange: "NSE", name: "Infosys Ltd", quantity: 40, avgBuyPrice: 1580.00, currentPrice: 1623.75, currentValue: 64950.00, investedValue: 63200.00, pnl: 1750.00, pnlPercent: 2.77, dayChange: 8.90, dayChangePercent: 0.55 },
      { symbol: "HDFCBANK", exchange: "NSE", name: "HDFC Bank Ltd", quantity: 30, avgBuyPrice: 1640.00, currentPrice: 1712.50, currentValue: 51375.00, investedValue: 49200.00, pnl: 2175.00, pnlPercent: 4.42, dayChange: 21.30, dayChangePercent: 1.26 },
      { symbol: "ICICIBANK", exchange: "NSE", name: "ICICI Bank Ltd", quantity: 50, avgBuyPrice: 1045.00, currentPrice: 1098.20, currentValue: 54910.00, investedValue: 52250.00, pnl: 2660.00, pnlPercent: 5.09, dayChange: 15.60, dayChangePercent: 1.44 },
      { symbol: "WIPRO", exchange: "NSE", name: "Wipro Ltd", quantity: 60, avgBuyPrice: 475.00, currentPrice: 462.35, currentValue: 27741.00, investedValue: 28500.00, pnl: -759.00, pnlPercent: -2.66, dayChange: -5.20, dayChangePercent: -1.11 },
      { symbol: "BAJFINANCE", exchange: "NSE", name: "Bajaj Finance Ltd", quantity: 10, avgBuyPrice: 7250.00, currentPrice: 7485.90, currentValue: 74859.00, investedValue: 72500.00, pnl: 2359.00, pnlPercent: 3.25, dayChange: 62.40, dayChangePercent: 0.84 },
    ];
  },

  portfolioSummary(): PortfolioSummary {
    return {
      totalInvested: 389200.00,
      currentValue: 404204.50,
      totalPnl: 15004.50,
      totalPnlPercent: 3.86,
      dayPnl: 4823.80,
      dayPnlPercent: 1.21,
      holdingsCount: 7,
    };
  },

  positions(): Position[] {
    return [
      { symbol: "RELIANCE", exchange: "NSE", name: "Reliance Industries Ltd", quantity: 10, buyPrice: 2835.00, currentPrice: 2847.60, pnl: 126.00, pnlPercent: 0.44, orderType: "BUY", productType: "MIS" },
      { symbol: "SBIN", exchange: "NSE", name: "State Bank of India", quantity: 100, buyPrice: 778.30, currentPrice: 782.45, pnl: 415.00, pnlPercent: 0.53, orderType: "BUY", productType: "MIS" },
    ];
  },

  orderHistory(): Order[] {
    return [
      { orderId: "GRW8A3F2K1P", symbol: "RELIANCE", exchange: "NSE", orderType: "BUY", productType: "CNC", priceType: "MARKET", quantity: 25, price: 0, triggerPrice: 0, status: "EXECUTED", filledQuantity: 25, avgFilledPrice: 2650.00, timestamp: "2025-01-15T09:32:00Z", remarks: "" },
      { orderId: "GRW7B2E4M3Q", symbol: "TCS", exchange: "NSE", orderType: "BUY", productType: "CNC", priceType: "LIMIT", quantity: 15, price: 3820.00, triggerPrice: 0, status: "EXECUTED", filledQuantity: 15, avgFilledPrice: 3820.00, timestamp: "2025-02-03T10:15:00Z", remarks: "" },
      { orderId: "GRW6C1D5N4R", symbol: "WIPRO", exchange: "NSE", orderType: "BUY", productType: "CNC", priceType: "MARKET", quantity: 60, price: 0, triggerPrice: 0, status: "EXECUTED", filledQuantity: 60, avgFilledPrice: 475.00, timestamp: "2025-02-20T11:05:00Z", remarks: "" },
      { orderId: "GRW5D9F6O5S", symbol: "INFY", exchange: "NSE", orderType: "SELL", productType: "MIS", priceType: "LIMIT", quantity: 20, price: 1640.00, triggerPrice: 0, status: "CANCELLED", filledQuantity: 0, avgFilledPrice: 0, timestamp: "2025-03-10T14:22:00Z", remarks: "Cancelled by user" },
      { orderId: "GRW4E8G7P6T", symbol: "HDFCBANK", exchange: "NSE", orderType: "BUY", productType: "CNC", priceType: "LIMIT", quantity: 10, price: 1700.00, triggerPrice: 0, status: "PENDING", filledQuantity: 0, avgFilledPrice: 0, timestamp: "2025-03-19T09:15:00Z", remarks: "" },
    ];
  },

  quote(symbol: string, exchange: string): Quote {
    const sym = symbol.toUpperCase();
    const stock = STOCK_DB[sym];
    const price = stock?.price ?? 1500.00;
    const name = stock?.name ?? `${sym} Ltd`;
    const mcap = stock?.marketCap ?? 1_00_000_00_00_000;
    const change = +(price * 0.0123).toFixed(2);

    return {
      symbol: sym,
      exchange: exchange || "NSE",
      name,
      ltp: price,
      change,
      changePercent: 1.23,
      open: +(price - change * 0.7).toFixed(2),
      high: +(price * 1.005).toFixed(2),
      low: +(price * 0.992).toFixed(2),
      close: +(price - change).toFixed(2),
      volume: 4_32_00_000,
      marketCap: mcap,
      bid: +(price - 0.10).toFixed(2),
      ask: +(price + 0.10).toFixed(2),
      timestamp: isoNow(),
    };
  },

  searchStocks(query: string): StockSearchResult[] {
    const q = query.toUpperCase();
    const results: StockSearchResult[] = [];
    for (const [sym, data] of Object.entries(STOCK_DB)) {
      if (sym.includes(q) || data.name.toUpperCase().includes(q)) {
        results.push({ symbol: sym, name: data.name, exchange: "NSE", type: "EQUITY", isin: `INE${sym.substring(0, 3)}01010` });
      }
    }
    if (results.length === 0) {
      results.push({ symbol: "RELIANCE", name: "Reliance Industries Ltd", exchange: "NSE", type: "EQUITY", isin: "INE002A01018" });
    }
    return results;
  },

  ohlc(symbol: string, interval: string): OHLCCandle[] {
    const sym = symbol.toUpperCase();
    const base = STOCK_DB[sym]?.price ?? 1500;
    const candles: OHLCCandle[] = [];
    const count = interval === "1d" ? 30 : interval === "1w" ? 52 : interval === "1m" ? 12 : 5;

    for (let i = count; i >= 1; i--) {
      const date = new Date();
      if (interval === "1d") date.setDate(date.getDate() - i);
      else if (interval === "1w") date.setDate(date.getDate() - i * 7);
      else if (interval === "1m") date.setMonth(date.getMonth() - i);
      else date.setFullYear(date.getFullYear() - i);

      const drift = (Math.random() - 0.5) * base * 0.04;
      const o = +(base + drift).toFixed(2);
      const c = +(o + (Math.random() - 0.45) * base * 0.02).toFixed(2);
      const h = +(Math.max(o, c) * (1 + Math.random() * 0.01)).toFixed(2);
      const l = +(Math.min(o, c) * (1 - Math.random() * 0.01)).toFixed(2);

      candles.push({ timestamp: date.toISOString().split("T")[0]!, open: o, high: h, low: l, close: c, volume: Math.floor(1_00_000 + Math.random() * 50_00_000) });
    }
    return candles;
  },

  topMovers(): { gainers: TopMover[]; losers: TopMover[] } {
    return {
      gainers: [
        { symbol: "BAJFINANCE", name: "Bajaj Finance Ltd", ltp: 7485.90, change: 185.40, changePercent: 2.54 },
        { symbol: "ICICIBANK", name: "ICICI Bank Ltd", ltp: 1098.20, change: 22.10, changePercent: 2.05 },
        { symbol: "HDFCBANK", name: "HDFC Bank Ltd", ltp: 1712.50, change: 28.90, changePercent: 1.72 },
        { symbol: "RELIANCE", name: "Reliance Industries Ltd", ltp: 2847.60, change: 34.50, changePercent: 1.23 },
        { symbol: "SBIN", name: "State Bank of India", ltp: 782.45, change: 8.65, changePercent: 1.12 },
      ],
      losers: [
        { symbol: "WIPRO", name: "Wipro Ltd", ltp: 462.35, change: -8.45, changePercent: -1.79 },
        { symbol: "ITC", name: "ITC Ltd", ltp: 438.90, change: -5.30, changePercent: -1.19 },
        { symbol: "TCS", name: "Tata Consultancy Services Ltd", ltp: 3945.30, change: -35.20, changePercent: -0.88 },
        { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank Ltd", ltp: 1843.60, change: -14.70, changePercent: -0.79 },
        { symbol: "INFY", name: "Infosys Ltd", ltp: 1623.75, change: -8.90, changePercent: -0.55 },
      ],
    };
  },

  marketStatus(): MarketStatus[] {
    const hour = new Date().getUTCHours() + 5.5;
    const isOpen = hour >= 9.25 && hour <= 15.5;
    const status = isOpen ? "OPEN" as const : "CLOSED" as const;
    const msg = isOpen ? "Market is open for trading" : "Market is closed";
    return [
      { exchange: "NSE", status, message: msg, timestamp: isoNow() },
      { exchange: "BSE", status, message: msg, timestamp: isoNow() },
    ];
  },

  placeOrder(req: PlaceOrderRequest): PlaceOrderResponse {
    return { orderId: randomId(), status: "PENDING", message: `${req.orderType} order for ${req.quantity} shares of ${req.symbol} placed successfully` };
  },

  cancelOrder(orderId: string): { orderId: string; status: string; message: string } {
    return { orderId, status: "CANCELLED", message: `Order ${orderId} cancelled successfully` };
  },

  modifyOrder(req: ModifyOrderRequest): { orderId: string; status: string; message: string } {
    return { orderId: req.orderId, status: "MODIFIED", message: `Order ${req.orderId} modified successfully` };
  },

  orderStatus(orderId: string): Order {
    return { orderId, symbol: "RELIANCE", exchange: "NSE", orderType: "BUY", productType: "CNC", priceType: "LIMIT", quantity: 10, price: 2830.00, triggerPrice: 0, status: "PENDING", filledQuantity: 0, avgFilledPrice: 0, timestamp: isoNow(), remarks: "" };
  },

  watchlist(): WatchlistItem[] {
    return [
      { symbol: "RELIANCE", exchange: "NSE", name: "Reliance Industries Ltd", ltp: 2847.60, change: 34.50, changePercent: 1.23 },
      { symbol: "TCS", exchange: "NSE", name: "Tata Consultancy Services Ltd", ltp: 3945.30, change: -12.40, changePercent: -0.31 },
      { symbol: "INFY", exchange: "NSE", name: "Infosys Ltd", ltp: 1623.75, change: 8.90, changePercent: 0.55 },
      { symbol: "HDFCBANK", exchange: "NSE", name: "HDFC Bank Ltd", ltp: 1712.50, change: 21.30, changePercent: 1.26 },
      { symbol: "SBIN", exchange: "NSE", name: "State Bank of India", ltp: 782.45, change: 8.65, changePercent: 1.12 },
      { symbol: "ITC", exchange: "NSE", name: "ITC Ltd", ltp: 438.90, change: -5.30, changePercent: -1.19 },
    ];
  },

  sips(): SIP[] {
    return [
      { sipId: "SIP001", fundName: "Axis Bluechip Fund - Direct Growth", isin: "INF846K01EW2", amount: 5000, frequency: "MONTHLY", startDate: "2024-06-01", nextDate: "2025-04-01", status: "ACTIVE", totalInvested: 50000, currentValue: 54200, instalments: 10 },
      { sipId: "SIP002", fundName: "Mirae Asset Large Cap Fund - Direct Growth", isin: "INF769K01AX2", amount: 3000, frequency: "MONTHLY", startDate: "2024-09-01", nextDate: "2025-04-01", status: "ACTIVE", totalInvested: 21000, currentValue: 22350, instalments: 7 },
      { sipId: "SIP003", fundName: "Parag Parikh Flexi Cap Fund - Direct Growth", isin: "INF879O01027", amount: 10000, frequency: "MONTHLY", startDate: "2024-01-01", nextDate: "2025-04-01", status: "ACTIVE", totalInvested: 150000, currentValue: 168500, instalments: 15 },
    ];
  },

  createSIP(req: CreateSIPRequest): { sipId: string; status: string; message: string } {
    return { sipId: randomId(), status: "ACTIVE", message: `SIP created for ₹${req.amount} ${req.frequency.toLowerCase()} starting ${req.startDate}` };
  },

  searchFunds(query: string): MutualFundSearchResult[] {
    const funds: MutualFundSearchResult[] = [
      { isin: "INF846K01EW2", name: "Axis Bluechip Fund - Direct Growth", amc: "Axis AMC", category: "Large Cap", nav: 52.34, returns1y: 14.8, rating: 5 },
      { isin: "INF769K01AX2", name: "Mirae Asset Large Cap Fund - Direct Growth", amc: "Mirae Asset", category: "Large Cap", nav: 98.67, returns1y: 16.2, rating: 5 },
      { isin: "INF879O01027", name: "Parag Parikh Flexi Cap Fund - Direct Growth", amc: "PPFAS", category: "Flexi Cap", nav: 72.15, returns1y: 22.1, rating: 5 },
      { isin: "INF200K01RJ1", name: "SBI Small Cap Fund - Direct Growth", amc: "SBI AMC", category: "Small Cap", nav: 164.23, returns1y: 28.7, rating: 4 },
      { isin: "INF090I01BD4", name: "ICICI Pru Balanced Advantage Fund - Direct Growth", amc: "ICICI Prudential", category: "Balanced Advantage", nav: 63.40, returns1y: 12.5, rating: 4 },
    ];
    const q = query.toUpperCase();
    const filtered = funds.filter(f => f.name.toUpperCase().includes(q) || f.amc.toUpperCase().includes(q) || f.category.toUpperCase().includes(q));
    return filtered.length > 0 ? filtered : funds;
  },

  fundDetails(isin: string): MutualFund {
    const db: Record<string, MutualFund> = {
      "INF846K01EW2": { isin: "INF846K01EW2", name: "Axis Bluechip Fund - Direct Growth", amc: "Axis AMC", category: "Equity", subCategory: "Large Cap", nav: 52.34, aum: 34521_00_00_000, expenseRatio: 0.49, riskGrade: "MODERATELY_HIGH", returns1y: 14.8, returns3y: 12.3, returns5y: 15.6, minInvestment: 500, minSIPAmount: 500, exitLoad: "1% if redeemed within 1 year", rating: 5 },
      "INF769K01AX2": { isin: "INF769K01AX2", name: "Mirae Asset Large Cap Fund - Direct Growth", amc: "Mirae Asset", category: "Equity", subCategory: "Large Cap", nav: 98.67, aum: 42130_00_00_000, expenseRatio: 0.53, riskGrade: "MODERATELY_HIGH", returns1y: 16.2, returns3y: 14.1, returns5y: 17.8, minInvestment: 1000, minSIPAmount: 500, exitLoad: "1% if redeemed within 1 year", rating: 5 },
      "INF879O01027": { isin: "INF879O01027", name: "Parag Parikh Flexi Cap Fund - Direct Growth", amc: "PPFAS", category: "Equity", subCategory: "Flexi Cap", nav: 72.15, aum: 58200_00_00_000, expenseRatio: 0.63, riskGrade: "MODERATELY_HIGH", returns1y: 22.1, returns3y: 18.7, returns5y: 21.4, minInvestment: 1000, minSIPAmount: 1000, exitLoad: "2% if redeemed within 365 days (10% of units exempt)", rating: 5 },
    };
    return db[isin] ?? { isin, name: "Unknown Fund", amc: "Unknown", category: "Equity", subCategory: "Multi Cap", nav: 45.00, aum: 10000_00_00_000, expenseRatio: 1.20, riskGrade: "MODERATE" as const, returns1y: 10.0, returns3y: 8.5, returns5y: 11.2, minInvestment: 500, minSIPAmount: 500, exitLoad: "1% if redeemed within 1 year", rating: 3 };
  },

  investInFund(req: InvestRequest): InvestResponse {
    const nav = 52.34;
    return { transactionId: randomId(), status: "PROCESSING", message: `Lumpsum investment of ₹${req.amount} in fund ${req.isin} submitted`, units: +(req.amount / nav).toFixed(3), nav };
  },
};
