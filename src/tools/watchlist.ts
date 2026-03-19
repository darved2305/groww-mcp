// ============================================================
// Groww MCP — Watchlist Tools
// ============================================================

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { growwClient } from "../client.js";
import {
  formatCurrencyExact, formatPercent, pnlEmoji, pnlSign,
  normalizeSymbol, nowIST, mcpError, mcpText, normalizeError,
} from "../utils.js";

export function registerWatchlistTools(server: McpServer): void {

  // ── get_watchlist ─────────────────────────────────────────
  server.tool(
    "get_watchlist",
    "List all watchlist symbols with LTP and day change",
    {},
    async () => {
      try {
        const items = await growwClient.getWatchlist();
        if (items.length === 0) return mcpText("📭 Watchlist is empty. Add symbols to track them.");

        const lines = items.map((w) => {
          const emoji = pnlEmoji(w.change);
          return `${emoji} ${w.symbol.padEnd(12)} ${formatCurrencyExact(w.ltp).padStart(12)}  ${pnlSign(w.change)} (${formatPercent(w.changePercent)})  ${w.name}`;
        });

        const text = [
          `👁️ WATCHLIST (${items.length} symbols)`,
          `${"─".repeat(70)}`,
          ...lines,
          ``,
          `As of ${nowIST()}`,
        ].join("\n");
        return mcpText(text);
      } catch (err) {
        return mcpError(normalizeError(err));
      }
    }
  );

  // ── add_to_watchlist ──────────────────────────────────────
  server.tool(
    "add_to_watchlist",
    "Add a stock symbol to your watchlist",
    {
      symbol: z.string().describe("Stock symbol to add, e.g. RELIANCE"),
      exchange: z.enum(["NSE", "BSE"]).default("NSE").describe("Exchange"),
    },
    async ({ symbol, exchange }) => {
      try {
        const sym = normalizeSymbol(symbol);
        const result = await growwClient.addToWatchlist(sym, exchange);
        return mcpText(`✅ ${sym}.${exchange} added to watchlist`);
      } catch (err) {
        return mcpError(normalizeError(err));
      }
    }
  );

  // ── remove_from_watchlist ─────────────────────────────────
  server.tool(
    "remove_from_watchlist",
    "Remove a stock symbol from your watchlist",
    {
      symbol: z.string().describe("Stock symbol to remove"),
      exchange: z.enum(["NSE", "BSE"]).default("NSE").describe("Exchange"),
    },
    async ({ symbol, exchange }) => {
      try {
        const sym = normalizeSymbol(symbol);
        const result = await growwClient.removeFromWatchlist(sym, exchange);
        return mcpText(`🗑️ ${sym}.${exchange} removed from watchlist`);
      } catch (err) {
        return mcpError(normalizeError(err));
      }
    }
  );
}
