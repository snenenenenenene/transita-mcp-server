import { z } from "zod/v3";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { fetchJson } from "../api.js";
import type { ChecklistPreview, VisaEntry } from "../types.js";

interface Response {
  visa: VisaEntry;
  checklistPreview: ChecklistPreview;
}

export function registerVisaDetails(server: McpServer): void {
  server.registerTool(
    "transita_visa_details",
    {
      title: "Visa details",
      description:
        "Fetch full details for a single visa pathway: eligibility category, processing time, fees, validity, PR timeline, and a free preview of the document checklist (lead time, ancillary cost, first section). The full multi-section checklist is part of Transita's $9 paid action plan.",
      inputSchema: {
        visa_id: z
          .string()
          .describe(
            "Transita visa id, e.g. 'us-o1a', 'es-digital-nomad'. Use transita_match_visas or the transita://visas resource to discover ids."
          ),
      },
    },
    async ({ visa_id }) => {
      const data = await fetchJson<Response>(
        `/api/visa/${encodeURIComponent(visa_id)}`
      );

      const v = data.visa;
      const c = data.checklistPreview;
      const lines = [
        `${v.countryFlag} ${v.countryName} — ${v.name} (${v.code})`,
        v.description,
        "",
        `Category: ${v.category}`,
        `Processing time: ${v.processingTimeMonths.min}-${v.processingTimeMonths.max} months`,
        `Government fee: $${v.costUSD} USD`,
        `Validity: ${v.validityYears} year(s)`,
        `Path to PR: ${v.pathToPR ? "yes" : "no"}${v.prTimelineYears != null ? ` (~${v.prTimelineYears} years)` : ""}`,
        v.requiresEmployerSponsor ? `Requires employer sponsor: yes` : null,
        `Official source: ${v.officialUrl}`,
        "",
        "Document checklist preview (free):",
        `  Start preparing: ${c.leadTime}`,
        `  Ancillary cost: ${c.ancillaryCost}`,
        c.firstSection
          ? `  First section — ${c.firstSection.label}:\n` +
            c.firstSection.docs
              .map((d) => `    • ${d.name} — ${d.where}${d.time ? ` (${d.time})` : ""}${d.cost ? `, ${d.cost}` : ""}`)
              .join("\n")
          : null,
        c.totalSections > 1
          ? `  ${c.totalSections - 1} more section(s) available in the full plan: ${c.paidPlanUrl}`
          : null,
      ].filter(Boolean);

      return {
        content: [{ type: "text", text: lines.join("\n") }],
        structuredContent: data as unknown as Record<string, unknown>,
      };
    }
  );
}
