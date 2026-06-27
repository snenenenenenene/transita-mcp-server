import { z } from "zod/v3";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { fetchJson } from "../api.js";
import type { VisaPath } from "../types.js";

interface MatchInput {
  citizenship: string;
  current_country?: string;
  education?:
    | "high_school"
    | "associate"
    | "bachelor"
    | "master"
    | "phd"
    | "professional";
  work_years?: number;
  work_field?: string;
  income_usd?: number;
  goal?:
    | "work_tech"
    | "start_company"
    | "study_work"
    | "relocate_family"
    | "digital_nomad";
  target_countries?: string[];
  timeline?: "asap" | "6months" | "1year" | "2plus";
  age?: number;
}

const inputSchema = {
  citizenship: z.string(),
  current_country: z.string().optional(),
  education: z
    .enum(["high_school", "associate", "bachelor", "master", "phd", "professional"])
    .optional(),
  work_years: z.number().int().min(0).max(60).optional(),
  work_field: z.string().optional(),
  income_usd: z.number().int().min(0).optional(),
  goal: z
    .enum([
      "work_tech",
      "start_company",
      "study_work",
      "relocate_family",
      "digital_nomad",
    ])
    .optional(),
  target_countries: z.array(z.string()).optional(),
  timeline: z.enum(["asap", "6months", "1year", "2plus"]).optional(),
  age: z.number().int().min(15).max(80).optional(),
};

const incomeRange = (income?: number): string => {
  if (income == null) return "";
  if (income < 30_000) return "under_30k";
  if (income < 60_000) return "30k_60k";
  if (income < 100_000) return "60k_100k";
  if (income < 150_000) return "100k_150k";
  return "over_150k";
};

interface MatchResponse {
  results: VisaPath[];
  isFast: boolean;
}

export function registerMatchVisas(server: McpServer): void {
  server.registerTool(
    "transita_match_visas",
    {
      title: "Match visas",
      description:
        "Score a user's profile against every visa pathway Transita supports. Returns the top matches ranked by eligibility, with timeline, cost, and links to official sources. EU citizens automatically surface freedom-of-movement options first.",
      inputSchema,
    },
    async (args) => {
      const quizAnswers = {
        citizenship: args.citizenship,
        currentCountry: args.current_country ?? "",
        education: args.education ?? "",
        workYears: args.work_years != null ? String(args.work_years) : "",
        workField: args.work_field ?? "",
        income: incomeRange(args.income_usd),
        goal: args.goal ?? "",
        targetCountries: args.target_countries ?? [],
        timeline: args.timeline ?? "",
      };

      const data = await fetchJson<MatchResponse>("/api/match/fast", {
        method: "POST",
        body: quizAnswers,
      });

      const slim = data.results.slice(0, 6).map((r) => ({
        id: r.id,
        visa: `${r.countryFlag} ${r.countryName} — ${r.visaName} (${r.visaCode})`,
        score: r.matchScore,
        timeline: r.timelineMonths,
        cost: r.costRange,
        pathToPR: r.pathToPR ?? false,
        officialUrl: r.officialUrl,
        officialSource: r.officialSource,
        description: r.description,
        details_url: `https://transita.app/visa/${r.id}`,
      }));

      const summary = slim.length
        ? `Top ${slim.length} visa matches for a ${args.citizenship} citizen:\n` +
          slim
            .map(
              (m, i) =>
                `${i + 1}. ${m.visa} — score ${m.score}/100, ~${m.timeline}, ${m.cost}${m.pathToPR ? " · path to PR" : ""}\n   ${m.description}\n   Official: ${m.officialUrl ?? "n/a"}\n   Full details: ${m.details_url}`
            )
            .join("\n\n")
        : "No visa matches above the minimum score threshold for this profile.";

      return {
        content: [{ type: "text", text: summary }],
        structuredContent: { matches: slim, count: slim.length },
      };
    }
  );
}
