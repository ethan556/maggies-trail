/**
 * S242 / VIS-04 — THE FIGURE DRIFT WITH NO NUMBERS TO CATCH IT.
 *
 * `VIS03_RENDERING_FIGURE_DRIFT.md` states its own blind spot: *"Only numeric drift is measured. A
 * figure that draws the wrong shape, orientation or structure for its lesson carries no number and
 * is invisible here."* 1,493 of 1,835 titled figures assert nothing numeric at all, and every one of
 * their placements is unexamined by anything in this program.
 *
 * A figure of a cylinder beside a lesson about fractions is exactly as wrong as `342` beside `452`,
 * and nothing would notice.
 *
 * ── THE MEASURE IS SHARED SUBJECT VOCABULARY, AND IT IS DELIBERATELY CRUDE ──
 *
 * A figure's `<title>` names what it draws — "Three angle families: acute…", "A balance scale
 * showing…". A lesson's prose names what it is about. If the two share NO subject vocabulary at all,
 * the figure is very likely decoration rather than illustration.
 *
 * Crude on purpose. A cleverer measure (embeddings, a topic model) would be less checkable and would
 * fail differently on every course. Content-word overlap is something a reader can verify by eye in
 * one glance, which is what a findings list needs — and this program has thrown away four detectors
 * this session that were cleverer than they were right.
 *
 * ── WHAT IS EXCLUDED, AND WHY ──
 *
 * · Figures whose title asserts a numeric relationship. VIS-03 owns those; counting them again
 *   would restate a known number as a new finding.
 * · The three guarded fixed exemplars, for the same reason.
 * · Placements that do not render — VIS-01 owns those, and a withheld figure teaches nobody
 *   anything wrong.
 * · Mathematical vocabulary common to everything ("number", "line", "value", "show") is stopped, or
 *   every geometry figure would "match" every geometry lesson and the measure would be vacuous.
 *
 * Run: npx tsx scripts/audit/figure-topic-drift.mts
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { join, relative } from "node:path";
import { execSync } from "node:child_process";
import { FIXED_EXEMPLAR_FIGURES, isFigureTextAligned } from "../../src/lib/figureTextAlignment";

const ROOT = process.cwd();
const OUT = join(ROOT, "reports", "vis");
const seal = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
const GUARDED = new Set<string>(FIXED_EXEMPLAR_FIGURES);
const ASSERTS = /=|\b(?:equals?|plus|minus|times|gives?|makes?)\b/;

/**
 * Words too common in this corpus to carry subject meaning.
 *
 * Everything here was added because leaving it in made the measure vacuous, not because it felt
 * generic: "number", "line" and "point" appear in a majority of both titles and lessons, so any
 * figure would share vocabulary with any lesson and the audit would report nothing.
 */
const STOP = new Set([
  "a","an","the","and","or","but","of","to","in","on","at","by","for","with","from","as","is","are",
  "was","were","be","been","it","its","this","that","these","those","each","every","both","all","one",
  "two","three","four","five","six","seven","eight","nine","ten","first","second","third","same",
  "different","other","another","more","less","than","then","so","if","when","where","which","what",
  "how","why","not","no","yes","can","will","would","should","must","may","up","down","left","right",
  "top","bottom","side","sides","above","below","over","under","between","into","out","off","again",
  // Corpus-wide mathematical filler — present almost everywhere, so it separates nothing.
  "number","numbers","line","lines","point","points","value","values","show","shows","showing","shown",
  "diagram","figure","picture","label","labels","labelled","marked","mark","marks","axis","axes",
  "grid","row","rows","column","columns","box","boxes","bar","bars","step","steps","part","parts",
  "piece","pieces","group","groups","total","totals","amount","amounts","answer","answers","result",
  "results","problem","problems","question","questions","use","using","used","make","makes","made",
  "give","gives","given","take","takes","find","finds","read","reads","write","writes","written",
  "count","counts","counting","size","sizes","small","smaller","big","bigger","large","larger",
  "equal","equally","means","meaning","way","ways","set","sets","place","places","order","new","old"
]);

