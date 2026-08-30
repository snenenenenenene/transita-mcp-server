/**
 * Product facts this package quotes about the hosted Transita app.
 *
 * This is a separate published npm package (@transita/mcp-server), so it
 * cannot import apps/web/src/lib/pricing.ts directly — that module is
 * private to the Next.js app. Keep this the ONE literal in this package and
 * update it here when the live price changes;
 * apps/web/src/lib/mcpPackagePriceGuard.test.ts reads this file at test time
 * and fails the build if it disagrees with PLAN_PRICE_DISPLAY.
 *
 * That guard only stops the source in this repo from drifting — it does not
 * reach the already-published npm package or the public GitHub mirror. Those
 * are updated by hand; see externalSurfaces.ts's "npm" and "mcp-mirror-repo"
 * entries for how and by whom.
 */
export const PLAN_PRICE_DISPLAY = "$9";
