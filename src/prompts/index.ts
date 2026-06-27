import { z } from "zod/v3";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerPrompts(server: McpServer): void {
  server.registerPrompt(
    "find-my-visa",
    {
      title: "Find my visa",
      description:
        "Walk a user through Transita's eligibility quiz, then call transita_match_visas with their answers.",
      argsSchema: {
        citizenship: z
          .string()
          .optional()
          .describe("Pre-fill the user's nationality if known."),
      },
    },
    ({ citizenship }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text:
              `I want to find a visa pathway using Transita. ` +
              (citizenship
                ? `My nationality is ${citizenship}. `
                : `Please ask me for my nationality first. `) +
              `After collecting my nationality, ask me — one at a time — for my education level, total years of work experience, primary work field, annual income (USD), relocation goal, target countries (or leave open), and timeline. Then call the transita_match_visas tool with my answers and summarise the top 3 matches with concrete next steps.`,
          },
        },
      ],
    })
  );

  server.registerPrompt(
    "compare-options",
    {
      title: "Compare visa options",
      description:
        "Compare two or three Transita visa ids side-by-side with deltas and recommendations.",
      argsSchema: {
        visa_ids: z
          .string()
          .describe(
            "Comma-separated Transita visa ids (e.g. 'us-o1a,de-blue-card,pt-d7')."
          ),
      },
    },
    ({ visa_ids }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text:
              `Compare these visas using transita_compare_visas: ${visa_ids}. ` +
              `After receiving the data, summarise which option fits which kind of applicant best, ` +
              `and call transita_visa_details on each id to surface the document-checklist preview if useful.`,
          },
        },
      ],
    })
  );

  server.registerPrompt(
    "where-should-i-move",
    {
      title: "Where should I move?",
      description:
        "Open-ended exploration. Surfaces nationality-specific top destinations, then drills into matches.",
      argsSchema: {
        nationality: z.string().describe("User's nationality, e.g. 'Indian'."),
        profession: z
          .string()
          .optional()
          .describe("Optional — narrows the recommended visas."),
      },
    },
    ({ nationality, profession }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text:
              `I'm a ${profession ? `${profession} ` : ""}${nationality} citizen looking to move abroad. ` +
              `First, call transita_search_by_nationality with my nationality to surface the curated top destinations. ` +
              `Then, ask me a few quick clarifying questions (income range, timeline, family or solo) and call transita_match_visas with my answers. ` +
              `End with a concrete recommendation: which 2-3 pathways are worth investigating and what to do this week.`,
          },
        },
      ],
    })
  );
}
