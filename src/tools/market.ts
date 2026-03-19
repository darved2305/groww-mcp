// ============================================================
// Groww MCP — Market Tools
// ============================================================

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { growwClient } from "../client.js";
import {
  formatCurrencyExact, formatCurrency, formatPercent, formatVolume,
  normalizeSymbol, pnlEmoji, pnlSign, nowIST, mcpError, mcpText, normalizeError,
} from "../utils.js";

export function registerMarketTools(server: McpServer): void {

  // ── get_quote ─────────────────────────────────────────────
  server.tool(
    "get_quote",
    "LTP, bid/ask, open, high, low, volume for a symbol (NSE/BSE)",
    {
      symbol: z.string().describe("Stock symbol, e.g. RELIANCE, TCS, INFY"),
      exchange: z.enum(["NSE", "BSE"]).default("NSE").describe("Exchange — NSE or BSE"),
    },
    async ({ symbol, exchange }) => {
      try {
        const sym = normalizeSymbol(symbol);
        const q = await growwClient.getQuote(sym, exchange);
        const emoji = pnlEmoji(q.change);

        const text = [
          `${q.symbol}.${q.exchange} ${emoji}`,
          `${q.name}`,
          `${"─".repeat(40)}`,
          `LTP: ${formatCurrencyExact(q.ltp)}  (${formatPercent(q.changePercent)}, ${pnlSign(q.change)})`,
          `Open: ${formatCurrencyExact(q.open)}  |  High: ${formatCurrencyExact(q.high)}  |  Low: ${formatCurrencyExact(q.low)}`,
          `Prev Close: ${formatCurrencyExact(q.close)}`,
          `Bid: ${formatCurrencyExact(q.bid)}  |  Ask: ${formatCurrencyExact(q.ask)}`,
          `Volume: ${formatVolume(q.volume)}  |  Market Cap: ${formatCurrency(q.marketCap)}`,
          ``,
          `As of ${nowIST()}`,
        ].join("\n");
        return mcpText(text);
      } catch (err) {
        return mcpError(normalizeError(err));
      }
    }
  );

  // ── search_stocks ─────────────────────────────────────────
  server.tool(
    "search_stocks",
    "Fuzzy search stocks and MFs by name or ticker",
    {
      query: z.string().describe("Search query — stock name, ticker, or keyword"),
    },
    async ({ query }) => {
      try {
        const results = await growwClient.searchStocks(query);
        if (results.length === 0) return mcpText(`🔍 No results found for "${query}"`);

        const lines = results.map((r, i) =>
          `${i + 1}. ${r.symbol} — ${r.name} [${r.exchange}] (${r.type}) ISIN: ${r.isin}`
        );

        const text = [`🔍 SEARCH: "${query}" — ${results.length} results`, `${"─".repeat(40)}`, ...lines].join("\n");
        return mcpText(text);
      } catch (err) {
        return mcpError(normalizeError(err));
      }
    }
  );

  // ── get_ohlc_data ─────────────────────────────────────────
  server.tool(
    "get_ohlc_data",
    "OHLC candles for a symbol — supports 1d/1w/1m/1y intervals",
    {
      symbol: z.string().describe("Stock symbol"),
      exchange: z.enum(["NSE", "BSE"]).default("NSE").describe("Exchange"),
      interval: z.enum(["1d", "1w", "1m", "1y"]).default("1d").describe("Candle interval"),
    },
    async ({ symbol, exchange, interval }) => {
      try {
        const sym = normalizeSymbol(symbol);
        const candles = await growwClient.getOHLC(sym, exchange, interval);
        if (candles.length === 0) return mcpText(`📭 No OHLC data for ${sym}`);

        const header = `📊 ${sym}.${exchange} — OHLC (${interval})\n${"─".repeat(55)}\n${"Date".padEnd(12)} ${"Open".padStart(10)} ${"High".padStart(10)} ${"Low".padStart(10)} ${"Close".padStart(10)} ${"Vol".padStart(8)}`;

        const rows = candles.slice(-15).map((c) => {
          const d = c.timestamp.substring(0, 10);
          return `${d.padEnd(12)} ${c.open.toFixed(2).padStart(10)} ${c.high.toFixed(2).padStart(10)} ${c.low.toFixed(2).padStart(10)} ${c.close.toFixed(2).padStart(10)} ${formatVolume(c.volume).padStart(8)}`;
        });

        const note = candles.length > 15 ? `\n(showing last 15 of ${candles.length} candles)` : "";
        return mcpText([header, ...rows, note].join("\n"));
      } catch (err) {
        return mcpError(normalizeError(err));
      }
    }
  );

  // ── get_top_movers ────────────────────────────────────────
  server.tool(
    "get_top_movers",
    "Top 5 gainers and losers for the day",
    {},
    async () => {
      try {
        const { gainers, losers } = await growwClient.getTopMovers();

        const gLines = gainers.map((g, i) =>
          `  ${i + 1}. ${g.symbol.padEnd(12)} ${formatCurrencyExact(g.ltp).padStart(12)}  ${formatPercent(g.changePercent)}`
        );
        const lLines = losers.map((l, i) =>
          `  ${i + 1}. ${l.symbol.padEnd(12)} ${formatCurrencyExact(l.ltp).padStart(12)}  ${formatPercent(l.changePercent)}`
        );

        const text = [
          `🏆 TOP MOVERS — ${new Date().toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}`,
          `${"─".repeat(50)}`,
          `📈 GAINERS`,
          ...gLines,
          ``,
          `📉 LOSERS`,
          ...lLines,
          ``,
          `As of ${nowIST()}`,
        ].join("\n");
        return mcpText(text);
      } catch (err) {
        return mcpError(normalizeError(err));
      }
    }
  );

  // ── get_market_status ─────────────────────────────────────
  server.tool(
    "get_market_status",
    "Check if NSE/BSE is currently open for trading",
    {},
    async () => {
      try {
        const statuses = await growwClient.getMarketStatus();

        const lines = statuses.map((s) => {
          const icon = s.status === "OPEN" ? "🟢" : s.status === "PRE_OPEN" ? "🟡" : "🔴";
          return `${icon} ${s.exchange}: ${s.status} — ${s.message}`;
        });

        const text = [`🏛️ MARKET STATUS`, `${"─".repeat(40)}`, ...lines, ``, `As of ${nowIST()}`].join("\n");
        return mcpText(text);
      } catch (err) {
        return mcpError(normalizeError(err));
      }
    }
  );
}
