import { z } from "zod/v3";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { fetchJson } from "../api.js";
import type { NationalityPageData } from "../types.js";

interface NationalityResponse {
  nationality: NationalityPageData;
}

interface NationalitiesIndex {
  count: number;
  nationalities: { slug: string; nationality: string; country: string; flag: string }[];
}

const SLUG_OVERRIDES: Record<string, string> = {
  america: "american",
  americans: "american",
  india: "indian",
  indians: "indian",
  brazil: "brazilian",
  brazilians: "brazilian",
  uk: "british",
  britain: "british",
  britons: "british",
  germany: "german",
  germans: "german",
  france: "french",
  spain: "spanish",
};

function nationalityToSlug(input: string): string {
  const normalized = input.trim().toLowerCase();
  if (SLUG_OVERRIDES[normalized]) return SLUG_OVERRIDES[normalized];
  return normalized;
}

export function registerSearchByNationality(server: McpServer): void {
  server.registerTool(
    "transita_search_by_nationality",
    {
      title: "Search visas by nationality",
      description:
        "Show top destinations and recommended visa pathways for citizens of a given country. Ideal first stop for the question 'Where should I move?'. Returns 4-6 destinations with the best-fit visa for each, key stats, and FAQ. Falls back gracefully if a slug isn't yet curated.",
      inputSchema: {
        nationality: z
          .string()
          .describe(
            "Nationality adjective (e.g. 'Indian') or country (e.g. 'India'). Case-insensitive."
          ),
      },
    },
    async ({ nationality }) => {
      const slug = nationalityToSlug(nationality);
      try {
        const data = await fetchJson<NationalityResponse>(
          `/api/nationality/${encodeURIComponent(slug)}`
        );
        const n = data.nationality;
        const lines = [
          `${n.flag} ${n.headline}`,
          "",
          n.intro,
          "",
          "Top destinations:",
          ...n.topDestinations.map(
            (d, i) =>
              `  ${i + 1}. ${d.flag} ${d.country} — ${d.visaName}\n     ${d.why}`
          ),
          "",
          ...(n.keyStats.length
            ? ["Key stats:", ...n.keyStats.map((s) => `  ${s.value} — ${s.label}`), ""]
            : []),
          ...(n.faq.length
            ? ["FAQ:", ...n.faq.slice(0, 3).map((f) => `  Q: ${f.q}\n  A: ${f.a}`)]
            : []),
          "",
          `More: https://transita.app/from/${n.slug}`,
        ];

        return {
          content: [{ type: "text", text: lines.join("\n") }],
          structuredContent: data as unknown as Record<string, unknown>,
        };
      } catch (err) {
        const index = await fetchJson<NationalitiesIndex>(`/api/nationalities`);
        const available = index.nationalities
          .map((n) => `${n.flag} ${n.nationality} (${n.slug})`)
          .join(", ");
        const message =
          `No curated guidance for "${nationality}" yet. ` +
          `Try transita_match_visas with citizenship="${nationality}" instead, or pick a curated nationality:\n\n${available}`;
        return {
          content: [{ type: "text", text: message }],
          isError: false,
          structuredContent: {
            error: (err as Error).message,
            availableSlugs: index.nationalities.map((n) => n.slug),
          },
        };
      }
    }
  );
}
