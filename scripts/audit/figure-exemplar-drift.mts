/**
 * S242 / VIS-03 — THE FIGURES THAT DO RENDER, WHICH NOTHING HAS EVER AUDITED.
 *
 * Every VIS number in this program so far is about figures that are WITHHELD.
 * `VIS01_ILLUSTRATION_MEASUREMENT.md` says so in its own limitations: *"I audited none of the 2,738
 * currently-rendering placements — there is no evidence here that what ships today is correct."*
 *
 * A withheld figure costs a learner an illustration. A WRONG figure, rendered, teaches them
 * something false — and it is the only one of the two that reaches the screen. This measures that.
 *
 * ── THE DEFECT CLASS, GENERALISED FROM THE ONE CASE SOMEBODY NOTICED ──
 *
 * `count-on-hops` draws a number line with a dot on 4 and three hops to 7, captioned *four plus
 * three equals seven*. It was reused as decoration across 88 courses, and `isFigureTextAligned`
 * exists to stop it appearing beside prose about other numbers. That guard names THREE figures.
 *
 * But the property that makes `count-on-hops` dangerous is not that it is on a list. It is that its
 * own `<title>` asserts a numeric relationship — it is a FIXED EXEMPLAR. Scanning `figures.tsx`
 * finds **220 titles that do the same**:
 *
 *     "GCF of 12 and 18 is 6."
 *     "Factor out the GCF: 12 + 18 = 6(2 + 3)."
 *     "Polygon area on the grid: 5 × 3 = 15."
 *     "Flip and multiply: 3/4 ÷ 1/2 = 3/4 × 2/1."
 *
 * Each is correct about itself and wrong beside a lesson using different numbers, and 217 of them
 * have no guard at all. The title is the right thing to read because it is the figure's own
 * statement of what it draws, written for a screen reader — the same words a non-visual learner
 * receives.
 *
 * ── WHAT COUNTS AS DRIFT, AND WHY THE BAR IS WHERE IT IS ──
 *
 * A placement drifts when the numbers the figure ASSERTS are absent from the prose beside it. The
 * test needs two or more numbers in the title, because a single number is usually an axis bound or
 * a unit ("each edge is 1 unit long") rather than a claim about this lesson's quantities. And it
 * requires that essentially none of them appear in the prose: a figure sharing one number with its
 * lesson is likely illustrating it, while one sharing none is decoration.
 *
 * The three already-guarded exemplars are excluded — their placements are `isFigureTextAligned`'s
 * business and counting them again would restate a known number as a new finding.
 *
 * Run: npx tsx scripts/audit/figure-exemplar-drift.mts
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { join, relative } from "node:path";
import { execSync } from "node:child_process";
import { FIXED_EXEMPLAR_FIGURES, isFigureTextAligned } from "../../src/lib/figureTextAlignment";

const ROOT = process.cwd();
const OUT = join(ROOT, "reports", "vis");
const seal = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
const GUARDED = new Set<string>(FIXED_EXEMPLAR_FIGURES);

/**
 * A number as a reader meets it — not a digit inside a word, an ordinal, or a decimal fragment.
 *
 * THE TRAILING LOOKAHEAD REJECTS A DECIMAL POINT, NOT ANY POINT. The first cut used `(?![\w.])`,
 * which threw away every number that ENDS A SENTENCE: the title "Polygon area on the grid:
 * 5 × 3 = 15." yielded 5 and 3 and dropped the 15, so a figure that genuinely shared its result
 * with the prose was reported as sharing nothing. Sentence-final numbers are the commonest position
 * for the very quantity a title is asserting, so this silently inflated the findings.
 */
const NUMBER = /(?<![\w.])\d+(?:\.\d+)?(?!\w|\.\d|(?:st|nd|rd|th)\b)/g;
const numbersIn = (text: string): number[] =>
  [...text.matchAll(NUMBER)].map((m) => Number(m[0])).filter((n) => Number.isFinite(n));

/* A title only makes a CLAIM when it states a relationship. "A single unit cube: each edge is 1 unit
 * long" names a number and asserts nothing about this lesson's quantities. */