const STEM = (word: string) => word.replace(/(?:ings?|ed|es|s)$/i, "");
const contentWords = (text: string): Set<string> =>
  new Set(text.toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/)
    .filter((word) => word.length > 3 && !STOP.has(word)).map(STEM).filter((word) => word.length > 2));

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
  const byId = new Map<string, string>();
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
interface Row { lesson: string; step: string; figure: string; shared: string; title: string; prose: string }
const rows: Row[] = [];
let considered = 0;

for (const file of walk(join(ROOT, "content", "courses"))) {
  let json: { lesson?: { id?: string; title?: string; steps?: unknown[] }; id?: string; steps?: unknown[] };
  try { json = JSON.parse(readFileSync(file, "utf8")); } catch { continue; }
  const lesson = json.lesson ?? json;
  if (!lesson?.id || !Array.isArray(lesson.steps)) continue;
  /* THE WHOLE LESSON IS THE CONTEXT, not one step. A figure sits beside a step, but it illustrates
   * the lesson's subject; judging it against a single sentence would flag every figure whose step
   * happens to be terse. This is the most forgiving reading available, which is what a crude
   * measure needs to be. */
  const lessonWords = new Set<string>([...contentWords(String(lesson.title ?? ""))]);
  for (const raw of lesson.steps) {
    const step = raw as { body?: string; widget?: { prompt?: string } };
    for (const word of contentWords(`${String(step.body ?? "")} ${String(step.widget?.prompt ?? "")}`)) lessonWords.add(word);
  }

  for (const [index, raw] of lesson.steps.entries()) {
    const step = raw as { id?: string; figure?: string; body?: string; widget?: { prompt?: string } };
    if (!step.figure || GUARDED.has(step.figure)) continue;
    if (!isFigureTextAligned(step.figure, String(step.body ?? ""))) continue;
    const title = titles.get(step.figure);
    if (!title || ASSERTS.test(title)) continue; // numeric assertions belong to VIS-03
    const figureWords = contentWords(title);
    if (figureWords.size < 3) continue; // too little vocabulary to judge
    considered++;
    const shared = [...figureWords].filter((word) => lessonWords.has(word));
    if (shared.length > 0) continue;
    rows.push({
      lesson: String(lesson.id), step: String(step.id ?? index), figure: step.figure,
      shared: "", title: title.slice(0, 170),
      prose: `${String(step.body ?? "")} ${String(step.widget?.prompt ?? "")}`.replace(/\s+/g, " ").slice(0, 170)
    });
  }
}

mkdirSync(OUT, { recursive: true });
const csv = join(OUT, "VIS04_FIGURE_TOPIC_DRIFT.csv");
writeFileSync(csv, [
  `# sourceSeal=${seal} — S242/VIS-04. RENDERING placements whose figure title shares NO subject`,
  "# vocabulary with its whole lesson. Numeric-assertion figures are VIS-03's; the three guarded",
  "# exemplars are the alignment gate's. Judged against the WHOLE lesson, the most forgiving reading.",
  "lesson,step,figure,title,prose",
  ...rows.map((r) => [r.lesson, r.step, r.figure, r.title, r.prose]
    .map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
].join("\n") + "\n");

console.log(`figure-topic-drift @ ${seal}`);
console.log(`  ${considered} rendering placements judged (non-numeric figures with enough vocabulary)`);
console.log(`  ${rows.length} share NO subject vocabulary with their lesson`);
console.log(`  wrote ${relative(ROOT, csv)}`);
const byFigure = rows.reduce<Record<string, number>>((acc, r) => ({ ...acc, [r.figure]: (acc[r.figure] ?? 0) + 1 }), {});
for (const [figure, n] of Object.entries(byFigure).sort((a, b) => b[1] - a[1]).slice(0, 15))
  console.log(`    ${String(n).padStart(3)}×  ${figure}`);
