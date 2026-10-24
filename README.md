# @transita/mcp-server

Visa eligibility and immigration data from [Transita](https://transita.app) for Claude, ChatGPT, Cursor, Cline, Zed and any other MCP client.

Ask your assistant "where should I move?" and it can check your profile against 100+ visas in 16 countries, compare pathways, and tell you whether a programme is open right now. Every answer links to the official government source.

The package holds no data. It calls the public Transita API, so it picks up visa changes as soon as transita.app redeploys. No API key, no account.

There are two ways to connect:

- **Hosted:** `https://transita.app/api/mcp` (Streamable HTTP, no auth). Nothing to install.
- **Local:** `npx -y @transita/mcp-server` (stdio). Needs Node 20 or newer.

## Install

### Claude Code

Hosted:

```bash
claude mcp add --transport http transita https://transita.app/api/mcp
```

Local:

```bash
claude mcp add transita -- npx -y @transita/mcp-server
```

Add `--scope user` to make it available in every project. Run `/mcp` to check it connected.

### Claude Desktop and claude.ai

Hosted: add a custom connector at [claude.ai/customize/connectors](https://claude.ai/customize/connectors) with the URL `https://transita.app/api/mcp`. It shows up in Claude Desktop too.

Local: edit `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS or `%APPDATA%\Claude\claude_desktop_config.json` on Windows, then restart Claude Desktop.

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

### ChatGPT

ChatGPT only talks to remote servers, so use the hosted endpoint. Turn on developer mode in ChatGPT's settings, create a new connector, paste `https://transita.app/api/mcp` as the server URL and pick "No authentication". Developer mode is limited to some paid plans and OpenAI moves the menu around, so check their help pages if you can't find it.

### Cursor

Add this to `~/.cursor/mcp.json` for all projects, or `.cursor/mcp.json` for one:

```json
{
  "mcpServers": {
    "transita": {
      "url": "https://transita.app/api/mcp"
    }
  }
}
```

For the local version, replace the `url` line with `"command": "npx", "args": ["-y", "@transita/mcp-server"]`.

### Cline, Continue, Zed and others

Any client that takes a stdio command works with `command: npx` and `args: ["-y", "@transita/mcp-server"]`. Clients that support Streamable HTTP can use `https://transita.app/api/mcp` instead.

## Tools

| Tool | What it does |
|---|---|
| `transita_match_visas` | Scores a profile (citizenship, education, years of work, income, goal, timeline) against every visa and returns the closest matches, with scores that are estimates. |
| `transita_visa_details` | One visa in full: eligibility, processing time, fees, validity, route to permanent residency, and a preview of the document checklist. |
| `transita_compare_visas` | Puts 2 or 3 visas side by side and points out which is fastest, cheapest, valid longest, and which leads to permanent residency. |
| `transita_country_overview` | A destination at a glance: number of visas, EU membership, scores, drawbacks, main cities with rent ranges, PR and citizenship timelines. |
| `transita_search_by_nationality` | Destinations and a suggested visa for citizens of one country. Useful when someone asks "where could I move?" and only knows their citizenship. |
| `transita_programme_status` | Whether a visa is taking applications now. For round-based programmes like Express Entry it also gives the last round's date and cutoff score. |

All tools are read-only: they declare `readOnlyHint: true`, `destructiveHint: false`, `idempotentHint: true` and `openWorldHint: false`. Nothing is stored or sent on your behalf, and no account or API key is needed.

## Resources

- `transita://visas`: every active visa
- `transita://countries`: destination countries with visa counts
- `transita://nationalities`: the nationality guides
- `transita://nationality/<slug>`: one nationality guide, e.g. `transita://nationality/indian`

## Prompts

- `find-my-visa`: asks a few eligibility questions, then calls `transita_match_visas`
- `compare-options`: runs `transita_compare_visas` on the visas you pick
- `where-should-i-move`: starts from your nationality and explores from there

## Example questions

- "I'm an Indian software engineer with a master's and 5 years of experience. Where should I move?"
- "Compare the US O-1A, Germany's EU Blue Card and Portugal's D8. Which one gets me permanent residency soonest?"
- "Is Canada's Express Entry open right now, and what was the last cutoff?"
- "What does Portugal's D8 digital nomad visa require?"

## Configuration

Only relevant for the local package.

| Env var | Default | Purpose |
|---|---|---|
| `TRANSITA_API_URL` | `https://transita.app` | API base URL. Point it at `http://localhost:3000` for local development. |
| `TRANSITA_MCP_USER_AGENT` | `transita-mcp-server/<version>` | User-Agent sent with each API request. |

## Free and paid

Everything the server returns is free. The full document checklist and 30-day action plan are part of Transita's paid plan at `https://transita.app/path/<id>`. Tool results include a checklist preview and a link to the full plan.

## Development

```bash
git clone https://github.com/snenenenenenene/transita-mcp-server.git
cd transita-mcp-server
bun install
bun run build
```

Run it against a local Transita dev server:

```bash
TRANSITA_API_URL=http://localhost:3000 node dist/cli.js
```

Smoke test from the command line:

```bash
{
  echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"smoke","version":"0.0"}}}'
  echo '{"jsonrpc":"2.0","method":"notifications/initialized"}'
  echo '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'
} | node dist/cli.js
```

## Publishing

npm hosts the package and the MCP Registry holds the metadata in `server.json`. Bump the version in `package.json`, both `version` fields of `server.json`, `src/server.ts` and `src/api.ts` first.

Build and publish to npm:

```bash
bun run build
npm publish --access public
```

Push the source to the public mirror:

```bash
./sync-mirror.sh
```

Publish the metadata. Install the publisher once with Homebrew first.

```bash
mcp-publisher login github
mcp-publisher publish
```

## License

MIT, see LICENSE.

## Links

- Website: <https://transita.app>
- MCP page: <https://transita.app/mcp>
- Source (public mirror): <https://github.com/snenenenenenene/transita-mcp-server>
- MCP Registry name: `io.github.snenenenenenene/transita-mcp-server`
- Model Context Protocol: <https://modelcontextprotocol.io>