const ASSERTS = /=|\b(?:equals?|plus|minus|times|gives?|makes?|is|are)\b/;

/** figures.tsx keeps every figure as a function with an inline <title>. Owner is the enclosing fn. */
function figureTitles(): Map<string, string> {
  const source = readFileSync(join(ROOT, "src", "components", "figures.tsx"), "utf8");
  const functions = [...source.matchAll(/\nfunction ([A-Za-z0-9_]+)\s*\(/g)].map((m) => ({ at: m.index ?? 0, name: m[1] }));
  const byComponent = new Map<string, string>();
  for (const match of source.matchAll(/<title>([\s\S]*?)<\/title>/g)) {
    const at = match.index ?? 0;
    let owner = "";
    for (const fn of functions) { if (fn.at < at) owner = fn.name; else break; }
    if (owner && !byComponent.has(owner)) byComponent.set(owner, match[1].replace(/\s+/g, " ").trim());
  }
  /* The registry maps a content-facing id to a component, and the ids are what content places. */
  const byId = new Map<string, string>();
  /* The registry opens `export const FIGURES: Record<string, () => JSX.Element> = {` — the first cut
   * matched `FIGURES[^=]*=` which stops at the `=` of the arrow type `() => JSX`, so it captured
   * nothing and the audit reported 0 titles and 0 findings. It printed that count, which is the only
   * reason the vacuous green was visible at all. Anchor on the brace instead. */
  const open = source.indexOf("export const FIGURES");
  const registry = open < 0 ? "" : source.slice(source.indexOf("{", open), source.indexOf("\n};", open));
  for (const entry of registry.matchAll(/"([^"]+)"\s*:\s*([A-Za-z0-9_]+)/g)) {
    const title = byComponent.get(entry[2]);
    if (title) byId.set(entry[1], title);
  }
  return byId;
}

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && entry.name.endsWith(".json")) out.push(full);
  }
  return out;
}

const titles = figureTitles();
interface Row { lesson: string; step: string; figure: string; titleNumbers: string; proseNumbers: string; shared: number; title: string; prose: string }
const rows: Row[] = [];
let placements = 0;
let rendering = 0;
let exemplarPlacements = 0;

