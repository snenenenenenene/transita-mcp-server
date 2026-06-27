# @transita/mcp-server

> Immigration eligibility intelligence for Claude Desktop, Cursor, Cline, Continue, Zed, and any MCP-compatible AI assistant.

[Transita](https://transita.app) figures out which country you should move to — and runs the whole relocation. This MCP server exposes the same matcher, country comparisons, visa checklists, and nationality guides that power transita.app, so you can ask any AI assistant "where should I move?" and get a real, sourced answer.

The server is a stateless shim. It calls the public Transita JSON API, so visa data updates the moment transita.app redeploys. No data lives in this package.

## Install

### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "transita": {
      "command": "npx",
      "args": ["-y", "@transita/mcp-server"]
    }
  }
}
```

Restart Claude Desktop. The Transita tools should appear in the input box.

### Cursor

Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "transita": {
      "command": "npx",
      "args": ["-y", "@transita/mcp-server"]
    }
  }
}
```

### Cline (VS Code extension)

Open the Cline MCP settings panel and add:

```json
{
  "transita": {
    "command": "npx",
    "args": ["-y", "@transita/mcp-server"]
  }
}
```

### Continue, Zed, any other MCP client

Use the same pattern — `command: npx`, `args: ["-y", "@transita/mcp-server"]`.

## What it exposes

### Tools (5)

| Tool | What it does |
|---|---|
| `transita_match_visas` | Score a profile (citizenship, education, work years, income, goal, timeline) against every visa Transita supports. Returns top matches ranked by eligibility. |
| `transita_visa_details` | Full details for a single visa: eligibility, processing time, fees, validity, PR path, and a free preview of the document checklist. |
| `transita_compare_visas` | Side-by-side comparison of 2-3 visa pathways with deltas (fastest processing, lowest cost, longest validity, PR path). |
| `transita_country_overview` | Country-level summary: number of visa pathways, EU membership, score dimensions, drawbacks, top cities with rent ranges, PR/citizenship timelines. |
| `transita_search_by_nationality` | Curated top destinations and recommended visas for citizens of a given country. Best first stop for "where should I move?" |

### Resources (4 base + dynamic templates)

- `transita://visas` — full active visa catalogue
- `transita://countries` — destination countries + visa counts
- `transita://nationalities` — index of curated nationality landing pages
- `transita://nationality/<slug>` — single nationality page (e.g. `transita://nationality/indian`)

### Prompts (3)

- `find-my-visa` — guided eligibility quiz then `transita_match_visas`
- `compare-options` — drives `transita_compare_visas` with a chosen set of ids
- `where-should-i-move` — open exploration starting from nationality

## Try it

Once installed, ask your AI assistant questions like:

- *"I'm an Indian software engineer with a master's and 5 years of experience. Where should I move?"*
- *"Compare the US O-1A, Germany's EU Blue Card, and Portugal's D8 — which is fastest, cheapest, and which has the best path to permanent residency?"*
- *"What does Portugal's D8 digital nomad visa actually require?"*
- *"How do destination scores compare for Germany versus the Netherlands?"*

The model will pick the right Transita tool, call it, and synthesise the answer. Visa data is verified by the Transita team monthly; every match links back to the official government source.

## Configuration

| Env var | Default | Purpose |
|---|---|---|
| `TRANSITA_API_URL` | `https://transita.app` | Override the API base URL (useful for local dev against `http://localhost:3000`). |
| `TRANSITA_MCP_USER_AGENT` | `transita-mcp-server/0.1.0` | Custom UA string for analytics. |

## Free vs paid

Everything this MCP server exposes is **free**. The full document checklist + 30-day action plan is part of Transita's $9 paid plan and lives at `https://transita.app/visa/<id>`. The MCP server's tools include a checklist preview (lead time, ancillary cost, first section) and link to the full plan.

## Development

```bash
git clone https://github.com/snenenenenenene/transita-mcp-server.git
cd transita-mcp-server
bun install
bun run build

# Point at a local Transita dev server
TRANSITA_API_URL=http://localhost:3000 node dist/cli.js
```

To smoke-test from the command line:

```bash
{
  echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"0.0"}}}'
  echo '{"jsonrpc":"2.0","method":"notifications/initialized"}'
  echo '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'
} | node dist/cli.js
```

## Publishing to npm + the MCP Registry

Two-step flow. The MCP Registry stores metadata; npm hosts the artifact.

```bash
# 1. Publish to npm (must be on a fresh version; bump in package.json first)
cd transita-mcp-server
bun run build
npm publish --access public

# 2. Publish metadata to the MCP Registry
#    Install mcp-publisher once: brew install mcp-publisher
#    server.json is committed alongside this README.
mcp-publisher login github
mcp-publisher publish
```

After publishing, the server is listed at <https://registry.modelcontextprotocol.io>
and discoverable inside MCP-compatible clients.

## License

MIT — see LICENSE.

## Links

- Website: <https://transita.app>
- MCP landing page: <https://transita.app/mcp>
- Source: <https://github.com/snenenenenenene/transita-mcp-server>
- MCP protocol: <https://modelcontextprotocol.io>
