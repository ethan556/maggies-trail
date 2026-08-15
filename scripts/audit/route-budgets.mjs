#!/usr/bin/env node
/**
 * S242 / PERF-01 — ROUTE FIRST-LOAD BUDGETS, FAILING CLOSED.
 *
 * WHY THIS EXISTS. The audit recorded ~7.0 MiB of static JavaScript and two routes at ~916–918 kB
 * first load, with no budget of any kind. A number in an audit does not stop the next commit adding
 * 40 kB to it; only a gate does. This is the gate.
 *
 * WHAT IT MEASURES. `.next/app-build-manifest.json` maps each route to the exact chunk files the
 * browser fetches for its first load. This sums those files on disk, deduplicated — read from the
 * artifact rather than scraped from build stdout, because stdout formatting is not an API and has
 * changed between Next releases.
 *
 * WHAT THE NUMBER IS, STATED PLAINLY. This sums every .js chunk the manifest associates with a
 * route, deduplicated against the layout's. It runs LARGER than the "First Load JS" Next prints —
 * ~3.4 MB against ~918 kB for /review — because the manifest lists chunks Next excludes from that
 * headline, and because Next's figure is post-optimisation. Do not compare the two numbers. What
 * matters for a ratchet is that the measure is consistent and derived from the artifact rather than
 * from stdout, so a regression moves it. Absolute page weight is a separate question, answered by
 * a real network trace, and is PERF-01's remaining work.
 *
 * HOW THE BUDGETS WERE SET. Each is the measured value at S242 plus headroom (5% or 10 kB,
 * whichever is larger, rounded up). That makes this a RATCHET, not a target: it cannot be met by
 * doing nothing badly, and it fails the moment a route grows meaningfully. It is deliberately NOT
 * set to an aspirational number — a budget nobody can pass gets deleted, and a deleted budget
 * protects nothing.
 *
 * THE TWO HOTSPOTS ARE BUDGETED AT THEIR CURRENT SIZE, NOT THEIR RIGHT SIZE. `/practice/[chapterId]`
 * and `/review` sit near 916 kB because they pull the whole generator registry and widget library
 * into the client bundle. Splitting that is real work with real risk, and it is not this file's job.
 * What this file guarantees is that they do not get WORSE while that work is scheduled. When they
 * are split, lower the numbers here in the same commit — the ratchet only means something if it
 * moves down.
 *
 * Usage:
 *   node scripts/audit/route-budgets.mjs            # check against budgets, exit 1 on breach
 *   node scripts/audit/route-budgets.mjs --report   # print every route, change nothing
 *   node scripts/audit/route-budgets.mjs --update   # rewrite budgets from the current build
 */
import { readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const MANIFEST = join(root, ".next", "app-build-manifest.json");
const BUDGETS = join(root, "ROUTE_BUDGETS.json");
const mode = process.argv.includes("--update") ? "update" : process.argv.includes("--report") ? "report" : "check";

if (!existsSync(MANIFEST)) {
  console.error("route-budgets: no .next/app-build-manifest.json — run `npm run build` first.");
  process.exit(2);
}

const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
const sizeOf = (file) => {
  const p = join(root, ".next", file);
  return existsSync(p) ? statSync(p).size : 0;
};

/** First-load bytes for a route: its own chunks plus the shared layout chunks, deduplicated. */
const layoutChunks = new Set(manifest.pages["/layout"] ?? []);
const routes = [];
for (const [page, chunks] of Object.entries(manifest.pages)) {
  if (!page.endsWith("/page")) continue;
  // Strip route groups — "(shell)" is a filesystem grouping, not part of the URL, and Next does
  // not print it. A budget file naming routes the app does not have is a budget file nobody trusts.
  const route = page.slice(0, -"/page".length).replace(/\/\([^/]+\)/g, "") || "/";
  const all = new Set([...layoutChunks, ...chunks]);
  let bytes = 0;
  for (const c of all) if (c.endsWith(".js")) bytes += sizeOf(c);
  routes.push({ route, bytes });
}
routes.sort((a, b) => b.bytes - a.bytes);

const kb = (b) => Math.round(b / 1024);
const headroom = (b) => Math.ceil((b + Math.max(b * 0.05, 10 * 1024)) / 1024);

if (mode === "report") {
  for (const r of routes) console.log(`${String(kb(r.bytes)).padStart(6)} kB  ${r.route}`);
  process.exit(0);
}

if (mode === "update") {
  const budgets = Object.fromEntries(routes.map((r) => [r.route, headroom(r.bytes)]));
  writeFileSync(BUDGETS, JSON.stringify({
    note: "First-load JS budget per route, in kB. Measured value + max(5%, 10 kB). A RATCHET: "
        + "lower these when a route is genuinely split; never raise one without saying why in the commit.",
    updatedAt: new Date().toISOString(),
    budgetsKb: budgets
  }, null, 2) + "\n");
  console.log(`route-budgets: wrote ${routes.length} budgets to ROUTE_BUDGETS.json`);
  process.exit(0);
}

if (!existsSync(BUDGETS)) {
  console.error("route-budgets: no ROUTE_BUDGETS.json — run with --update once to establish it.");
  process.exit(2);
}
const { budgetsKb } = JSON.parse(readFileSync(BUDGETS, "utf8"));
const breaches = [];
const unbudgeted = [];
for (const r of routes) {
  const budget = budgetsKb[r.route];
  // A NEW route with no budget is a finding, not a pass. Silence on unknown routes is how a
  // budget file quietly stops covering the app it is meant to cover.
  if (budget === undefined) { unbudgeted.push(r); continue; }
  if (kb(r.bytes) > budget) breaches.push({ ...r, budget });
}

for (const b of breaches) console.error(`OVER  ${b.route}: ${kb(b.bytes)} kB > ${b.budget} kB budget`);
for (const u of unbudgeted) console.error(`NEW   ${u.route}: ${kb(u.bytes)} kB, no budget recorded — run --update and review the diff`);

if (breaches.length || unbudgeted.length) {
  console.error(`\nroute-budgets: ${breaches.length} over budget, ${unbudgeted.length} unbudgeted.`);
  process.exit(1);
}
console.log(`route-budgets: ${routes.length} routes all within budget (largest ${kb(routes[0].bytes)} kB ${routes[0].route}).`);
