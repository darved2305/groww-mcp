// ============================================================
// Groww MCP — SIP Tools
// ============================================================

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { growwClient } from "../client.js";
import {
  formatCurrency, formatCurrencyExact, formatPercent, pnlEmoji,
  pnlSign, nowIST, mcpError, mcpText, normalizeError,
} from "../utils.js";

export function registerSIPTools(server: McpServer): void {

  // ── list_sips ─────────────────────────────────────────────
  server.tool(
    "list_sips",
    "All active SIPs with fund name, amount, next date",
    {},
    async () => {
      try {
        const sips = await growwClient.listSIPs();
        if (sips.length === 0) return mcpText("📭 No SIPs found. Create one to start systematic investing.");

        const lines = sips.map((s) => {
          const statusIcon = s.status === "ACTIVE" ? "🟢" : s.status === "PAUSED" ? "🟡" : "🔴";
          const pnl = s.currentValue - s.totalInvested;
          const pnlPct = s.totalInvested > 0 ? (pnl / s.totalInvested) * 100 : 0;

          return [
            `${statusIcon} ${s.fundName}`,
            `   SIP ID: ${s.sipId}  |  Status: ${s.status}`,
            `   Amount: ${formatCurrencyExact(s.amount)} / ${s.frequency}`,
            `   Instalments: ${s.instalments}  |  Next: ${s.nextDate}`,
            `   Invested: ${formatCurrency(s.totalInvested)}  |  Current: ${formatCurrency(s.currentValue)}`,
            `   Returns: ${pnlSign(pnl)} (${formatPercent(pnlPct)})`,
          ].join("\n");
        });

        const header = `📅 YOUR SIPs (${sips.length})\n${"─".repeat(55)}`;
        return mcpText([header, ...lines, `\nAs of ${nowIST()}`].join("\n\n"));
      } catch (err) {
        return mcpError(normalizeError(err));
      }
    }
  );

  // ── create_sip ────────────────────────────────────────────
  server.tool(
    "create_sip",
    "Create a new SIP with fund ISIN, amount, frequency, and start date",
    {
      isin: z.string().describe("Mutual fund ISIN code, e.g. INF846K01EW2"),
      amount: z.number().positive().describe("SIP amount in INR"),
      frequency: z.enum(["MONTHLY", "WEEKLY", "QUARTERLY"]).default("MONTHLY").describe("SIP frequency"),
      start_date: z.string().describe("SIP start date (YYYY-MM-DD)"),
    },
    async ({ isin, amount, frequency, start_date }) => {
      try {
        if (amount < 100) return mcpError("Minimum SIP amount is ₹100");

        const result = await growwClient.createSIP({
          isin,
          amount,
          frequency,
          startDate: start_date,
        });

        const text = [
          `✅ SIP CREATED`,
          `${"─".repeat(40)}`,
          `SIP ID:    ${result.sipId}`,
          `Fund:      ${isin}`,
          `Amount:    ${formatCurrencyExact(amount)} / ${frequency.toLowerCase()}`,
          `Starts:    ${start_date}`,
          `Status:    ${result.status}`,
          ``,
          `${result.message}`,
          ``,
          `⚠️ This is ${process.env.MOCK_MODE === "true" ? "a MOCK SIP (no real investment)" : "a REAL SIP — money will be debited on schedule"}`,
        ].join("\n");
        return mcpText(text);
      } catch (err) {
        return mcpError(normalizeError(err));
      }
    }
  );

  // ── pause_sip ─────────────────────────────────────────────
  server.tool(
    "pause_sip",
    "Pause an active SIP temporarily",
    {
      sip_id: z.string().describe("SIP ID to pause"),
    },
    async ({ sip_id }) => {
      try {
        const result = await growwClient.pauseSIP(sip_id);
        const text = [
          `⏸️ SIP PAUSED`,
          `${"─".repeat(40)}`,
          `SIP ID:  ${result.sipId}`,
          `Status:  ${result.status}`,
          `${result.message}`,
        ].join("\n");
        return mcpText(text);
      } catch (err) {
        return mcpError(normalizeError(err));
      }
    }
  );

  // ── cancel_sip ────────────────────────────────────────────
  server.tool(
    "cancel_sip",
    "Cancel a SIP permanently",
    {
      sip_id: z.string().describe("SIP ID to cancel"),
    },
    async ({ sip_id }) => {
      try {
        const result = await growwClient.cancelSIP(sip_id);
        const text = [
          `🛑 SIP CANCELLED`,
          `${"─".repeat(40)}`,
          `SIP ID:  ${result.sipId}`,
          `Status:  ${result.status}`,
          `${result.message}`,
          ``,
          `⚠️ This action is permanent. You'll need to create a new SIP to resume investing.`,
        ].join("\n");
        return mcpText(text);
      } catch (err) {
        return mcpError(normalizeError(err));
      }
    }
  );
}
