/**
 * S242 / MPB-05 — BEFORE-AND-AFTER RENDER SWEEP FOR THE DERIVATIVE ISLAND.
 *
 * CLAUDE.md's standing instruction about adjacency work is that it "needs its own packet, its own
 * fixture set, and a full generated-render sweep before and after — not a fourth attempt at the end
 * of a long session." Three attempts at adjacency in this session tore `a4 = 3 * 4^(4-1)` into an
 * atom and an island, ate the space in front of a radical, and broke two fixtures. This is the
 * sweep, and it exists because the diff alone cannot tell a fix from a tear.
 *
 * It runs the CURRENT tokenizer and the one at git HEAD over every learner-visible string in the
 * corpus, authored and generated, and classifies every string whose islands moved:
 *
 *   · `gained-derivative` — the only intended class. The string acquired an island, and the island
 *     is Leibniz notation.
 *   · `changed-other`     — the islands moved for some other reason. Every row must be READ.
 *   · `lost-island`       — a string that used to typeset something and now typesets less.
 *   · `text-lost`         — the parts no longer concatenate to the source. Fatal: characters have
 *     been dropped from the learner's screen.
 *
 * The last two exit non-zero. `changed-other` is reported in full rather than capped, because a
 * capped list of things that need reading is a list that does not get read.
 *
 * Run: npx tsx scripts/audit/derivative-island-sweep.mts
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { join, relative } from "node:path";
import { execSync } from "node:child_process";
import { authoredMathParts } from "../../src/lib/math/authoredMath";
import { VARIANT_GENERATORS } from "../../src/lib/variants";
import { hashSeed, mulberry32 } from "../../src/lib/prng";
import type { Band } from "../../src/lib/difficulty";

const ROOT = process.cwd();
const OUT = join(ROOT, "reports", "math-presentation");

/* THE "BEFORE" IS COMPILED FROM GIT, NOT REMEMBERED. A sweep that compares the new tokenizer against
 * a description of the old one proves nothing about the old one. `authoredMath.ts` imports nothing,
 * so the HEAD copy can be written to a sibling path and imported directly — the sibling keeps its
 * relative specifier valid in case that ever stops being true. */
const BEFORE_PATH = join(ROOT, "src", "lib", "math", ".authoredMath.head.mts");
function loadBefore(): Promise<{ authoredMathParts: typeof authoredMathParts }> {
  writeFileSync(BEFORE_PATH, execSync("git show HEAD:src/lib/math/authoredMath.ts", { encoding: "utf8", maxBuffer: 1 << 26 }));
  return import(BEFORE_PATH);
}

const DERIVATIVE = /(?<![A-Za-z0-9])[d∂](?:[²³]|\^\{?[23]\}?)?(?:[A-Za-zθ](?![A-Za-z]))?\/[d∂][A-Za-zθ]/;

interface Row { source: string; owner: string; unit: string; field: string; surface: string; verdict: string; before: string; after: string; text: string }

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && entry.name.endsWith(".json")) out.push(full);
  }
  return out;
}

function widgetStrings(node: unknown, path: string, out: Array<{ path: string; text: string }> = []) {
  if (typeof node === "string") out.push({ path, text: node });
  else if (Array.isArray(node)) node.forEach((v, i) => widgetStrings(v, `${path}[${i}]`, out));
  else if (node && typeof node === "object")
    for (const [k, v] of Object.entries(node)) widgetStrings(v, path ? `${path}.${k}` : k, out);
  return out;
}

const rows: Row[] = [];
let examined = 0;

function classify(text: string, arithmetic: boolean, before: typeof authoredMathParts, meta: Omit<Row, "surface" | "verdict" | "before" | "after" | "text">) {
  if (!text.trim()) return;
  examined++;
  const island = (parts: ReturnType<typeof authoredMathParts>) => parts.filter((p) => p.tex).map((p) => p.source ?? "").join(" ⟂ ");
  const a = before(text, { includeArithmetic: arithmetic });
  const b = authoredMathParts(text, { includeArithmetic: arithmetic });
  const islandsBefore = island(a);
  const islandsAfter = island(b);
  if (islandsBefore === islandsAfter) return;

  // A part's `text` is the prose that FOLLOWS it, so source-or-text rebuilds the original exactly.
  const rebuilt = b.map((p) => (p.tex ? p.source ?? "" : "") + p.text).join("");
  const verdict =
    rebuilt !== text ? "text-lost"
    : islandsAfter.length < islandsBefore.length && !DERIVATIVE.test(islandsAfter) ? "lost-island"
    : DERIVATIVE.test(islandsAfter) ? "gained-derivative"
    : "changed-other";
  rows.push({ ...meta, surface: arithmetic ? "arithmetic-on" : "arithmetic-off", verdict, before: islandsBefore, after: islandsAfter, text });
}

