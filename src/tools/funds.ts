// ============================================================
// Groww MCP — Mutual Fund Tools
// ============================================================

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { growwClient } from "../client.js";
import {
  formatCurrency, formatCurrencyExact, formatPercent,
  mcpError, mcpText, normalizeError, nowIST,
} from "../utils.js";

export function registerFundTools(server: McpServer): void {

  // ── search_funds ──────────────────────────────────────────
  server.tool(
    "search_funds",
    "Search mutual funds by name, category, or AMC",
    {
      query: z.string().describe("Search query — fund name, category, or AMC"),
      category: z.string().optional().describe("Filter by category, e.g. Large Cap, Flexi Cap"),
      amc: z.string().optional().describe("Filter by AMC, e.g. Axis, Mirae, SBI"),
    },
    async ({ query, category, amc }) => {
      try {
        const results = await growwClient.searchFunds(query, category, amc);
        if (results.length === 0) return mcpText(`🔍 No mutual funds found for "${query}"`);

        const lines = results.map((f, i) => {
          const stars = "⭐".repeat(Math.min(f.rating, 5));
          return [
            `${i + 1}. ${f.name}`,
            `   AMC: ${f.amc}  |  Category: ${f.category}`,
            `   NAV: ${formatCurrencyExact(f.nav)}  |  1Y Returns: ${formatPercent(f.returns1y)}`,
            `   Rating: ${stars}  |  ISIN: ${f.isin}`,
          ].join("\n");
        });

        const text = [`🔍 FUND SEARCH: "${query}" — ${results.length} results`, `${"─".repeat(55)}`, ...lines].join("\n\n");
        return mcpText(text);
      } catch (err) {
        return mcpError(normalizeError(err));
      }
    }
  );

  // ── get_fund_details ──────────────────────────────────────
  server.tool(
    "get_fund_details",
    "NAV, AUM, expense ratio, returns (1y/3y/5y), risk grade for a mutual fund",
    {
      isin: z.string().describe("Mutual fund ISIN code, e.g. INF846K01EW2"),
    },
    async ({ isin }) => {
      try {
        const f = await growwClient.getFundDetails(isin);
        const stars = "⭐".repeat(Math.min(f.rating, 5));

        const riskLabel: Record<string, string> = {
          LOW: "🟢 Low",
          MODERATELY_LOW: "🟢 Moderately Low",
          MODERATE: "🟡 Moderate",
          MODERATELY_HIGH: "🟠 Moderately High",
          HIGH: "🔴 High",
        };

        const text = [
          `📈 ${f.name}`,
          `${"─".repeat(55)}`,
          `AMC:            ${f.amc}`,
          `Category:       ${f.category} > ${f.subCategory}`,
          `ISIN:           ${f.isin}`,
          `Rating:         ${stars}`,
          ``,
          `💰 KEY METRICS`,
          `NAV:            ${formatCurrencyExact(f.nav)}`,
          `AUM:            ${formatCurrency(f.aum)}`,
          `Expense Ratio:  ${f.expenseRatio}%`,
          `Risk:           ${riskLabel[f.riskGrade] || f.riskGrade}`,
          ``,
          `📊 RETURNS`,
          `1 Year:         ${formatPercent(f.returns1y)}`,
          `3 Year:         ${formatPercent(f.returns3y)}`,
          `5 Year:         ${formatPercent(f.returns5y)}`,
          ``,
          `💳 INVESTMENT`,
          `Min Lumpsum:    ${formatCurrencyExact(f.minInvestment)}`,
          `Min SIP:        ${formatCurrencyExact(f.minSIPAmount)}`,
          `Exit Load:      ${f.exitLoad}`,
          ``,
          `As of ${nowIST()}`,
        ].join("\n");
        return mcpText(text);
      } catch (err) {
        return mcpError(normalizeError(err));
      }
    }
  );

  // ── invest_in_fund ────────────────────────────────────────
  server.tool(
    "invest_in_fund",
    "One-time lumpsum investment in a mutual fund",
    {
      isin: z.string().describe("Mutual fund ISIN code"),
      amount: z.number().positive().describe("Investment amount in INR"),
    },
    async ({ isin, amount }) => {
      try {
        if (amount < 100) return mcpError("Minimum investment amount is ₹100");

        const result = await growwClient.investInFund({ isin, amount });

        const text = [
          `💰 INVESTMENT SUBMITTED`,
          `${"─".repeat(40)}`,
          `Transaction ID: ${result.transactionId}`,
          `Fund:           ${isin}`,
          `Amount:         ${formatCurrencyExact(amount)}`,
          `NAV:            ${formatCurrencyExact(result.nav)}`,
          `Est. Units:     ${result.units}`,
          `Status:         ${result.status}`,
          ``,
          `${result.message}`,
          ``,
          `⚠️ This is ${process.env.MOCK_MODE === "true" ? "a MOCK investment (no real money)" : "a REAL investment — money will be debited from your account"}`,
        ].join("\n");
        return mcpText(text);
      } catch (err) {
        return mcpError(normalizeError(err));
      }
    }
  );
}
