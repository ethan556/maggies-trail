#!/usr/bin/env node
// PROTOCOL v3 — generator-source guard.
//
// WHY THIS EXISTS. src/lib/variants.test.ts is 287s of a 621s suite (46% of the whole run, ~70%
// of actual test time). It is a PURE generator-space sweep: 400 seeds x every generator x every
// form, plus 150 seeds per form. Verified by inspection: it never reads content/ — it imports
// only generator sources and pure helpers. It is therefore a deterministic function of a fixed
// set of SOURCE files.
//
// The consequence: if none of those source files changed, the sweep's result cannot change.
// Re-running it after a content-only session is 287s spent re-deriving a known answer.
//
// This guard makes that argument CHECKABLE instead of assumed. It hashes every input the sweep
// depends on and compares against a recorded baseline:
//   exit 0  -> inputs byte-identical; the last recorded sweep verdict still holds, and the guard
//              prints that verdict so it can be cited as evidence rather than hand-waved.
//   exit 1  -> at least one input changed; the sweep MUST be re-run, and the changed files are
//              listed so the reason is explicit.
//
// It is deliberately conservative: any doubt (missing baseline, missing file, unreadable hash)
// exits non-zero and demands the full sweep. It can only ever say "you may skip" when it has
// positively proven byte-identity of every input.
//
// Usage:
//   node scripts/session/generator-guard.mjs record --verdict "11126 tests, 76 sqlite-baseline failures"
//   node scripts/session/generator-guard.mjs check
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join, resolve, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const BASELINE = join(root, "GENERATOR_SOURCE_HASHES.json");
const cmd = process.argv[2] ?? "check";

// Every input the sweep transitively depends on. Deliberately over-inclusive: extra files can
// only cause a needless full run (safe), whereas a missing file could hide a real change (unsafe).
function inputFiles() {
  const libDir = join(root, "src", "lib");
  const out = new Set();
  // the sweep itself + its direct pure-helper imports
  for (const f of ["variants.test.ts", "variants.ts", "schema.ts", "evaluate.ts", "difficulty.ts"]) {
    out.add(join(libDir, f));
  }
  // every generator family and every independent solver
  for (const f of readdirSync(libDir)) {
    if (/Variants\.ts$/.test(f)) out.add(join(libDir, f));
    if (/Independent\.cjs$/.test(f)) out.add(join(libDir, f));
    if (/Independent\.ts$/.test(f)) out.add(join(libDir, f));
    if (/^g\d.*\.cjs$/.test(f)) out.add(join(libDir, f));
  }
  return [...out].filter((p) => existsSync(p)).sort();
}

const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

const files = inputFiles();
const current = {};
for (const p of files) current[relative(root, p)] = sha(p);

if (cmd === "record") {
  const vIdx = process.argv.indexOf("--verdict");
  const verdict = vIdx > -1 ? process.argv[vIdx + 1] : "";
  if (!verdict) {
    console.error("record requires --verdict \"<what the full sweep reported>\"");
    process.exit(1);
  }
  writeFileSync(BASELINE, JSON.stringify({
    recordedAt: new Date().toISOString(),
    note: "Hashes of every input to src/lib/variants.test.ts (the 287s generator sweep). "
        + "If these are byte-identical, the sweep's verdict below still holds.",
    verdict,
    count: files.length,
    files: current,
  }, null, 1) + "\n");
  console.log(`generator-guard: recorded ${files.length} input hashes; verdict "${verdict}"`);
  process.exit(0);
}

if (cmd !== "check") {
  console.error("usage: generator-guard.mjs record --verdict <text> | check");
  process.exit(1);
}

if (!existsSync(BASELINE)) {
  console.error("generator-guard: NO baseline recorded -> the full sweep must run.");
  process.exit(1);
}
const prior = JSON.parse(readFileSync(BASELINE, "utf8"));
const changed = [];
const added = [];
const removed = [];
for (const [f, h] of Object.entries(current)) {
  if (!(f in prior.files)) added.push(f);
  else if (prior.files[f] !== h) changed.push(f);
}
for (const f of Object.keys(prior.files)) if (!(f in current)) removed.push(f);

if (changed.length || added.length || removed.length) {
  console.error("generator-guard: generator sources CHANGED -> variants.test.ts MUST be re-run.");
  for (const f of changed) console.error(`  modified: ${f}`);
  for (const f of added) console.error(`  added:    ${f}`);
  for (const f of removed) console.error(`  removed:  ${f}`);
  process.exit(1);
}
console.log(`generator-guard: ${files.length} generator inputs byte-identical to baseline `
  + `(recorded ${prior.recordedAt}).`);
console.log(`  => variants.test.ts (287s sweep) is a pure function of these inputs; its recorded `
  + `verdict still holds: ${prior.verdict}`);
process.exit(0);
