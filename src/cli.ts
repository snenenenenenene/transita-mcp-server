#!/usr/bin/env node
/**
 * Transita MCP server — stdio entry point.
 *
 * Used by Claude Desktop, Cursor, Cline, Continue, Zed, and any
 * MCP-compatible client that spawns servers as subprocesses. Reads
 * MCP messages from stdin and writes responses to stdout — all
 * logging goes to stderr to stay out of the protocol stream.
 */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createTransitaMcpServer, SERVER_NAME, SERVER_VERSION } from "./server.js";
import { API_BASE_URL } from "./api.js";

async function main() {
  const server = createTransitaMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write(
    `[${SERVER_NAME}@${SERVER_VERSION}] connected over stdio (api=${API_BASE_URL})\n`
  );
}

main().catch((err) => {
  process.stderr.write(`[transita-mcp] fatal: ${(err as Error).message}\n`);
  process.exit(1);
});
