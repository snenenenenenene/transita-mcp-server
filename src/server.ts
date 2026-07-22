/**
 * Transita MCP server factory.
 *
 * Builds an McpServer with all Transita tools, resources, and prompts
 * wired to the public Transita JSON API. The same factory is used by
 * both the stdio CLI entry point (cli.ts) and the hosted SSE endpoint
 * exposed at transita.app/api/mcp/sse.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerMatchVisas } from "./tools/match-visas.js";
import { registerVisaDetails } from "./tools/visa-details.js";
import { registerCompareVisas } from "./tools/compare-visas.js";
import { registerCountryOverview } from "./tools/country-overview.js";
import { registerSearchByNationality } from "./tools/search-by-nationality.js";
import { registerProgrammeStatus } from "./tools/programme-status.js";
import { registerResources } from "./resources/index.js";
import { registerPrompts } from "./prompts/index.js";

export const SERVER_NAME = "transita";
export const SERVER_VERSION = "0.1.2";

export function createTransitaMcpServer(): McpServer {
  const server = new McpServer(
    { name: SERVER_NAME, version: SERVER_VERSION },
    {
      capabilities: { tools: {}, resources: {}, prompts: {}, logging: {} },
      // $49 = keep in sync with apps/web/src/lib/pricing.ts PLAN_PRICE_USD
      instructions:
        "Transita scores immigration eligibility across 100+ visa pathways spanning 15+ countries. Start by calling transita_match_visas with the user's profile, or transita_search_by_nationality if they only know their citizenship. Use transita_visa_details and transita_compare_visas to drill in. Before recommending a round-based pathway (Express Entry, AU SkillSelect, US H-1B), call transita_programme_status to confirm it is currently open and see the last cutoff score. The full document checklist + 30-day plan is paid ($49) and lives at https://transita.app/visa/<id>.",
    }
  );

  registerMatchVisas(server);
  registerVisaDetails(server);
  registerCompareVisas(server);
  registerCountryOverview(server);
  registerSearchByNationality(server);
  registerProgrammeStatus(server);
  registerResources(server);
  registerPrompts(server);

  return server;
}
