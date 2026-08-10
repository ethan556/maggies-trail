#!/usr/bin/env node
// PROTOCOL v3 — tool-call-sized test groups.
//
// PROBLEM. The full suite is ~621s on this 1-core / 4GB box. That exceeds a single tool call, so
// it had to run as a background job — and background jobs do not survive a turn boundary here.
// Every interrupted turn killed the run and lost ~10 minutes. Polling for it burned turns and
// still frequently ended with no result.
//
// FIX. Split the suite into three groups that are each small enough to finish INSIDE one tool
// call, so the suite never needs a background job at all. The groups are semantic, not arbitrary
// --shard slices, so a failure tells you what kind of thing broke:
//
//   content  (~60s, 39 files)  — every test that reads the corpus off disk. This is the set that
//                                can regress from adding lessons. Empirically it caught 100% of
//                                the content defects in S191 (variants.resolver, variants.surface,
//                                optionOrder, and the session test).
//   sweep    (~287s, 1 file)   — src/lib/variants.test.ts, the 400-seed generator sweep. Pure
//                                function of generator SOURCE; never reads content/. Gate it with
//                                generator-guard.mjs: if the sources are byte-identical, its
//                                verdict is already known and re-running is 287s of rederivation.
//   rest     (~275s)           — everything else: components, server, libs. Includes the 17
//                                better-sqlite3 files that fail as a known sandbox baseline
//                                (native modules cannot build here).
//
// content ∪ sweep ∪ rest == every test file, verified by `verify` below. Running all three is
// exactly a full-suite run, just in pieces that survive this environment.
//
// Memory: forced single-fork with a bounded heap. On 1 core there is no parallelism to lose, and
// an unbounded default pool is what puts a 4GB box at OOM risk.
//
// Usage:
//   node scripts/session/test-groups.mjs list content|sweep|rest
//   node scripts/session/test-groups.mjs verify          # prove the 3 groups tile the suite
import { readdirSync, statSync, readFileSync } from "node:fs";
import { join, resolve, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const SWEEP = ["src/lib/variants.test.ts"];

function allTestFiles(dir = join(root, "src"), acc = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) allTestFiles(p, acc);
    else if (/\.test\.(ts|tsx)$/.test(e)) acc.push(relative(root, p).replace(/\\/g, "/"));
  }
  return acc.sort();
}

// A test is content-coupled if it reads the filesystem AND names the content corpus. Both halves
// matter: several files reach the corpus via join(process.cwd(), "content", "courses"), which a
// naive grep for the literal "content/courses" misses entirely.
function isContentCoupled(rel) {
  const s = readFileSync(join(root, rel), "utf8");
  return /readdirSync|readFileSync/.test(s) && /"content"|content\/courses|content\/daily/.test(s);
}

const files = allTestFiles();
const sweep = files.filter((f) => SWEEP.includes(f));
const content = files.filter((f) => !SWEEP.includes(f) && isContentCoupled(f));
const rest = files.filter((f) => !SWEEP.includes(f) && !content.includes(f));

// `rest` outgrew a single tool call once Batch B landed (237s -> >290s), so it is halved.
// Deterministic split on the sorted list keeps the halves stable across runs.
const half = Math.ceil(rest.length / 2);
const restA = rest.slice(0, half);
const restB = rest.slice(half);

const cmd = process.argv[2] ?? "verify";
if (cmd === "list") {
  const g = process.argv[3];
  const map = { content, sweep, rest, "rest-a": restA, "rest-b": restB };
  if (!(g in map)) { console.error("group must be one of: content sweep rest rest-a rest-b"); process.exit(1); }
  console.log(map[g].join(" "));
  process.exit(0);
}
if (cmd === "chunk") {
  // PROTOCOL v4 fix, live-diagnosed in session 192-193: a single 196-file `rest` run in one
  // --maxWorkers=1 process died silently mid-stream -- no error, no summary, no exit marker. That
  // is the signature of the process being killed (most likely OOM) rather than crashing on its
  // own. --maxWorkers=1 avoids the OOM risk of PARALLEL processes, but trades it for another one:
  // one long-lived process running ~200 sequential jsdom/React-mounting files can accumulate
  // native memory (jsdom instances, retained DOM trees) that --max-old-space-size does NOT bound,
  // since that flag caps only the V8 heap, not overall process RSS.
  // Fix: split into N small chunks, each its OWN fresh process. Every chunk starts, runs, and
  // exits cleanly, releasing all memory before the next chunk begins, so nothing accumulates past
  // one chunk's footprint. Each chunk finishes fast enough to run as a foreground, blocking
  // command inside ONE tool call -- no background job, so nothing to poll and nothing to lose.
  const g = process.argv[3];
  const n = Number(process.argv[4] ?? 6);
  const i = Number(process.argv[5]);
  const map = { content, sweep, rest };
  if (!(g in map)) { console.error("group must be one of: content sweep rest"); process.exit(1); }
  if (!Number.isInteger(n) || n < 1) { console.error("chunk count must be a positive integer"); process.exit(1); }
  if (!Number.isInteger(i) || i < 0 || i >= n) { console.error(`chunk index must be 0..${n - 1}`); process.exit(1); }
  const list = map[g];
  const size = Math.ceil(list.length / n);
  console.log(list.slice(i * size, (i + 1) * size).join(" "));
  process.exit(0);
}
if (cmd === "verify") {
  const union = new Set([...content, ...sweep, ...rest]);
  const missing = files.filter((f) => !union.has(f));
  const overlap = content.filter((f) => sweep.includes(f) || rest.includes(f));
  if (missing.length || overlap.length || union.size !== files.length) {
    console.error("test-groups: groups do NOT tile the suite");
    for (const f of missing) console.error(`  uncovered: ${f}`);
    for (const f of overlap) console.error(`  overlap:   ${f}`);
    process.exit(1);
  }
  // rest-a + rest-b must reconstitute rest exactly, or the halves would drop files silently.
  const halves = [...restA, ...restB];
  if (halves.length !== rest.length || halves.some((f, i) => f !== rest[i])) {
    console.error("test-groups: rest-a + rest-b do NOT reconstitute rest");
    process.exit(1);
  }
  console.log(`test-groups: ${files.length} test files tile exactly `
    + `-> content ${content.length} | sweep ${sweep.length} | rest ${rest.length} `
    + `(rest-a ${restA.length} + rest-b ${restB.length})`);
  process.exit(0);
}
console.error("usage: test-groups.mjs list <group> | verify");
process.exit(1);
