#!/usr/bin/env node
/**
 * verify:trail-voice (S200).
 *
 * Holds the theme language to one voice, and holds the theme OUT of the lesson player.
 *
 * Three checks, each of which failed silently before this gate existed:
 *
 *  1. CANONICAL SPELLING — "trailhead" is one word, "Trail clearing" is sentence case,
 *     the product is "Maggie's Trail". Thirty-nine files carried these as inline
 *     literals; nothing held them to one form.
 *
 *  2. SINGLE SOURCE for stage labels — the five step-kind stage names must come from
 *     TRAIL_STAGE, not be retyped. A retyped label drifts from the one the screen
 *     reader announces, and no test would notice.
 *
 *  3. PLAYER CONTAINMENT (§13) — the lesson player is the strongest surface in the
 *     product and the theme is not allowed to invade it: no landscape illustration,
 *     no persistent map, no guide character, no reward overlay. Enforced against the
 *     player's own import list so a future session cannot quietly decorate it.
 *
 * Scope note: content/ is NOT scanned. Lesson prose is authored, frozen, and may
 * legitimately say "trail" in a word problem about hiking; policing it would be a
 * copyedit, which the frozen-content protocol forbids.
 *
 * Usage: node scripts/verify-trail-voice.mjs [--json]
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const srcDir = join(root, "src");
const failures = [];
const notes = [];

/** Every source file except tests and the vocabulary module itself. */
function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) { walk(path, out); continue; }
    if (!/\.(ts|tsx)$/.test(entry.name)) continue;
    if (/\.test\.tsx?$/.test(entry.name)) continue;
    out.push(path);
  }
  return out;
}

const trailModule = join(srcDir, "lib", "trail.ts");
const files = walk(srcDir).filter((f) => f !== trailModule);

// ---- 1. canonical spelling ----
const trailSrc = readFileSync(trailModule, "utf8");
const canonical = [...trailSrc.matchAll(/\{ term: "([^"]+)", wrong: \[([^\]]*)\], why: "([^"]+)" \}/g)]
  .map((m) => ({
    term: m[1],
    wrong: [...m[2].matchAll(/"([^"]+)"/g)].map((w) => w[1]),
    why: m[3]
  }));
if (canonical.length === 0) failures.push("trail.ts: CANONICAL_TERMS could not be parsed — the spelling check would pass vacuously");

/**
 * Only learner-facing text is in scope. Two exclusions, both learned from this gate's
 * first run, where all three hits were false positives:
 *
 *   - `className` values are CSS identifiers, not copy. "trail-clearing-shell" is the
 *     correct name for a class; demanding "Trail clearing" there is nonsense.
 *   - matches must be whole words, or "halfway point" reads as a misspelled "way point"
 *     — which is how a real mathematical phrase in a figure title got flagged.
 *
 * A gate that cries wolf gets ignored, so precision here is not politeness; it is the
 * difference between a rule people follow and a rule people mute.
 */
function learnerFacingText(source) {
  return source
    .replace(/className\s*=\s*"[^"]*"/g, "")
    .replace(/className\s*=\s*\{[^}]*\}/g, "")
    .replace(/^\s*\.[\w-]+\s*\{[^}]*\}/gm, "");
}
const escapeRe = (v) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");



// ---- 2. stage labels come from TRAIL_STAGE ----
const stageLabels = [...trailSrc.matchAll(/^  (concept|interactive|check|challenge|recap): "([^"]+)",?$/gm)]
  .map((m) => m[2]);
if (stageLabels.length !== 5) failures.push(`trail.ts: expected 5 stage labels, parsed ${stageLabels.length}`);

// Checks 1 and 2 share one pass over the tree: spelling runs against the learner-facing
// projection of each file, the retyped-label check against the raw source (it is looking
// for a code pattern, not copy).
const spellingRules = canonical.flatMap(({ term, wrong, why }) =>
  wrong.map((bad) => ({ term, bad, why, re: new RegExp(`(?<![\\w-])${escapeRe(bad)}(?![\\w-])`) }))
);
for (const file of files) {
  const raw = readFileSync(file, "utf8");
  const text = learnerFacingText(raw);
  for (const { term, bad, why, re } of spellingRules) {
    if (re.test(text)) failures.push(`${relative(root, file)}: "${bad}" — use "${term}" (${why})`);
  }
  for (const label of stageLabels) {
    if (raw.includes(`label: "${label}"`)) {
      failures.push(`${relative(root, file)}: stage label "${label}" is retyped — import it from TRAIL_STAGE instead`);
    }
  }
}

// ---- 3. player containment (§13) ----
const playerPath = join(srcDir, "components", "LessonPlayer.tsx");
const player = readFileSync(playerPath, "utf8");
const forbidden = [...trailSrc.matchAll(/^  "([A-Za-z]+)",?$/gm)].map((m) => m[1]);
if (forbidden.length === 0) failures.push("trail.ts: PLAYER_FORBIDDEN_IMPORTS could not be parsed — containment would pass vacuously");
const playerImports = [...player.matchAll(/import\s+(?:\{([^}]*)\}|(\w+))\s+from/g)]
  .flatMap((m) => (m[1] ? m[1].split(",").map((x) => x.trim().split(/\s+as\s+/)[0].trim()) : [m[2]]))
  .filter(Boolean);
for (const banned of forbidden) {
  if (playerImports.includes(banned)) {
    failures.push(`LessonPlayer.tsx imports "${banned}" — §13 keeps the player math-dominant; theme belongs around it, not inside it`);
  }
}
notes.push(`player imports checked: ${playerImports.length}; forbidden set: ${forbidden.length}`);
notes.push(`canonical terms: ${canonical.length}; stage labels: ${stageLabels.length}; files scanned: ${files.length}`);

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ failures, notes, filesScanned: files.length }, null, 2));
} else {
  for (const n of notes) console.log(`trail-voice: ${n}`);
}

if (failures.length) {
  console.error(`\nverify:trail-voice FAILED with ${failures.length} issue${failures.length === 1 ? "" : "s"}:`);
  for (const f of failures) console.error(`- ${f}`);
  process.exit(1);
}
console.log("verify:trail-voice passed");
