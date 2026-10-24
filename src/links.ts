/**
 * Every transita.app link an MCP reply hands out carries UTM tags, so
 * assistant referrals show up in PostHog instead of as direct traffic.
 */
export function siteUrl(path: string): string {
  const url = new URL(path, "https://transita.app");
  url.searchParams.set("utm_source", "mcp");
  url.searchParams.set("utm_medium", "npm");
  url.searchParams.set("utm_campaign", "mcp-tools");
  return url.toString();
}