const before = (await loadBefore()).authoredMathParts;

for (const file of walk(join(ROOT, "content"))) {
  let json: any;
  try { json = JSON.parse(readFileSync(file, "utf8")); } catch { continue; }
  const lesson = json.lesson ?? json;
  if (!lesson?.id || !Array.isArray(lesson.steps)) continue;
  for (const [i, step] of lesson.steps.entries()) {
    const unit = String(step.id ?? i);
    const meta = { source: "authored", owner: String(lesson.id), unit };
    // The surface a string renders on is a property of the CALL SITE: LessonPlayer renders body,
    // hints and step feedback with arithmetic ON; widgets.tsx renders spec strings with it OFF.
    for (const field of ["body", "feedback", "successFeedback", "explanation"])
      if (typeof step[field] === "string") classify(step[field], true, before, { ...meta, field });
    for (const [h, hint] of (step.hints ?? []).entries())
      if (typeof hint === "string") classify(hint, true, before, { ...meta, field: `hints[${h}]` });
    if (step.predict && typeof step.predict === "object")
      for (const { path, text } of widgetStrings(step.predict, "predict"))
        classify(text, true, before, { ...meta, field: path });
    for (const { path, text } of widgetStrings(step.widget, "widget"))
      classify(text, false, before, { ...meta, field: path });
  }
}

for (const generator of VARIANT_GENERATORS) {
  const forms: readonly string[] = (generator as any).forms ?? ["default"];
  for (const form of forms) {
    for (const band of ["support", "core", "stretch"] as Band[]) {
      for (let index = 0; index < 3; index++) {
        const seed = `${generator.tag}|${form}|${band}|${index}`;
        let widget: unknown;
        try { widget = (generator as any).gen(mulberry32(hashSeed(seed)), band, form)?.widget; } catch { continue; }
        if (!widget) continue;
        for (const { path, text } of widgetStrings(widget, "widget"))
          classify(text, false, before, { source: "generated", owner: generator.tag, unit: `${form}:${band}`, field: path });
      }
    }
  }
}

const counts = rows.reduce<Record<string, number>>((acc, r) => ({ ...acc, [r.verdict]: (acc[r.verdict] ?? 0) + 1 }), {});
mkdirSync(OUT, { recursive: true });
const csv = join(OUT, "MATH_DERIVATIVE_ISLAND_SWEEP.csv");
writeFileSync(csv, [
  "# S242 / MPB-05 before-and-after sweep. Generated by scripts/audit/derivative-island-sweep.mts",
  "# `before`/`after` list the island SOURCES separated by U+22C2; a string is listed only if they differ.",
  "source,owner,unit,field,surface,verdict,before,after,text",
  ...rows.map((r) => [r.source, r.owner, r.unit, r.field, r.surface, r.verdict, r.before, r.after, r.text]
    .map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
].join("\n") + "\n");

console.log(`derivative-island-sweep: ${examined.toLocaleString()} learner-visible strings, ${rows.length} changed`);
for (const [verdict, n] of Object.entries(counts).sort((a, b) => b[1] - a[1])) console.log(`  ${verdict.padEnd(18)} ${n}`);
console.log(`  wrote ${relative(ROOT, csv)}`);

// Everything that is not the intended class is printed IN FULL. A capped list of rows that need a
// human read is a list that does not get read — the same failure this program has already corrected
// three times in its own detectors.
for (const verdict of ["text-lost", "lost-island", "changed-other"]) {
  const bad = rows.filter((r) => r.verdict === verdict);
  if (!bad.length) continue;
  console.log(`\n── ${verdict} (${bad.length}) ──`);
  for (const r of bad) console.log(`  ${r.owner}#${r.unit} ${r.field}\n    before: ${r.before}\n    after:  ${r.after}\n    text:   ${r.text.slice(0, 160)}`);
}

if (counts["text-lost"] || counts["lost-island"]) process.exit(1);
