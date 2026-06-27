import { z } from "zod/v3";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { fetchJson } from "../api.js";
import type { CountryConfig, VisaEntry } from "../types.js";

interface Response {
  country: CountryConfig;
  visaCount: number;
  visas: VisaEntry[];
}

export function registerCountryOverview(server: McpServer): void {
  server.registerTool(
    "transita_country_overview",
    {
      title: "Country overview",
      description:
        "Get summary data for a destination country: number of visa pathways, EU member status, score dimensions, drawbacks, top cities with rent ranges, and PR/citizenship timelines.",
      inputSchema: {
        country_code: z
          .string()
          .describe(
            "Lowercase country code, e.g. 'us', 'de', 'pt'. List available codes via the transita://countries resource."
          ),
      },
    },
    async ({ country_code }) => {
      const data = await fetchJson<Response>(
        `/api/country/${encodeURIComponent(country_code.toLowerCase())}`
      );

      const c = data.country;
      const lines = [
        `${c.flag} ${c.name} (${c.code})${c.isEUMember ? " — EU member" : ""}`,
        c.guideIntro,
        "",
        `Visa pathways supported: ${data.visaCount}`,
        `PR after: ~${c.prTimelineYears} years · Citizenship after: ~${c.citizenshipTimelineYears} years`,
        "",
        "Score dimensions:",
        ...c.scoreDimensions.map((s) => `  ${s.label}: ${s.score}/100`),
        "",
        "Cost of living (sample cities):",
        ...c.cities.map((city) => `  ${city.city}: ${city.monthlyUSD}${city.note ? ` (${city.note})` : ""}`),
        "",
        "Drawbacks:",
        ...c.drawbacks.map((d) => `  • ${d}`),
        "",
        "Visas available:",
        ...data.visas.map((v) => `  - ${v.code}: ${v.name} (id: ${v.id})`),
      ];

      return {
        content: [{ type: "text", text: lines.join("\n") }],
        structuredContent: data as unknown as Record<string, unknown>,
      };
    }
  );
}
