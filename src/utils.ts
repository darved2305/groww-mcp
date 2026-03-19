// ============================================================
// Groww MCP — Utility Functions
// ============================================================

export function formatCurrency(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";

  if (abs >= 1_00_00_000) {
    const crores = abs / 1_00_00_000;
    return `${sign}₹${crores.toFixed(2)} Cr`;
  }
  if (abs >= 1_00_000) {
    const lakhs = abs / 1_00_000;
    return `${sign}₹${lakhs.toFixed(2)}L`;
  }

  return `${sign}₹${abs.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatCurrencyExact(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  const abs = Math.abs(amount);
  return `${sign}₹${abs.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPercent(n: number): string {
  const sign = n >= 0 ? "+" : "";
  const emoji = n > 0 ? "🟢" : n < 0 ? "🔴" : "⚪";
  return `${sign}${n.toFixed(2)}% ${emoji}`;
}

export function formatVolume(vol: number): string {
  if (vol >= 1_00_00_000) return `${(vol / 1_00_00_000).toFixed(1)} Cr`;
  if (vol >= 1_00_000) return `${(vol / 1_00_000).toFixed(1)}L`;
  if (vol >= 1_000) return `${(vol / 1_000).toFixed(1)}K`;
  return vol.toString();
}

export function normalizeSymbol(symbol: string): string {
  let s = symbol.trim().toUpperCase();
  s = s.replace(/^(NSE:|BSE:|NFO:)/, "");
  return s;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function nowIST(): string {
  return new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }) + " IST";
}

export function todayIST(): string {
  return new Date().toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function mcpError(message: string): {
  isError: true;
  content: Array<{ type: "text"; text: string }>;
} {
  return {
    isError: true,
    content: [{ type: "text", text: `❌ Error: ${message}` }],
  };
}

export function mcpText(text: string): {
  content: Array<{ type: "text"; text: string }>;
} {
  return {
    content: [{ type: "text", text }],
  };
}

export function normalizeError(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Unknown error occurred";
}

export function pnlEmoji(pnl: number): string {
  if (pnl > 0) return "📈";
  if (pnl < 0) return "📉";
  return "➡️";
}

export function pnlSign(pnl: number): string {
  return pnl >= 0 ? `+${formatCurrencyExact(pnl)}` : formatCurrencyExact(pnl);
}
