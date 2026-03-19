```
  ____  ____   ___  _ _ _ _ _ _       __  __  ____  ____
 / ___|/ ___| / _ \| | | | | | |     |  \/  |/ ___|/ _  |
| |  _| |___ | | | | | | | | | | __  | |\/| | |   | |_) |
| |_| |\___ \| |_| | |_| |_| |/ / | | |  | | |___|  __/
 \____|____/  \___/ \_____/|___/  |_| |_|  \____|_|
```

**Trade on Groww. Through Claude.**

![Build](https://img.shields.io/badge/build-passing-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![MCP](https://img.shields.io/badge/MCP-1.12-purple)
![Node](https://img.shields.io/badge/node-%3E%3D18-green)
![License](https://img.shields.io/badge/license-MIT-grey)

---

## What is this

An MCP server that connects Claude Desktop to Groww's trading platform. It registers 23 tools that let you manage equity holdings, place buy/sell orders, track live market data, run SIPs, and invest in mutual funds -- all through natural language prompts in Claude. Supports a full mock mode for demos without touching real money.

---

## Architecture

```
┌──────────────────┐         stdio / MCP          ┌──────────────────────┐
│                  │ ────────────────────────────> │                      │
│  Claude Desktop  │                               │     groww-mcp        │
│  (MCP Client)    │ <──────────────────────────── │     (MCP Server)     │
│                  │      tool results (text)       │                      │
└──────────────────┘                               └──────────┬───────────┘
                                                              │
                                                              │ HTTPS
                                                              │ axios + retry
                                                              v
                                                   ┌──────────────────────┐
                                                   │     Groww API        │
                                                   │   (or mock layer)    │
                                                   └──────────────────────┘

                              ┌──────────────────────────────────────────┐
                              │            Registered Tools              │
                              ├────────────┬───────────┬─────────────────┤
                              │ portfolio  │  orders   │    market       │
                              │ positions  │  watchlist│    quotes       │
                              │ holdings   │  modify   │    OHLC         │
                              ├────────────┼───────────┼─────────────────┤
                              │    SIP     │   funds   │   search        │
                              │ create     │  invest   │   top movers    │
                              │ pause/stop │  details  │   status        │
                              └────────────┴───────────┴─────────────────┘
```

---

## Quickstart

**1. Clone and build**

```bash
git clone https://github.com/darved2305/groww-mcp.git
cd groww-mcp
npm install
cp .env.example .env     # add your GROWW_API_TOKEN or leave MOCK_MODE=true
npm run build
```

**2. Register with Claude Desktop**

Open your `claude_desktop_config.json` and add:

```json
{
  "mcpServers": {
    "groww": {
      "command": "node",
      "args": ["/absolute/path/to/groww-mcp/dist/index.js"],
      "env": {
        "MOCK_MODE": "true",
        "GROWW_API_TOKEN": "your_token_here"
      }
    }
  }
}
```

**3.** Restart Claude Desktop. You're done.

---

## Tools

23 tools across 6 domains.

### Portfolio

| # | Tool | Description | Params |
|---|------|-------------|--------|
| 1 | `get_holdings` | Current equity holdings with P&L | -- |
| 2 | `get_portfolio_summary` | Invested, current value, day P&L | -- |
| 3 | `get_positions` | Intraday open positions | -- |
| 4 | `get_order_history` | Past orders, filterable by date | `start_date?`, `end_date?` |

### Market

| # | Tool | Description | Params |
|---|------|-------------|--------|
| 5 | `get_quote` | LTP, bid/ask, volume for symbol | `symbol`, `exchange?` |
| 6 | `search_stocks` | Fuzzy search stocks by name/ticker | `query` |
| 7 | `get_ohlc_data` | OHLC candles, 1d/1w/1m/1y | `symbol`, `interval?` |
| 8 | `get_top_movers` | Top 5 gainers and losers | -- |
| 9 | `get_market_status` | NSE/BSE open or closed | -- |

### Orders

| # | Tool | Description | Params |
|---|------|-------------|--------|
| 10 | `place_order` | BUY/SELL, MARKET/LIMIT, CNC/MIS | `symbol`, `order_type`, `quantity`, `price?` |
| 11 | `cancel_order` | Cancel a pending order | `order_id` |
| 12 | `modify_order` | Change price or quantity | `order_id`, `price?`, `quantity?` |
| 13 | `get_order_status` | Real-time order status | `order_id` |

### Watchlist

| # | Tool | Description | Params |
|---|------|-------------|--------|
| 14 | `get_watchlist` | All watchlist symbols with LTP | -- |
| 15 | `add_to_watchlist` | Add a symbol | `symbol`, `exchange?` |
| 16 | `remove_from_watchlist` | Remove a symbol | `symbol`, `exchange?` |

### SIP

| # | Tool | Description | Params |
|---|------|-------------|--------|
| 17 | `list_sips` | All active SIPs with next date | -- |
| 18 | `create_sip` | New SIP: fund, amount, frequency | `isin`, `amount`, `frequency`, `start_date` |
| 19 | `pause_sip` | Pause an active SIP | `sip_id` |
| 20 | `cancel_sip` | Cancel SIP permanently | `sip_id` |

### Mutual Funds

| # | Tool | Description | Params |
|---|------|-------------|--------|
| 21 | `search_funds` | Search by name, category, AMC | `query`, `category?`, `amc?` |
| 22 | `get_fund_details` | NAV, AUM, expense ratio, returns | `isin` |
| 23 | `invest_in_fund` | One-time lumpsum investment | `isin`, `amount` |

---

## Example Prompts

> "What's my current portfolio P&L today?"

> "Buy 10 shares of RELIANCE at market price"

> "Show me top gainers on NSE right now"

> "Start a 5000/month SIP in Mirae Asset Large Cap"

> "Cancel all my pending orders"

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GROWW_API_TOKEN` | Yes* | -- | Groww API token for authentication |
| `GROWW_BASE_URL` | No | `https://api.groww.in/v1` | Base URL for the Groww API |
| `MOCK_MODE` | No | `false` | Set to `true` for demo data, no real API calls |
| `NODE_ENV` | No | `development` | Runtime environment |

*Not required when `MOCK_MODE=true`.

---

## Mock Mode

The server ships with a full mock data layer. Set `MOCK_MODE=true` in your environment and every tool returns realistic hardcoded data using real Indian stocks (RELIANCE, TCS, INFY, HDFCBANK, ICICIBANK, WIPRO, BAJFINANCE) and real mutual fund schemes. No Groww account needed. No API calls made.

```bash
MOCK_MODE=true node dist/index.js
```

---

## WARNING

**This software can place real trades and move real money.**

A poorly worded prompt can trigger a market order. A misunderstood confirmation can invest your savings in the wrong fund. The mock mode exists specifically so you don't learn this the hard way.

Use `MOCK_MODE=true` until you are absolutely certain. Test with small amounts first. The authors of this project accept zero responsibility for financial losses incurred through use of this tool.

---

## License

MIT
