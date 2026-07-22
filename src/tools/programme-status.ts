import { z } from "zod/v3";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { fetchJson } from "../api.js";

interface Response {
  visaId: string;
  visaName: string;
  code: string;
  countryName: string;
  countryFlag: string;
  displayName: string;
  status: string;
  lastEventAt: string | null;
  lastEventSummary: string | null;
  lastCutoffScore: number | null;
  nextExpected: string | null;
  sourceUrl: string;
  fetchedAt: string;
}

const isoDate = (v: string | null): string | null =>
  v ? new Date(v).toISOString().slice(0, 10) : null;

export function registerProgrammeStatus(server: McpServer): void {
  server.registerTool(
    "transita_programme_status",
    {
      title: "Programme status (is this visa open now?)",
      description:
        "Check the live intake status of a single visa pathway: whether it is currently open, the last selection round and cutoff score (for round-based programmes like Express Entry, AU SkillSelect, or the US H-1B lottery), what is expected next, and the official source. Call this before recommending a pathway so you never send a user toward a closed or paused programme. Continuous-intake visas return an 'open' status.",
      inputSchema: {
        visa_id: z
          .string()
          .describe(
            "Transita visa id, e.g. 'ca-cec', 'us-h1b'. Use transita_match_visas or the transita://visas resource to discover ids."
          ),
      },
    },
    async ({ visa_id }) => {
      const s = await fetchJson<Response>(
        `/api/programme-status?visaId=${encodeURIComponent(visa_id)}`
      );

      const lines = [
        `${s.countryFlag} ${s.countryName}: ${s.visaName} (${s.code})`,
        `Programme: ${s.displayName}`,
        `Status: ${s.status.toUpperCase()}`,
        s.lastEventSummary ? `Latest: ${s.lastEventSummary}` : null,
        s.lastEventAt ? `Last event: ${isoDate(s.lastEventAt)}` : null,
        s.lastCutoffScore != null ? `Last cutoff score: ${s.lastCutoffScore}` : null,
        s.nextExpected ? `Next expected: ${s.nextExpected}` : null,
        `Source: ${s.sourceUrl}`,
        `Data fetched: ${isoDate(s.fetchedAt)}`,
        `Full pathway: https://transita.app/path/${s.visaId}`,
      ].filter(Boolean);

      return {
        content: [{ type: "text", text: lines.join("\n") }],
        structuredContent: s as unknown as Record<string, unknown>,
      };
    }
  );
}
