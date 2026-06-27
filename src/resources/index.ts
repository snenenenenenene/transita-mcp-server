import {
  ResourceTemplate,
  type McpServer,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { fetchJson } from "../api.js";
import type { CountryConfig, NationalityPageData, VisaEntry } from "../types.js";

interface VisasResponse {
  count: number;
  visas: VisaEntry[];
}
interface CountriesResponse {
  count: number;
  countries: CountryConfig[];
}
interface NationalitiesResponse {
  count: number;
  nationalities: { slug: string; nationality: string; country: string; flag: string }[];
}
interface NationalityResponse {
  nationality: NationalityPageData;
}

export function registerResources(server: McpServer): void {
  server.registerResource(
    "transita-visas",
    "transita://visas",
    {
      title: "Transita visa catalogue",
      description:
        "Full active list of every visa pathway Transita scores. Refreshed monthly.",
      mimeType: "application/json",
    },
    async (uri) => {
      const data = await fetchJson<VisasResponse>("/api/visas");
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    }
  );

  server.registerResource(
    "transita-countries",
    "transita://countries",
    {
      title: "Transita destination countries",
      description: "Active destination countries plus per-country visa counts.",
      mimeType: "application/json",
    },
    async (uri) => {
      const data = await fetchJson<CountriesResponse>("/api/countries");
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    }
  );

  server.registerResource(
    "transita-nationalities",
    "transita://nationalities",
    {
      title: "Transita nationality guides",
      description:
        "Index of nationality-specific landing pages with curated top-destination guidance.",
      mimeType: "application/json",
    },
    async (uri) => {
      const data = await fetchJson<NationalitiesResponse>("/api/nationalities");
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    }
  );

  server.registerResource(
    "transita-nationality",
    new ResourceTemplate("transita://nationality/{slug}", {
      list: async () => {
        const data = await fetchJson<NationalitiesResponse>("/api/nationalities");
        return {
          resources: data.nationalities.map((n) => ({
            uri: `transita://nationality/${n.slug}`,
            name: `${n.flag} ${n.nationality}`,
            description: `Top destinations and recommended visas for ${n.nationality} citizens.`,
            mimeType: "application/json",
          })),
        };
      },
    }),
    {
      title: "Transita nationality guide",
      description:
        "Single nationality landing-page payload — top destinations, recommended visas, key stats, FAQ.",
      mimeType: "application/json",
    },
    async (uri, { slug }) => {
      const slugStr = Array.isArray(slug) ? slug[0] : String(slug);
      const data = await fetchJson<NationalityResponse>(
        `/api/nationality/${encodeURIComponent(slugStr)}`
      );
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    }
  );
}
