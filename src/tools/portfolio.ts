// ============================================================
// Groww MCP — Portfolio Tools
// ============================================================

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { growwClient } from "../client.js";
import {
  formatCurrency, formatCurrencyExact, formatPercent, pnlEmoji,
  pnlSign, nowIST, todayIST, mcpError, mcpText, normalizeError,
} from "../utils.js";

export function registerPortfolioTools(server: McpServer): void {

  // ── get_holdings ──────────────────────────────────────────
  server.tool(
    "get_holdings",
    "Fetch all current equity holdings with avg buy price, current value, P&L %",
    {},
    async () => {
      try {
        const holdings = await growwClient.getHoldings();
        if (holdings.length === 0) return mcpText("📭 No holdings found. Your portfolio is empty.");

        const lines = holdings.map((h) => {
          const emoji = pnlEmoji(h.pnl);
          return [
            `${emoji} ${h.symbol}.${h.exchange} — ${h.name}`,
            `   Qty: ${h.quantity}  |  Avg: ${formatCurrencyExact(h.avgBuyPrice)}  |  LTP: ${formatCurrencyExact(h.currentPrice)}`,
            `   Invested: ${formatCurrency(h.investedValue)}  |  Current: ${formatCurrency(h.currentValue)}`,
            `   P&L: ${pnlSign(h.pnl)} (${formatPercent(h.pnlPercent)})  |  Day: ${pnlSign(h.dayChange)} (${formatPercent(h.dayChangePercent)})`,
          ].join("\n");
        });

        const header = `📊 YOUR HOLDINGS (${holdings.length} stocks)\n${"─".repeat(50)}`;
        const footer = `\nAs of ${nowIST()}`;
        return mcpText([header, ...lines, footer].join("\n\n"));
      } catch (err) {
        return mcpError(normalizeError(err));
      }
    }
  );

  // ── get_portfolio_summary ─────────────────────────────────
  server.tool(
    "get_portfolio_summary",
    "Total invested, current value, total P&L, day's P&L",
    {},
    async () => {
      try {
        const s = await growwClient.getPortfolioSummary();
        const text = [
          `💼 PORTFOLIO SUMMARY`,
          `${"─".repeat(40)}`,
          `Invested:      ${formatCurrency(s.totalInvested)}`,
          `Current Value:  ${formatCurrency(s.currentValue)}`,
          `Total P&L:     ${pnlSign(s.totalPnl)} (${formatPercent(s.totalPnlPercent)})`,
          `Day's P&L:     ${pnlSign(s.dayPnl)} (${formatPercent(s.dayPnlPercent)})`,
          `Holdings:      ${s.holdingsCount} stocks`,
          ``,
          `As of ${nowIST()}`,
        ].join("\n");
        return mcpText(text);
      } catch (err) {
        return mcpError(normalizeError(err));
      }
    }
  );

  // ── get_positions ─────────────────────────────────────────
  server.tool(
    "get_positions",
    "Intraday open positions with unrealized P&L",
    {},
    async () => {
      try {
        const positions = await growwClient.getPositions();
        if (positions.length === 0) return mcpText("📭 No open positions today.");

        const lines = positions.map((p) => {
          const emoji = pnlEmoji(p.pnl);
          return [
            `${emoji} ${p.symbol}.${p.exchange} [${p.orderType} / ${p.productType}]`,
            `   Qty: ${p.quantity}  |  Buy: ${formatCurrencyExact(p.buyPrice)}  |  LTP: ${formatCurrencyExact(p.currentPrice)}`,
            `   Unrealized P&L: ${pnlSign(p.pnl)} (${formatPercent(p.pnlPercent)})`,
          ].join("\n");
        });

        const header = `⚡ OPEN POSITIONS (${positions.length})\n${"─".repeat(50)}`;
        return mcpText([header, ...lines, `\nAs of ${nowIST()}`].join("\n\n"));
      } catch (err) {
        return mcpError(normalizeError(err));
      }
    }
  );

  // ── get_order_history ─────────────────────────────────────
  server.tool(
    "get_order_history",
    "Past orders with status, optionally filter by date range",
    {
      start_date: z.string().optional().describe("Start date (YYYY-MM-DD)"),
      end_date: z.string().optional().describe("End date (YYYY-MM-DD)"),
    },
    async ({ start_date, end_date }) => {
      try {
        const orders = await growwClient.getOrderHistory(start_date, end_date);
        if (orders.length === 0) return mcpText("📭 No orders found for the given period.");

        const statusEmoji: Record<string, string> = {
          EXECUTED: "✅", PENDING: "⏳", CANCELLED: "❌", REJECTED: "🚫", PARTIAL: "🔶",
        };

        const lines = orders.map((o) => {
          const emoji = statusEmoji[o.status] || "❓";
          return [
            `${emoji} ${o.orderId} — ${o.orderType} ${o.symbol}.${o.exchange}`,
            `   ${o.priceType} / ${o.productType}  |  Qty: ${o.quantity}  |  Price: ${o.price > 0 ? formatCurrencyExact(o.price) : "MARKET"}`,
            `   Status: ${o.status}${o.filledQuantity > 0 ? ` (filled ${o.filledQuantity} @ ${formatCurrencyExact(o.avgFilledPrice)})` : ""}`,
            `   ${new Date(o.timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}${o.remarks ? ` — ${o.remarks}` : ""}`,
          ].join("\n");
        });

        const header = `📋 ORDER HISTORY (${orders.length} orders)\n${"─".repeat(50)}`;
        return mcpText([header, ...lines].join("\n\n"));
      } catch (err) {
        return mcpError(normalizeError(err));
      }
    }
  );
}
