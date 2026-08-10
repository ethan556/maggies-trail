#!/usr/bin/env node
/**
 * verify:instructional-colors (S200 prompt §20 / §33).
 *
 * The palette is semantic, not decorative. The colour contract in force:
 *
 *   sky       learner-controlled values
 *   tangerine target, prediction, attention
 *   leaf      confirmed relationship / valid result
 *   berry     misconception, conflict, invalid region
 *   ink       fixed mathematical structure, axes, labels, stable context
 *
 * A raw Tailwind palette class (violet-700, emerald-500, gray-400 …) sits outside that
 * contract: it carries no instructional meaning, it is not theme-managed, and it silently
 * breaks the "same entity keeps its colour everywhere" rule. §33 requires the gate to fail
 * on "raw colors bypassing tokens".
 *
 * Two tiers, because a gate that fails from birth gets skipped:
 *
 *   PROTECTED  the player core — zero tolerance. These files are clean today and every
 *              learner sees them on every step, so any new bypass fails immediately.
 *   BUDGET     the rest of the learner surface — a ratcheting count of known debt. New
 *              bypasses push the count over budget and fail; cleaning debt lets the number
 *              come down. Lower it, never raise it.
 *
 * Usage:  node scripts/verify-instructional-colors.mjs [--json]
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

const PROTECTED = [
  "src/components/LessonPlayer.tsx",
  "src/components/playerChrome.tsx",
  "src/components/WidgetView.tsx",
  "src/components/ui.tsx",
  "src/components/widgets.tsx",
  "src/components/figures.tsx"
];

/** Ratchet: known raw-colour debt outside the protected core. Lower only. */
const BUDGET = 37;

const RAW = /(?:text|bg|border|ring|from|via|to|fill|stroke|decoration|outline|divide|accent|caret|shadow)-(?:violet|purple|indigo|fuchsia|rose|amber|emerald|teal|cyan|lime|orange|red|green|blue|yellow|pink|slate|gray|zinc|neutral|stone)-\d{2,3}/g;

const root = process.cwd();

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, out);
    else if (/\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)) out.push(path);
  }
  return out;
}

const protectedHits = [];
const budgetHits = [];

for (const abs of walk(join(root, "src"))) {
  const rel = relative(root, abs);
  const text = readFileSync(abs, "utf8");
  for (const line of text.split("\n")) {
    // a class inside a comment is documentation, not a style
    if (/^\s*(\/\/|\*|\/\*)/.test(line)) continue;
    for (const match of line.matchAll(RAW)) {
      (PROTECTED.includes(rel) ? protectedHits : budgetHits).push(`${rel}: ${match[0]}`);
    }
  }
}

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ protectedHits, budgetCount: budgetHits.length, budget: BUDGET, budgetHits }, null, 2));
} else {
  console.log(`instructional colours: player core ${protectedHits.length === 0 ? "clean" : `${protectedHits.length} BYPASSES`} · rest of surface ${budgetHits.length}/${BUDGET} known debt`);
  if (budgetHits.length) {
    const byFile = new Map();
    for (const h of budgetHits) {
      const file = h.split(":")[0];
      byFile.set(file, (byFile.get(file) ?? 0) + 1);
    }
    for (const [file, n] of [...byFile].sort((a, b) => b[1] - a[1])) console.log(`    ${String(n).padStart(3)}  ${file}`);
  }
}

const failures = [];
for (const h of protectedHits) failures.push(`player core must use brand tokens only — ${h}`);
if (budgetHits.length > BUDGET) failures.push(`raw-colour debt rose to ${budgetHits.length}, above the ${BUDGET} budget — new bypasses were introduced`);
if (budgetHits.length < BUDGET) console.log(`instructional colours: debt fell to ${budgetHits.length} — lower BUDGET to ${budgetHits.length} so the ratchet holds the gain`);

if (failures.length) {
  console.error(`\nverify:instructional-colors FAILED with ${failures.length} issue${failures.length === 1 ? "" : "s"}:`);
  for (const f of failures) console.error(`- ${f}`);
  process.exit(1);
}
console.log("verify:instructional-colors passed");
