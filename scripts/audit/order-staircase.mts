/**
 * S242 / ENG-01 R4 — WHEN THE PICTURE SORTS THE LIST FOR YOU.
 *
 * `DragOrderW` (`widgets.tsx:15176`) checks whether every item's LABEL parses as a number and, if
 * it does, plots the learner's current arrangement on a shared vertical axis — value against
 * position, joined by a polyline. The comment calls it "Live consequence (s48)".
 *
 * For an ordering task whose criterion IS the plotted value, that consequence is the answer. A
 * correct arrangement is a monotone staircase and any error is a visible zigzag, so the learner
 * drags until the line stops bending. `parseOrderVal` parses integers, decimals AND fractions
 * `a/b`, which makes "put these fractions in order" — the item that exists precisely because
 * comparing fractions is hard — the sharpest case in the corpus. The plot is NOT gated on
 * `tone === "info"`; the sibling reveal three lines below it (`do-ghost`) is.
 *
 * ── What this measures, and why the split matters ───────────────────────────────────────────────
 * ENG-01 §3.5 counted the all-numeric instances (54 of 93) and stopped there. But being numeric is
 * not the same as being ordered BY the number, and the difference is two different defects:
 *
 *   · `oracle`      — the authored `correctOrder` is monotone in the plotted value. The staircase
 *                     IS the answer. This is the R4 claim, measured.
 *   · `misleading`  — labels parse as numbers but the correct order is NOT monotone in them (order
 *                     by number of factors, by denominator, by anything else). Here the plot is not
 *                     an oracle: it draws a ZIGZAG for the right answer and a clean line for a
 *                     wrong one, which is worse. Nobody has looked for this.
 *   · `text`        — labels are not all numeric, so the chain readout renders instead. Clean.
 *
 * Graded instances are ranked first throughout: an `interactive` step emits no mastery evidence
 * (`playerStore.ts:148-153`), so a leak there wastes the learning without forging anything.
 *
 * Run: npx tsx scripts/audit/order-staircase.mts
 */
import { readFileSync, writeFileSync, mkdirSync, globSync } from "node:fs";
import { join, relative } from "node:path";
import { execSync } from "node:child_process";

const ROOT = process.cwd();
const OUT = join(ROOT, "reports", "eng");
const seal = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();

/** Copied deliberately from `widgets.tsx:15561` rather than imported: this audit must agree with
 * what the WIDGET parses, and a shared helper that later changed on one side would hide the leak
 * instead of reporting it. Any divergence here is itself a finding. */
function parseOrderVal(label: string): number | null {
  const s = label.trim().replace(/−/g, "-");
  if (/^-?\d[\d,]*(?:\.\d+)?$/.test(s)) return Number(s.replace(/,/g, ""));
  const m = /^(-?\d+)\s*\/\s*(\d+)$/.exec(s);
  if (m && Number(m[2]) !== 0) return Number(m[1]) / Number(m[2]);
  return null;
}

interface Row {
  lesson: string; step: string; kind: string; verdict: string;
  items: number; direction: string; prompt: string; values: string;
}

const rows: Row[] = [];

for (const file of globSync("content/courses/*/lessons/*.json")) {
  const lesson = JSON.parse(readFileSync(file, "utf8")) as { steps?: Array<Record<string, unknown>> };
  for (const step of lesson.steps ?? []) {
    const w = step.widget as
      | { type?: string; prompt?: string; items?: Array<{ id: string; label: string }>; correctOrder?: string[] }
      | undefined;
    if (!w || w.type !== "dragOrder" || !Array.isArray(w.items) || !Array.isArray(w.correctOrder)) continue;
    const byId = new Map(w.items.map((i) => [i.id, i.label]));
    const vals = w.correctOrder.map((id) => parseOrderVal(byId.get(id) ?? ""));
    const allNumeric = w.items.every((i) => parseOrderVal(i.label) !== null);
    let verdict = "text";
    let direction = "-";
    if (allNumeric && vals.every((v) => v !== null)) {
      const v = vals as number[];
      const up = v.every((x, i) => i === 0 || x >= v[i - 1]);
      const down = v.every((x, i) => i === 0 || x <= v[i - 1]);
      verdict = up || down ? "oracle" : "misleading";
      direction = up && down ? "flat" : up ? "ascending" : down ? "descending" : "neither";
    }
    rows.push({
      lesson: file.split("/").pop()!.replace(".json", ""),
      step: String(step.id), kind: String(step.kind ?? "?"), verdict,
      items: w.items.length, direction,
      prompt: String(w.prompt ?? "").replace(/[",\n]/g, " ").slice(0, 90),
      values: (vals as Array<number | null>).map((x) => (x === null ? "?" : x)).join(" "),
    });
  }
}

const graded = (r: Row) => r.kind === "check" || r.kind === "challenge";
const by = (v: string) => rows.filter((r) => r.verdict === v);

mkdirSync(OUT, { recursive: true });
const csv = join(OUT, "ENG01_R4_ORDER_STAIRCASE.csv");
writeFileSync(csv, [
  `# sourceSeal=${seal} — S242/ENG-01 R4. dragOrder plots numeric labels by value during active work.`,
  "# oracle = correctOrder is monotone in the plotted value, so the staircase IS the answer.",
  "# misleading = labels parse as numbers but the correct order is not monotone in them: the plot",
  "# draws a zigzag for the RIGHT answer. text = not all labels numeric, so no plot renders.",
  "lesson,step,kind,verdict,items,direction,correctOrderValues,prompt",
  ...rows
    .sort((a, b) => Number(graded(b)) - Number(graded(a)) || (a.verdict < b.verdict ? -1 : a.verdict > b.verdict ? 1 : 0))
    .map((r) => [r.lesson, r.step, r.kind, r.verdict, r.items, r.direction, r.values, r.prompt].join(","))
].join("\n") + "\n");

console.log(`order-staircase @ ${seal}`);
console.log(`  ${rows.length} authored dragOrder instances`);
for (const v of ["oracle", "misleading", "text"]) {
  const rs = by(v);
  console.log(`    ${v.padEnd(11)} ${String(rs.length).padStart(3)}   (${rs.filter(graded).length} graded, ${rs.filter((r) => r.kind === "interactive").length} interactive)`);
}
console.log("\n── misleading: the plot draws a ZIGZAG for the correct answer ──");
for (const r of by("misleading")) console.log(`  ${r.lesson}#${r.step} (${r.kind}) [${r.values}]\n      ${r.prompt}`);
console.log("\n── oracle, graded first ──");
for (const r of by("oracle").sort((a, b) => Number(graded(b)) - Number(graded(a))).slice(0, 12))
  console.log(`  ${r.lesson}#${r.step} (${r.kind}) ${r.direction} [${r.values}]\n      ${r.prompt}`);
console.log(`\n  wrote ${relative(ROOT, csv)}`);
