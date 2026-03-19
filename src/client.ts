// ============================================================
// Groww MCP — API Client (axios wrapper + mock layer)
// ============================================================

import axios, { AxiosInstance, AxiosError } from "axios";
import { sleep } from "./utils.js";
import { MOCK } from "./mock.js";
import type {
  Holding, PortfolioSummary, Position, Order,
  Quote, StockSearchResult, OHLCCandle, TopMover, MarketStatus,
  PlaceOrderRequest, PlaceOrderResponse, ModifyOrderRequest,
  WatchlistItem,
  SIP, CreateSIPRequest,
  MutualFund, MutualFundSearchResult, InvestRequest, InvestResponse,
} from "./types.js";

const MAX_RETRIES = 3;
const RETRY_BASE_MS = 500;

function isMockMode(): boolean {
  return process.env.MOCK_MODE === "true";
}

class GrowwClient {
  private http: AxiosInstance;

  constructor() {
    const baseURL = process.env.GROWW_BASE_URL || "https://api.groww.in/v1";
    const token = process.env.GROWW_API_TOKEN || "";

    this.http = axios.create({
      baseURL,
      timeout: 15_000,
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "groww-mcp/1.0",
      },
    });
  }

  async request<T>(method: "GET" | "POST" | "PUT" | "DELETE", path: string, data?: unknown): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const resp = await this.http.request<T>({
          method,
          url: path,
          data: method !== "GET" ? data : undefined,
          params: method === "GET" ? data : undefined,
        });
        return resp.data;
      } catch (err) {
        const axErr = err as AxiosError;
        const status = axErr.response?.status ?? 0;

        if (status === 429 || status >= 500) {
          lastError = new Error(`HTTP ${status}: ${axErr.message}`);
          if (attempt < MAX_RETRIES) {
            await sleep(RETRY_BASE_MS * Math.pow(2, attempt - 1));
            continue;
          }
        }

        if (axErr.response) {
          const body = axErr.response.data as Record<string, unknown>;
          const msg = (body?.message as string) || axErr.message;
          throw new Error(`Groww API error (${status}): ${msg}`);
        }

        throw new Error(`Network error: ${axErr.message}`);
      }
    }

    throw lastError ?? new Error("Request failed after retries");
  }

  // ==================== PORTFOLIO ====================

  async getHoldings(): Promise<Holding[]> {
    if (isMockMode()) return MOCK.holdings();
    return this.request<Holding[]>("GET", "/portfolio/holdings");
  }

  async getPortfolioSummary(): Promise<PortfolioSummary> {
    if (isMockMode()) return MOCK.portfolioSummary();
    return this.request<PortfolioSummary>("GET", "/portfolio/summary");
  }

  async getPositions(): Promise<Position[]> {
    if (isMockMode()) return MOCK.positions();
    return this.request<Position[]>("GET", "/portfolio/positions");
  }

  async getOrderHistory(startDate?: string, endDate?: string): Promise<Order[]> {
    if (isMockMode()) return MOCK.orderHistory();
    return this.request<Order[]>("GET", "/orders/history", { startDate, endDate });
  }

  // ==================== MARKET ====================

  async getQuote(symbol: string, exchange: string): Promise<Quote> {
    if (isMockMode()) return MOCK.quote(symbol, exchange);
    return this.request<Quote>("GET", `/market/quote/${exchange}/${symbol}`);
  }

  async searchStocks(query: string): Promise<StockSearchResult[]> {
    if (isMockMode()) return MOCK.searchStocks(query);
    return this.request<StockSearchResult[]>("GET", "/search", { q: query });
  }

  async getOHLC(symbol: string, exchange: string, interval: string): Promise<OHLCCandle[]> {
    if (isMockMode()) return MOCK.ohlc(symbol, interval);
    return this.request<OHLCCandle[]>("GET", `/market/ohlc/${exchange}/${symbol}`, { interval });
  }

  async getTopMovers(): Promise<{ gainers: TopMover[]; losers: TopMover[] }> {
    if (isMockMode()) return MOCK.topMovers();
    return this.request<{ gainers: TopMover[]; losers: TopMover[] }>("GET", "/market/top-movers");
  }

  async getMarketStatus(): Promise<MarketStatus[]> {
    if (isMockMode()) return MOCK.marketStatus();
    return this.request<MarketStatus[]>("GET", "/market/status");
  }

  // ==================== ORDERS ====================

  async placeOrder(req: PlaceOrderRequest): Promise<PlaceOrderResponse> {
    if (isMockMode()) return MOCK.placeOrder(req);
    return this.request<PlaceOrderResponse>("POST", "/orders/place", req);
  }

  async cancelOrder(orderId: string): Promise<{ orderId: string; status: string; message: string }> {
    if (isMockMode()) return MOCK.cancelOrder(orderId);
    return this.request("DELETE", `/orders/${orderId}`);
  }

  async modifyOrder(req: ModifyOrderRequest): Promise<{ orderId: string; status: string; message: string }> {
    if (isMockMode()) return MOCK.modifyOrder(req);
    return this.request("PUT", `/orders/${req.orderId}`, req);
  }

  async getOrderStatus(orderId: string): Promise<Order> {
    if (isMockMode()) return MOCK.orderStatus(orderId);
    return this.request<Order>("GET", `/orders/${orderId}`);
  }

  // ==================== WATCHLIST ====================

  async getWatchlist(): Promise<WatchlistItem[]> {
    if (isMockMode()) return MOCK.watchlist();
    return this.request<WatchlistItem[]>("GET", "/watchlist");
  }

  async addToWatchlist(symbol: string, exchange: string): Promise<{ status: string; message: string }> {
    if (isMockMode()) return { status: "success", message: `${symbol} added to watchlist` };
    return this.request("POST", "/watchlist/add", { symbol, exchange });
  }

  async removeFromWatchlist(symbol: string, exchange: string): Promise<{ status: string; message: string }> {
    if (isMockMode()) return { status: "success", message: `${symbol} removed from watchlist` };
    return this.request("DELETE", "/watchlist/remove", { symbol, exchange });
  }

  // ==================== SIP ====================

  async listSIPs(): Promise<SIP[]> {
    if (isMockMode()) return MOCK.sips();
    return this.request<SIP[]>("GET", "/sip/list");
  }

  async createSIP(req: CreateSIPRequest): Promise<{ sipId: string; status: string; message: string }> {
    if (isMockMode()) return MOCK.createSIP(req);
    return this.request("POST", "/sip/create", req);
  }

  async pauseSIP(sipId: string): Promise<{ sipId: string; status: string; message: string }> {
    if (isMockMode()) return { sipId, status: "PAUSED", message: `SIP ${sipId} paused` };
    return this.request("PUT", `/sip/${sipId}/pause`);
  }

  async cancelSIP(sipId: string): Promise<{ sipId: string; status: string; message: string }> {
    if (isMockMode()) return { sipId, status: "CANCELLED", message: `SIP ${sipId} cancelled` };
    return this.request("DELETE", `/sip/${sipId}`);
  }

  // ==================== MUTUAL FUNDS ====================

  async searchFunds(query: string, category?: string, amc?: string): Promise<MutualFundSearchResult[]> {
    if (isMockMode()) return MOCK.searchFunds(query);
    return this.request<MutualFundSearchResult[]>("GET", "/mf/search", { q: query, category, amc });
  }

  async getFundDetails(isin: string): Promise<MutualFund> {
    if (isMockMode()) return MOCK.fundDetails(isin);
    return this.request<MutualFund>("GET", `/mf/${isin}`);
  }

  async investInFund(req: InvestRequest): Promise<InvestResponse> {
    if (isMockMode()) return MOCK.investInFund(req);
    return this.request<InvestResponse>("POST", "/mf/invest", req);
  }
}

export const growwClient = new GrowwClient();
