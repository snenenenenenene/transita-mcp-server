/**
 * Thin HTTP client over the public Transita JSON API.
 *
 * The MCP server is a stateless shim — it never owns visa data. It
 * forwards every tool call to transita.app, which means visa updates
 * propagate the moment the website redeploys. The API base URL can
 * be overridden via the TRANSITA_API_URL env var to point at a local
 * dev server during testing.
 */

export const API_BASE_URL =
  process.env.TRANSITA_API_URL?.replace(/\/$/, "") ?? "https://transita.app";

const USER_AGENT =
  process.env.TRANSITA_MCP_USER_AGENT ?? "transita-mcp-server/0.1.0";

interface FetchJsonOptions {
  method?: "GET" | "POST";
  body?: unknown;
  signal?: AbortSignal;
}

export async function fetchJson<T>(
  path: string,
  opts: FetchJsonOptions = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const init: RequestInit = {
    method: opts.method ?? "GET",
    headers: {
      "Accept": "application/json",
      "User-Agent": USER_AGENT,
      "X-Source": "MCP",
      ...(opts.body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    signal: opts.signal,
  };
  if (opts.body !== undefined) {
    init.body = JSON.stringify(opts.body);
  }

  const res = await fetch(url, init);
  const text = await res.text();

  if (!res.ok) {
    let detail = text;
    try {
      const parsed = JSON.parse(text) as { error?: string };
      if (parsed?.error) detail = parsed.error;
    } catch {
      // leave detail as raw text
    }
    throw new Error(
      `Transita API ${res.status} ${res.statusText} on ${path}: ${detail}`
    );
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Transita API returned non-JSON body on ${path}`);
  }
}
