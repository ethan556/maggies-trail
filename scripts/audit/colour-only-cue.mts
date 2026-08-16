/**
 * S242 / ACC-01 §5(f) — WHERE IS COLOUR THE ONLY CHANNEL, AND IS THAT EVEN THE RIGHT QUESTION?
 *
 * `ACC01_ACCESSIBILITY_MATRIX.md` §5(f) reports **55 SVG primitives** switching `fill`/`stroke`
 * between leaf and berry on a correctness condition with no second conditional channel, reaching
 * 678 authored instances (176 graded). It hand-checked 8 and got 5 true / 3 false.
 *
 * §6 then states the trap, and it governs this whole packet:
 *
 *   > Every colour-only correctness cue in §5(f) is THE SAME SET OF SITES ENG-01 classifies as
 *   > R2 — correctness signalled before commit — and asks to be REMOVED. The accessibility fix
 *   > (add a text or glyph channel) makes the answer leak LOUDER and puts it in the accessible
 *   > name. The pedagogy fix (gate on `tone === "info"`) makes the 1.4.1 problem VANISH, because
 *   > post-verdict the banner already states the outcome in words.
 *
 * So this audit does not look for "colour without a glyph". It looks for the two facts that decide
 * what to do with a site, and reports them together:
 *
 *   1. Is the colour derived from a CORRECTNESS condition — learner state compared against the
 *      step's target — or from a phenomenon the lesson is about?
 *   2. Is it inside a `tone === "info"` guard?
 *
 * A correctness-derived cue outside the guard is one defect wearing two hats: 1.4.1 Level A AND
 * ENG-01 R2. A phenomenon-derived cue is neither — colouring the region under a curve is not a
 * claim about the learner.
 *
 * THE VERDICT COLUMN IS A SUGGESTION, NOT A FINDING. §7 of the matrix records six of its eight
 * detectors returning mostly false positives; every row this prints is read by hand before
 * anything is changed, and the true-positive rate goes in the report.
 *
 * Run: npx tsx scripts/audit/colour-only-cue.mts
 */
import { readFileSync, writeFileSync, mkdirSync, globSync } from "node:fs";
import { join, relative } from "node:path";
import { execSync } from "node:child_process";

const ROOT = process.cwd();
const OUT = join(ROOT, "reports", "acc");
const seal = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();

/** The two palette poles the matrix names. A ternary between them is a verdict in colour. */
const VERDICT_COLOURS = /PALETTE\.(leaf|berry)\b/;
const COLOUR_PROP = /\b(fill|stroke|color|background)\s*=\s*\{/;
/* Words that name a comparison against the step's target rather than a property of the drawing.
 *
 * NO LEADING `\b`, DELIBERATELY. The first cut had one, and it missed `msHolds` — `quadDrag`'s
 * midsegment cue, which the matrix had already CONFIRMED by hand as a true positive — because a
 * word boundary does not exist inside camelCase. A detector that disagrees with the ground truth
 * it was written against is wrong, and it was caught only by checking the three line numbers §5(f)
 * names before trusting the count. Over-reporting is the safe direction here: every row is read. */
const CORRECTNESS = /(correct|accepted|holds?\b|hit\b|match(?:es|ed)?\b|target|reach(?:ed|es)?\b|solved|equals?\b|balanced|closes|passes?\b|valid)/i;

interface Row {
  file: string; line: number; component: string;
  colourProp: string; condition: string; correctness: boolean; toneGated: boolean;
}

const rows: Row[] = [];

for (const file of globSync("src/components/**/*.tsx")) {
  const src = readFileSync(file, "utf8");
  const lines = src.split("\n");
  /** The nearest enclosing `function XxxW(` above a line — good enough to name the engine. */
  const componentAt = (i: number) => {
    for (let j = i; j >= 0; j--) {
      const m = /^\s*(?:export\s+)?function\s+([A-Za-z0-9_]+)/.exec(lines[j]);
      if (m) return m[1];
    }
    return "(module)";
  };
  lines.forEach((line, i) => {
    if (!VERDICT_COLOURS.test(line) || !COLOUR_PROP.test(line)) return;
    if (!/\?/.test(line)) return; // a constant colour is not a cue
    const prop = COLOUR_PROP.exec(line)![1];
    /* The condition is whatever precedes the `?` in the ternary that chooses the colour. Printed
     * verbatim and truncated, because classifying it is a reading job and this only has to make
     * the reading possible. */
    const tern = /\{\s*([^?{}]{1,90}?)\s*\?/.exec(line.slice(line.indexOf(prop)));
    const condition = (tern?.[1] ?? line.trim()).replace(/[",\n]/g, " ").slice(0, 88);
    /* Tone gating is a property of the ENCLOSING BLOCK, not the line, so look back a little. A
     * generous window over-reports gating, which is the safe direction: a site wrongly called
     * gated will be read anyway, while one wrongly called ungated wastes a reading. */
    const window = lines.slice(Math.max(0, i - 14), i + 1).join(" ");
    rows.push({
      file: relative(ROOT, file), line: i + 1, component: componentAt(i),
      colourProp: prop, condition,
      correctness: CORRECTNESS.test(condition),
      toneGated: /tone\s*===\s*"info"/.test(window),
    });
  });
}

const act = rows.filter((r) => r.correctness && !r.toneGated);
mkdirSync(OUT, { recursive: true });
const csv = join(OUT, "ACC01_COLOUR_ONLY_CUE.csv");
writeFileSync(csv, [
  `# sourceSeal=${seal} — S242/ACC-01 §5(f). SVG colour chosen by a ternary between PALETTE.leaf/berry.`,
  "# correctness = the condition names a comparison against the step's target, not a phenomenon.",
  "# toneGated = a `tone === \"info\"` guard appears within 14 lines above. Every row is hand-read;",
  "# the verdict column is a suggestion and the true-positive rate is reported separately.",
  "file,line,component,colourProp,correctnessDerived,toneGated,condition",
  ...rows
    .sort((a, b) => Number(b.correctness) - Number(a.correctness) || Number(a.toneGated) - Number(b.toneGated) || a.line - b.line)
    .map((r) => [r.file, r.line, r.component, r.colourProp, r.correctness, r.toneGated, r.condition].join(","))
].join("\n") + "\n");

console.log(`colour-only-cue @ ${seal}`);
console.log(`  ${rows.length} verdict-coloured SVG props found`);
console.log(`    correctness-derived, NOT tone-gated  ${act.length}   ← the population to read`);
console.log(`    correctness-derived, tone-gated      ${rows.filter((r) => r.correctness && r.toneGated).length}`);
console.log(`    phenomenon-derived                   ${rows.filter((r) => !r.correctness).length}   (colouring a fact is not a claim about the learner)`);
console.log("\n── correctness-derived and ungated, by component ──");
const byComp = new Map<string, Row[]>();
for (const r of act) byComp.set(r.component, [...(byComp.get(r.component) ?? []), r]);
for (const [comp, rs] of [...byComp].sort((a, b) => b[1].length - a[1].length))
  console.log(`  ${comp} (${rs.length}): ${rs.map((r) => `${r.line}`).join(", ")}\n      e.g. ${rs[0].condition}`);
console.log(`\n  wrote ${relative(ROOT, csv)}`);