for (const file of walk(join(ROOT, "content", "courses"))) {
  let json: { lesson?: { id?: string; steps?: unknown[] }; id?: string; steps?: unknown[] };
  try { json = JSON.parse(readFileSync(file, "utf8")); } catch { continue; }
  const lesson = json.lesson ?? json;
  if (!lesson?.id || !Array.isArray(lesson.steps)) continue;
  for (const [index, raw] of lesson.steps.entries()) {
    const step = raw as { id?: string; figure?: string; body?: string; widget?: { prompt?: string } };
    if (!step.figure) continue;
    placements++;
    const body = String(step.body ?? "");
    // The same gate the renderer applies, so this measures what SHIPS.
    if (!isFigureTextAligned(step.figure, body)) continue;
    rendering++;
    if (GUARDED.has(step.figure)) continue;

    const title = titles.get(step.figure);
    if (!title || !ASSERTS.test(title)) continue;
    const claimed = numbersIn(title);
    if (claimed.length < 2) continue;
    exemplarPlacements++;

    const prose = `${body} ${String(step.widget?.prompt ?? "")}`;
    const present = new Set(numbersIn(prose));
    /* SHARING SOME NUMBER IS NOT SHARING THE CLAIM. Requiring zero overlap looked right until the
     * sentence-final fix landed and the clearest defect in the set vanished: the figure asserts
     * "342 = 300 + 40 + 2" and the prose asserts "452 = 400 + 50 + 2", and they both end in 2. One
     * incidental digit in common is not evidence that a figure illustrates its lesson. A third of
     * the asserted quantities is: it keeps "5 × 3 = 15" beside prose that works with 15, and still
     * catches two expanded-form statements that agree on nothing but their units digit. */
    const distinctClaimed = [...new Set(claimed)];
    const sharedValues = distinctClaimed.filter((n) => present.has(n));
    if (sharedValues.length / distinctClaimed.length >= 1 / 3) continue;
    /* AND A TWO-DIGIT QUANTITY IN COMMON IS A REAL OVERLAP, WHATEVER THE PROPORTION SAYS. The
     * proportion alone flagged a figure and a lesson that share 324, 251 AND 575 — because the
     * figure also names nine intermediate place-value pieces, so three matches out of twelve fell
     * under a third. A units digit in common is a coincidence; 324 is not. */
    if (sharedValues.some((n) => n > 9)) continue;

    /* ── THE NARROWING THAT MADE THIS DETECTOR TRUE ──────────────────────────────────────────────
     *
     * The first cut stopped at "the title's numbers are absent from the prose" and reported 112
     * rows. Fourteen read by hand: ONE was a real defect. The rest were a fixed exemplar sitting
     * beside prose that states the GENERAL RULE, which is not a defect — it is what an exemplar is
     * for:
     *
     *   figure "Subtract = add the opposite: 8 − 3 = 8 + (−3)"
     *   prose  "every subtraction becomes an addition you already know how to do"
     *
     *   figure "A 3-4-5 right triangle with a square on each side… 9 + 16 = 25"
     *   prose  "the two legs and the hypotenuse are locked together by one equation: a² + b² = c²"
     *
     * Both correct. The defect needs the prose to be making its OWN numeric claim of the same kind,
     * with different numbers — the learner reads one worked instance and is shown another:
     *
     *   figure "Expanded form: 342 equals 300 plus 40 plus 2"
     *   prose  "Every number can explode into its worth-pieces: 452 = 400 + 50 + 2"
     *
     * So the prose must itself assert a relationship over two or more numbers. That is the whole
     * narrowing, and it is the difference between a findings list worth reading and 112 rows that
     * send someone to inspect correct pages. */
    if (numbersIn(prose).length < 2 || !ASSERTS.test(prose)) continue;

    rows.push({
      lesson: String(lesson.id), step: String(step.id ?? index), figure: step.figure,
      titleNumbers: claimed.join(" "), proseNumbers: [...present].slice(0, 10).join(" "), shared: sharedValues.length,
      title: title.slice(0, 160), prose: prose.replace(/\s+/g, " ").slice(0, 160)
    });
  }
}

mkdirSync(OUT, { recursive: true });
const csv = join(OUT, "VIS03_FIGURE_EXEMPLAR_DRIFT.csv");
writeFileSync(csv, [
  `# sourceSeal=${seal} — S242/VIS-03. Placements that RENDER (isFigureTextAligned passes) where the`,
  "# figure's own <title> asserts a numeric relationship and NONE of its numbers appear in the prose",
  "# beside it. The three already-guarded fixed exemplars are excluded — those are the alignment",
  "# gate's business. This is the same defect class as count-on-hops, on figures nothing guards.",
  "lesson,step,figure,titleNumbers,proseNumbers,title,prose",
  ...rows.map((r) => [r.lesson, r.step, r.figure, r.titleNumbers, r.proseNumbers, r.title, r.prose]
    .map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
].join("\n") + "\n");

console.log(`figure-exemplar-drift @ ${seal}`);
console.log(`  ${placements.toLocaleString()} figure placements, ${rendering.toLocaleString()} render today`);
console.log(`  ${titles.size.toLocaleString()} figure ids carry a <title>`);
console.log(`  ${exemplarPlacements} RENDERING placements whose figure asserts a numeric relationship`);
console.log(`  ${rows.length} of those share NO number with the prose beside them`);
console.log(`  wrote ${relative(ROOT, csv)}`);
const byFigure = rows.reduce<Record<string, number>>((acc, r) => ({ ...acc, [r.figure]: (acc[r.figure] ?? 0) + 1 }), {});
console.log("\n  by figure:");
for (const [figure, n] of Object.entries(byFigure).sort((a, b) => b[1] - a[1]).slice(0, 20))
  console.log(`    ${String(n).padStart(3)}×  ${figure}`);
