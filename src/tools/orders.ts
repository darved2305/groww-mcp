// ============================================================
// Groww MCP — Order Tools
// ============================================================

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { growwClient } from "../client.js";
import {
  formatCurrencyExact, normalizeSymbol, nowIST,
  mcpError, mcpText, normalizeError,
} from "../utils.js";

export function registerOrderTools(server: McpServer): void {

  // ── place_order ───────────────────────────────────────────
  server.tool(
    "place_order",
    "Place BUY/SELL order — supports MARKET/LIMIT, CNC/MIS/NRML product types",
    {
      symbol: z.string().describe("Stock symbol, e.g. RELIANCE"),
      exchange: z.enum(["NSE", "BSE"]).default("NSE").describe("Exchange"),
      order_type: z.enum(["BUY", "SELL"]).describe("BUY or SELL"),
      product_type: z.enum(["CNC", "MIS", "NRML"]).default("CNC").describe("CNC (delivery), MIS (intraday), NRML (F&O)"),
      price_type: z.enum(["MARKET", "LIMIT"]).default("MARKET").describe("MARKET or LIMIT order"),
      quantity: z.number().int().positive().describe("Number of shares"),
      price: z.number().positive().optional().describe("Limit price (required for LIMIT orders)"),
      trigger_price: z.number().positive().optional().describe("Stop-loss trigger price"),
    },
    async ({ symbol, exchange, order_type, product_type, price_type, quantity, price, trigger_price }) => {
      try {
        if (price_type === "LIMIT" && !price) {
          return mcpError("Limit price is required for LIMIT orders");
        }

        const sym = normalizeSymbol(symbol);
        const result = await growwClient.placeOrder({
          symbol: sym,
          exchange,
          orderType: order_type,
          productType: product_type,
          priceType: price_type,
          quantity,
          price: price ?? 0,
          triggerPrice: trigger_price ?? 0,
        });

        const emoji = order_type === "BUY" ? "🟢" : "🔴";
        const text = [
          `${emoji} ORDER PLACED`,
          `${"─".repeat(40)}`,
          `Order ID:  ${result.orderId}`,
          `Status:    ${result.status}`,
          `Action:    ${order_type} ${sym}.${exchange}`,
          `Type:      ${price_type} / ${product_type}`,
          `Quantity:  ${quantity}`,
          price_type === "LIMIT" ? `Price:     ${formatCurrencyExact(price!)}` : `Price:     MARKET`,
          trigger_price ? `Trigger:   ${formatCurrencyExact(trigger_price)}` : "",
          ``,
          `${result.message}`,
          ``,
          `⚠️ This is ${process.env.MOCK_MODE === "true" ? "a MOCK order (no real trade)" : "a REAL order with real money"}`,
        ].filter(Boolean).join("\n");
        return mcpText(text);
      } catch (err) {
        return mcpError(normalizeError(err));
      }
    }
  );

  // ── cancel_order ──────────────────────────────────────────
  server.tool(
    "cancel_order",
    "Cancel a pending order by order ID",
    {
      order_id: z.string().describe("Order ID to cancel"),
    },
    async ({ order_id }) => {
      try {
        const result = await growwClient.cancelOrder(order_id);
        const text = [
          `❌ ORDER CANCELLED`,
          `${"─".repeat(40)}`,
          `Order ID: ${result.orderId}`,
          `Status:   ${result.status}`,
          `${result.message}`,
        ].join("\n");
        return mcpText(text);
      } catch (err) {
        return mcpError(normalizeError(err));
      }
    }
  );

  // ── modify_order ──────────────────────────────────────────
  server.tool(
    "modify_order",
    "Modify price/quantity of a pending limit order",
    {
      order_id: z.string().describe("Order ID to modify"),
      quantity: z.number().int().positive().optional().describe("New quantity"),
      price: z.number().positive().optional().describe("New limit price"),
      trigger_price: z.number().positive().optional().describe("New trigger price"),
    },
    async ({ order_id, quantity, price, trigger_price }) => {
      try {
        if (!quantity && !price && !trigger_price) {
          return mcpError("At least one of quantity, price, or trigger_price must be provided");
        }

        const result = await growwClient.modifyOrder({
          orderId: order_id,
          quantity,
          price,
          triggerPrice: trigger_price,
        });

        const changes: string[] = [];
        if (quantity) changes.push(`Quantity → ${quantity}`);
        if (price) changes.push(`Price → ${formatCurrencyExact(price)}`);
        if (trigger_price) changes.push(`Trigger → ${formatCurrencyExact(trigger_price)}`);

        const text = [
          `✏️ ORDER MODIFIED`,
          `${"─".repeat(40)}`,
          `Order ID:  ${result.orderId}`,
          `Status:    ${result.status}`,
          `Changes:   ${changes.join(", ")}`,
          `${result.message}`,
        ].join("\n");
        return mcpText(text);
      } catch (err) {
        return mcpError(normalizeError(err));
      }
    }
  );

  // ── get_order_status ──────────────────────────────────────
  server.tool(
    "get_order_status",
    "Real-time status of a specific order",
    {
      order_id: z.string().describe("Order ID to check"),
    },
    async ({ order_id }) => {
      try {
        const o = await growwClient.getOrderStatus(order_id);

        const statusEmoji: Record<string, string> = {
          EXECUTED: "✅", PENDING: "⏳", CANCELLED: "❌", REJECTED: "🚫", PARTIAL: "🔶",
        };
        const emoji = statusEmoji[o.status] || "❓";

        const text = [
          `${emoji} ORDER STATUS`,
          `${"─".repeat(40)}`,
          `Order ID:  ${o.orderId}`,
          `Symbol:    ${o.symbol}.${o.exchange}`,
          `Action:    ${o.orderType} / ${o.priceType} / ${o.productType}`,
          `Quantity:  ${o.quantity}${o.filledQuantity > 0 ? ` (filled: ${o.filledQuantity})` : ""}`,
          o.price > 0 ? `Price:     ${formatCurrencyExact(o.price)}` : `Price:     MARKET`,
          o.avgFilledPrice > 0 ? `Avg Fill:  ${formatCurrencyExact(o.avgFilledPrice)}` : "",
          `Status:    ${o.status}`,
          o.remarks ? `Remarks:   ${o.remarks}` : "",
          ``,
          `As of ${nowIST()}`,
        ].filter(Boolean).join("\n");
        return mcpText(text);
      } catch (err) {
        return mcpError(normalizeError(err));
      }
    }
  );
}
