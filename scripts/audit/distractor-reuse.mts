/**
 * S242 / MCQ-01 — THE REPEATED DISTRACTOR. What "prose vs prose" was really pointing at.
 *
 * `MCQ_LEAKAGE_ADJUDICATION.md` put 507 items in `length-prose-vs-prose`: the correct answer is
 * longer than every distractor because the true reason is longer. Its verdict was that this needs
 * authoring — "write more plausible wrong reasons" — and that shortening the correct answer would
 * damage the item. Both true, and neither tells an author which item to open first.
 *
 * READING ONE FAMILY END TO END CHANGED THE QUESTION. All 22 authored `si-*` rows, statistical
 * inference, and the same distractor is doing the work in eight of them:
 *
 *     "The sample is too small to conclude anything."   si-01-01
 *     "A larger sample, so the 90% is more precise."    si-01-03
 *     "The polls were too small."                       si-02-01
 *     "The sample was too small."                       si-04-02
 *     "The sample was too small."                       si-05-02
 *     "How much wobble — the sample is too small."      si-05-03
 *     "The sample is too small to support a policy…"    si-05-03
 *
 * It is never the answer. A learner who notices that — and learners notice — can eliminate one
 * option in eight items without understanding a single thing about sampling. That is a clue leak,
 * it is bigger than any length ratio, and no tell in the leakage index measures it.
 *
 * SO THIS MEASURES DISTRACTOR REUSE, WHICH IS BOTH SHARPER AND ACTIONABLE. A distractor shape
 * repeated across a course, never correct, is a filler slot with a name. It is the authored twin of
 * the generator padding helpers GEN-03 disarmed, and it takes the same repair: write a wrong reason
 * that belongs to THIS item, or accept fewer options.
 *
 * The shape is the label with its numbers masked and its function words dropped, so "The sample is
 * too small" and "The polls were too small" count as one — they are the same escape hatch.
 *
 * Run: npx tsx scripts/audit/distractor-reuse.mts
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { join, relative } from "node:path";
import { execSync } from "node:child_process";

const ROOT = process.cwd();
const OUT = join(ROOT, "reports", "mcq");
const seal = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();

/** Reported only where a shape recurs enough that a learner could learn the pattern. */
const MIN_REUSE = 3;

/* Function words, plurals and specific nouns are stripped so that the SHAPE of the escape hatch is
 * what is compared. "The sample is too small to conclude anything" and "The polls were too small"
 * both reduce to `sampl too small` — which is the point: a learner does not memorise the wording,
 * they memorise that one option always says the study was too small and is always wrong. */
const STOP = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "to", "of", "in", "on", "for", "so",
  "that", "this", "these", "those", "it", "its", "as", "at", "by", "with", "and", "or", "but",
  "there", "here", "just", "only", "any", "some", "no", "not", "you", "your", "we", "our", "they",
  "their", "he", "she", "his", "her", "would", "could", "should", "will", "can", "do", "does", "did",
  "have", "has", "had", "than", "then", "because", "since", "if", "when", "what", "which", "who"
]);
const STEM = (word: string) => word.replace(/(?:ings?|ed|es|s)$/i, "");

function shapeOf(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 1 && !STOP.has(word))
    .map(STEM)
    .filter(Boolean)
    .sort()
    .join(" ");
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

interface Use { course: string; lesson: string; step: string; label: string; correct: boolean }
const uses = new Map<string, Use[]>();
let items = 0;
let options = 0;

for (const file of walk(join(ROOT, "content", "courses"))) {
  const course = file.split("/courses/")[1]?.split("/")[0] ?? "";
  let json: { lesson?: { id?: string; steps?: unknown[] }; id?: string; steps?: unknown[] };
  try { json = JSON.parse(readFileSync(file, "utf8")); } catch { continue; }
  const lesson = json.lesson ?? json;
  if (!lesson?.id || !Array.isArray(lesson.steps)) continue;
  for (const [index, raw] of lesson.steps.entries()) {
    const step = raw as { id?: string; widget?: { type?: string; options?: Array<{ label?: string; correct?: boolean }> } };
    if (step.widget?.type !== "mcq" || !Array.isArray(step.widget.options)) continue;
    items++;
    for (const option of step.widget.options) {
      const label = String(option.label ?? "").trim();
      if (!label) continue;
      options++;
      const shape = shapeOf(label);
      if (shape.split(" ").length < 2) continue; // one content word is not a shape
      if (!uses.has(shape)) uses.set(shape, []);
      uses.get(shape)!.push({ course, lesson: String(lesson.id), step: String(step.id ?? index), label, correct: Boolean(option.correct) });
    }
  }
}

interface Row { shape: string; uses: number; courses: number; timesCorrect: number; scope: string; example: string; lessons: string }
const rows: Row[] = [];
for (const [shape, list] of uses) {
  if (list.length < MIN_REUSE) continue;
  const courses = new Set(list.map((u) => u.course));
  const timesCorrect = list.filter((u) => u.correct).length;
  /* NEVER-CORRECT is the load-bearing condition. A shape that is sometimes the answer is a genuine
   * recurring idea and eliminating it would be a mistake; a shape that is never the answer is a
   * slot the author reached for when they needed a fourth option. */
  if (timesCorrect > 0) continue;
  rows.push({
    shape, uses: list.length, courses: courses.size, timesCorrect,
    scope: courses.size === 1 ? "one course" : "across courses",
    example: list[0].label.slice(0, 120),
    lessons: [...new Set(list.map((u) => `${u.lesson}#${u.step}`))].slice(0, 6).join(" ")
  });
}
rows.sort((a, b) => b.uses - a.uses);

