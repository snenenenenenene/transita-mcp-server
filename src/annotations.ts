/**
 * Tool annotations shared by every tool in this package. See
 * apps/web/src/lib/mcp/annotations.ts for what each hint means and why these
 * values are true of every Transita tool. Keep the two objects identical.
 */
import type { ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";

export const READ_ONLY_TOOL: ToolAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};
