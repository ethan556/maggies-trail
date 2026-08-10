#!/usr/bin/env node
/**
 * verify:visual-explanations (S200 prompt §22 / §33).
 *
 * Every load-bearing concept intro should open with something to look at — a figure, a
 * manipulative state, a diagram, a derivation. S199's expansion courses shipped without them,
 * which is the regression §22 names. This gate measures the real coverage and refuses to let it
 * slip back.
 *
 * Coverage = concept steps carrying a REGISTERED `figure` / all concept steps. A figure id that
 * is not in FIGURE_IDS renders nothing, so it does not count — that is the failure mode this
 * gate exists to catch, and it is exactly how the two construction steps (cp-01-02 i1,
 * cp-01-03 i1) hid for a whole session behind a kind gate.
 *
 * FLOOR ratchets upward as repair lands. It is deliberately NOT set to the §22 target of 99.5%:
 * a gate that fails from the day it is written teaches people to skip it. It fails on regression
 * today and on missed progress tomorrow, and it prints the distance still to run.
 *
 * Usage:  node scripts/verify-visual-explanations.mjs [--json]
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

/** Ratchet. Raise this as each course is repaired; never lower it. */
const FLOOR_PCT = 100;
/** §22's stated destination. Reported every run so the remaining distance stays visible. */
const TARGET_PCT = 99.5;

const root = process.cwd();
const coursesDir = join(root, "content", "courses");

function figureIds() {
  const src = readFileSync(join(root, "src", "components", "figureIds.ts"), "utf8");
  const open = src.indexOf("new Set([");
  const close = src.indexOf("])", open);
  if (open === -1 || close === -1) throw new Error("figureIds.ts: cannot locate the FIGURE_IDS set");
  return new Set([...src.slice(open, close).matchAll(/"([^"]+)"/g)].map((m) => m[1]));
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, out);
    else if (entry.name.endsWith(".json")) out.push(path);
  }
  return out;
}

const ids = figureIds();
let concept = 0;
let figured = 0;
const unregistered = [];
const gapsByCourse = new Map();

for (const path of walk(coursesDir)) {
  let lesson;
  try { lesson = JSON.parse(readFileSync(path, "utf8")); } catch { continue; }
  if (!lesson?.id || !Array.isArray(lesson.steps)) continue;
  const course = relative(coursesDir, path).split("/")[0];
  for (const step of lesson.steps) {
    if (step.kind !== "concept") continue;
    concept += 1;
    if (typeof step.figure === "string" && step.figure.length > 0) {
      if (ids.has(step.figure)) { figured += 1; continue; }
      unregistered.push(`${lesson.id}:${step.id} -> "${step.figure}" is not in FIGURE_IDS`);
    }
    gapsByCourse.set(course, (gapsByCourse.get(course) ?? 0) + 1);
  }
}

const pct = concept === 0 ? 0 : (figured / concept) * 100;
const rounded = Math.round(pct * 100) / 100;
const gaps = [...gapsByCourse.entries()].sort((a, b) => b[1] - a[1]);
const remainingToTarget = Math.max(0, Math.ceil((TARGET_PCT / 100) * concept) - figured);

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({
    conceptSteps: concept, figuredConceptSteps: figured, coveragePct: rounded,
    floorPct: FLOOR_PCT, targetPct: TARGET_PCT, remainingToTarget,
    unregistered, gapsByCourse: Object.fromEntries(gaps)
  }, null, 2));
} else {
  console.log(`visual explanations: ${figured}/${concept} concept steps carry a registered figure (${rounded}%)`);
  console.log(`  floor ${FLOOR_PCT}% · §22 target ${TARGET_PCT}% · ${remainingToTarget} more figure${remainingToTarget === 1 ? "" : "s"} to reach it`);
  if (gaps.length) {
    console.log("  remaining gaps by course:");
    for (const [course, n] of gaps) console.log(`    ${String(n).padStart(3)}  ${course}`);
  }
}

const failures = [];
if (rounded < FLOOR_PCT) failures.push(`coverage ${rounded}% fell below the ${FLOOR_PCT}% floor — a figure was removed or a concept step was added without one`);
for (const u of unregistered) failures.push(`unregistered figure: ${u}`);

if (failures.length) {
  console.error(`\nverify:visual-explanations FAILED with ${failures.length} issue${failures.length === 1 ? "" : "s"}:`);
  for (const f of failures) console.error(`- ${f}`);
  process.exit(1);
}
console.log("verify:visual-explanations passed");
