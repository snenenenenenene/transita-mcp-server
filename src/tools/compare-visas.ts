import { z } from "zod/v3";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { fetchJson } from "../api.js";
import type { VisaEntry } from "../types.js";

interface Response {
  visas: VisaEntry[];
  deltas: {
    fastestProcessing: string;
    lowestCost: string;
    longestValidity: string;
    pathToPR: string[];
  };
}

export function registerCompareVisas(server: McpServer): void {
  server.registerTool(
    "transita_compare_visas",
    {
      title: "Compare visas",
      description:
        "Compare 2-3 visa pathways side-by-side. Returns processing time, cost, validity, PR-pathway, and a delta summary highlighting the fastest, cheapest, and most permanent option.",
      inputSchema: {
        visa_ids: z
          .array(z.string())
          .min(2)
          .max(3)
          .describe(
            "2-3 Transita visa ids. Discover ids via transita_match_visas or the transita://visas resource."
          ),
      },
    },
    async ({ visa_ids }) => {
      const ids = visa_ids.map((s) => s.trim()).filter(Boolean);
      const data = await fetchJson<Response>(
        `/api/compare?ids=${ids.map(encodeURIComponent).join(",")}`
      );

      const idToVisa = new Map(data.visas.map((v) => [v.id, v]));
      const named = (id: string) => {
        const v = idToVisa.get(id);
        return v ? `${v.countryFlag} ${v.countryName} ${v.code}` : id;
      };

      const lines = [
        `Comparing ${data.visas.length} visa pathways:`,
        ...data.visas.map(
          (v) =>
            `\n${v.countryFlag} ${v.countryName} — ${v.name} (${v.code})\n` +
            `  Processing: ${v.processingTimeMonths.min}-${v.processingTimeMonths.max} months\n` +
            `  Cost: $${v.costUSD} USD\n` +
            `  Validity: ${v.validityYears} year(s)\n` +
            `  Path to PR: ${v.pathToPR ? `yes${v.prTimelineYears != null ? ` (~${v.prTimelineYears}y)` : ""}` : "no"}`
        ),
        "",
        "Deltas:",
        `  Fastest processing: ${named(data.deltas.fastestProcessing)}`,
        `  Lowest cost: ${named(data.deltas.lowestCost)}`,
        `  Longest validity: ${named(data.deltas.longestValidity)}`,
        data.deltas.pathToPR.length
          ? `  Path to PR: ${data.deltas.pathToPR.map(named).join(", ")}`
          : `  Path to PR: none of the compared options`,
      ];

      return {
        content: [{ type: "text", text: lines.join("\n") }],
        structuredContent: data as unknown as Record<string, unknown>,
      };
    }
  );
}