mkdirSync(OUT, { recursive: true });
const csv = join(OUT, "MCQ_DISTRACTOR_REUSE_INDEX.csv");
writeFileSync(csv, [
  `# sourceSeal=${seal} minReuse=${MIN_REUSE} — S242/MCQ-01. A distractor SHAPE (label with numbers,`,
  "# punctuation and function words stripped, words stemmed and sorted) that recurs and is NEVER the",
  "# correct answer. A learner who notices the pattern eliminates an option without understanding the",
  "# item. Shapes that are sometimes correct are excluded: those are recurring ideas, not filler.",
  "shape,uses,courses,scope,exampleLabel,lessons",
  ...rows.map((r) => [r.shape, r.uses, r.courses, r.scope, r.example, r.lessons]
    .map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
].join("\n") + "\n");

/* ── AND THE THING THE HAND-CHECK FOUND, WHICH IS WORSE ──────────────────────────────────────
 *
 * Verifying "never correct" on the `cannot tell` family meant printing the items it appears in, and
 * two of the first six were the SAME ITEM TWICE IN ONE LESSON — g4m-02-02#k1 and #k3, identical
 * prompt, identical options. That is not a distractor problem at all; it is a copy-paste artifact
 * that asks a learner the same question twice in one sitting and records two independent "correct"
 * attempts on one remembered item, which is exactly the mastery-as-memory failure this whole
 * program exists to remove. It is measured here because it was found here. */
const byItem = new Map<string, string[]>();
for (const file of walk(join(ROOT, "content", "courses"))) {
  let json: { lesson?: { id?: string; steps?: unknown[] }; id?: string; steps?: unknown[] };
  try { json = JSON.parse(readFileSync(file, "utf8")); } catch { continue; }
  const lesson = json.lesson ?? json;
  if (!lesson?.id || !Array.isArray(lesson.steps)) continue;
  for (const [index, raw] of lesson.steps.entries()) {
    const step = raw as { id?: string; widget?: { type?: string; options?: Array<{ label?: string }> } };
    if (step.widget?.type !== "mcq" || !Array.isArray(step.widget.options)) continue;
    const prompt = String((step.widget as { prompt?: string }).prompt ?? "").trim();
    if (!prompt) continue;
    const key = `${prompt}\u0000${step.widget.options.map((o) => String(o.label ?? "").trim()).sort().join("\u0001")}`;
    if (!byItem.has(key)) byItem.set(key, []);
    byItem.get(key)!.push(`${lesson.id}#${step.id ?? index}`);
  }
}
const duplicated = [...byItem.values()].filter((where) => where.length > 1);
const withinLesson = duplicated.filter((where) => new Set(where.map((w) => w.split("#")[0])).size < where.length);
const dupCsv = join(OUT, "MCQ_DUPLICATE_ITEM_INDEX.csv");
writeFileSync(dupCsv, [
  `# sourceSeal=${seal} — S242/MCQ-01. Authored mcq items whose prompt AND option set are identical.`,
  "# `withinLesson` means the same question is asked twice in one sitting: two independent 'correct'",
  "# attempts recorded against one remembered item.",
  "placements,withinLesson,prompt,where",
  ...duplicated.sort((a, b) => b.length - a.length).map((where) => {
    const within = new Set(where.map((w) => w.split("#")[0])).size < where.length;
    const prompt = [...byItem.entries()].find(([, v]) => v === where)?.[0].split("\u0000")[0] ?? "";
    return [where.length, String(within), prompt.slice(0, 160), where.join(" ")].map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",");
  })
].join("\n") + "\n");

const reused = rows.reduce((n, r) => n + r.uses, 0);
console.log(`distractor-reuse @ ${seal}`);
console.log(`  ${items.toLocaleString()} authored mcq items, ${options.toLocaleString()} options`);
console.log(`  ${rows.length} distractor shapes reused ${MIN_REUSE}+ times and NEVER correct`);
console.log(`  ${reused.toLocaleString()} option slots filled by one of them (${((100 * reused) / Math.max(options, 1)).toFixed(1)}% of all options)`);
console.log(`  ${rows.filter((r) => r.courses > 1).length} of those shapes span more than one course`);
console.log(`  wrote ${relative(ROOT, csv)}`);
console.log(`  ${byItem.size.toLocaleString()} distinct authored mcq items; ${duplicated.length} appear more than once, over ${duplicated.reduce((n, w) => n + w.length, 0)} placements`);
console.log(`  ${withinLesson.length} of those are the SAME QUESTION TWICE IN ONE LESSON — see ${relative(ROOT, dupCsv)}`);
console.log("\n  top reused shapes:");
for (const r of rows.slice(0, 15)) console.log(`    ${String(r.uses).padStart(3)}×  ${r.scope.padEnd(14)}  ${r.example}`);
