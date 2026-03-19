#!/usr/bin/env node
// ============================================================
// Groww MCP Server — Entrypoint
// Exposes Groww trading capabilities as MCP tools for Claude
// ============================================================

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { registerPortfolioTools } from "./tools/portfolio.js";
import { registerMarketTools } from "./tools/market.js";
import { registerOrderTools } from "./tools/orders.js";
import { registerWatchlistTools } from "./tools/watchlist.js";
import { registerSIPTools } from "./tools/sip.js";
import { registerFundTools } from "./tools/funds.js";

const server = new McpServer({
  name: "groww-mcp",
  version: "1.0.0",
  description: "MCP server for Groww — manage portfolios, place orders, track markets, and invest in mutual funds via Claude",
});

// Register all tool groups
registerPortfolioTools(server);
registerMarketTools(server);
registerOrderTools(server);
registerWatchlistTools(server);
registerSIPTools(server);
registerFundTools(server);

// Connect via stdio transport
async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  const mode = process.env.MOCK_MODE === "true" ? "MOCK" : "LIVE";
  console.error(`[groww-mcp] Server started (${mode} mode)`);
  console.error(`[groww-mcp] 23 tools registered`);
}

main().catch((err) => {
  console.error("[groww-mcp] Fatal error:", err);
  process.exit(1);
});
