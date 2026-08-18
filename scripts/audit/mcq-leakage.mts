#!/usr/bin/env npx tsx
/**
 * S242 / MCQ-01 — CLUE LEAKAGE, SEPARATED BY CAUSE.
 *
 * WHY REBUILD RATHER THAN WORK THE EXISTING QUEUE. `MCQ_DISTRACTOR_AUDIT.csv` carries 3,293 rows
 * with 572 marked REMEDIATE by a composite `blind_guess_test`. A composite verdict cannot be worked:
 * it says an item is guessable without saying WHY, so every row needs a human read before anyone can
 * even decide whether it is fixable. And the file predates an unknown amount of content change —
 * this program has already been slowed twice by counts that were true when written.
 *
 * So this measures the live corpus, and it scores each leak SEPARATELY. A row that fails only on
 * length is a different repair from one that fails because the correct option is the only one that
 * grammatically completes the stem, and both are different from one where the distractors announce
 * themselves with "always" and "never".
 *
 * THE FIVE TELLS, each a documented multiple-choice writing failure:
 *   · LENGTH — the correct option is markedly longer than every distractor. The oldest tell there
 *     is: authors elaborate the answer they believe and leave the wrong ones terse.
 *   · QUALIFIER — the correct option is the only one carrying a justification clause ("because…",
 *     "since…", a comma-separated rationale). Same cause, different surface.
 *   · ABSOLUTES — "always", "never", "impossible" appear only in distractors. Test-wise learners
 *     are taught to eliminate absolutes, so this hands them the answer. (Bare "all"/"every" are NOT
 *     in the set: they are how definitions are written — see the constant below.)
 *   · GRAMMAR — the stem ends mid-sentence and only the correct option continues it grammatically.
 *   · ODD-ONE-OUT — the correct option is the only one of its FORM (the only number among words,
 *     the only one with a unit, the only negative).
 *
 * WHAT THIS IS NOT. It is not a rewrite list. §9 is explicit that MCQ review is grouped "by
 * misconception/family, not only heuristic score", and that nothing is bulk-reworded by string
 * length. A row here is a candidate for a human read; the value is that the read starts from a
 * named cause instead of a composite verdict.
 *
 * Usage: npx tsx scripts/audit/mcq-leakage.mts [--write]
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { execSync } from "node:child_process";
import { VARIANT_GENERATORS } from "../../src/lib/variants";
import { hashSeed, mulberry32 } from "../../src/lib/prng";

const ROOT = process.cwd();
const WRITE = process.argv.includes("--write");
const head = (() => {
  try { return execSync("git rev-parse --short HEAD", { cwd: ROOT }).toString().trim(); }
  catch { return "unsealed"; }
})();

const collectInputFiles = (directory: string): string[] => readdirSync(directory, { withFileTypes: true })
  .flatMap((entry) => {
    const child = join(directory, entry.name);
    return entry.isDirectory() ? collectInputFiles(child) : entry.isFile() ? [child] : [];
  });

// Bind the evidence to the actual dirty-worktree inputs, not only to HEAD. This
// lets the generated CSV prove which authored lessons and generator sources it
// measured before the packet is committed.
const inputFiles = [
  ...collectInputFiles(join(ROOT, "content", "courses")),
  ...collectInputFiles(join(ROOT, "src", "lib")),
  join(ROOT, "scripts", "audit", "mcq-leakage.mts"),
]
  .filter((file) => !/[.]test[.][cm]?[jt]sx?$/.test(file))
  .sort((a, b) => relative(ROOT, a).localeCompare(relative(ROOT, b)));
const inputHash = createHash("sha256");
for (const file of inputFiles) {
  inputHash.update(relative(ROOT, file).split(sep).join("/"));
  inputHash.update("\0");
  inputHash.update(readFileSync(file));
  inputHash.update("\0");
}
const seal = `${head}+inputs.${inputHash.digest("hex").slice(0, 12)}`;

type Option = { label: string; correct: boolean };
type Item = { source: string; owner: string; unit: string; prompt: string; options: Option[]; path: string };
type Leak = { code: string; detail: string };

/* NARROWED AFTER READING THE FIRST RESULTS — bare "all", "none" and "every" are how definitions are
 * written, not overclaims. "Equilateral — all three sides equal" is a correct definition sitting in
 * a distractor, and flagging it said nothing. Only words that make a claim UNIVERSAL in a way a
 * careful answer would hedge are kept. */
const ABSOLUTE = /\b(always|never|impossible|invariably|in every case)\b/i;
const QUALIFIER = /\b(because|since|so that|which means|as a result|therefore)\b/i;

/** Every tell this audit knows, scored independently. */
function leaks(item: Item): Leak[] {
  const correct = item.options.filter((o) => o.correct);
  const wrong = item.options.filter((o) => !o.correct);
  if (correct.length !== 1 || wrong.length < 2) return [];
  const answer = correct[0].label.trim();
  const found: Leak[] = [];

  // LENGTH. "Markedly" is doing real work: an answer one word longer is not a tell. The threshold is
  // 1.5x the LONGEST distractor and at least 12 characters of margin, so short option sets — where a
  // few characters is noise — cannot trip it.
  const longestWrong = Math.max(...wrong.map((o) => o.label.trim().length));
  if (answer.length > longestWrong * 1.5 && answer.length - longestWrong >= 12) {
    /* THE LENGTH TELL SPLITS IN TWO, and only one half has a mechanical repair.
     *
     * "Positive — y goes up as x goes up" against "Negative", "No association", "Can't tell" is not
     * really a length problem: the answer carries its own EXPLANATION and the distractors are bare
     * labels. The learner does not need to know scatter plots to pick the one that argues for
     * itself. It is also the wrong place for that sentence — an explanation belongs in the option's
     * feedback, where a learner reads it AFTER committing, not in the label where it decides the
     * commitment. So this one is repairable without touching the pedagogy: move the clause.
     *
     * The other half is prose against prose — "Because an input in both would receive two outputs,
     * and functions give one" against "Because overlapping conditions are hard to write". The
     * answer is longer because the true reason is longer. Fixing that means writing more plausible
     * wrong reasons, which is authoring, and §9 says MCQ review goes by misconception family with a
     * human in the loop. Naming the two separately is what lets the first be worked now and the
     * second be scheduled honestly. */
    const dashExplained = (l: string) => /^[^—–]{1,28}\s+[—–]\s+\S/.test(l.trim());
    const code = dashExplained(answer) && !wrong.some((o) => dashExplained(o.label))
      ? "length-answer-explains-itself"
      : "length-prose-vs-prose";
    found.push({ code, detail: `${answer.length} chars vs longest distractor ${longestWrong}` });
  }

  // QUALIFIER. Only the answer explains itself.
  if (QUALIFIER.test(answer) && !wrong.some((o) => QUALIFIER.test(o.label)))
    found.push({ code: "lone-justification", detail: answer.slice(0, 90) });

  // ABSOLUTES. Only the distractors overclaim.
  const absoluteWrong = wrong.filter((o) => ABSOLUTE.test(o.label)).length;
  if (absoluteWrong === wrong.length && !ABSOLUTE.test(answer))
    found.push({ code: "absolutes-in-distractors-only", detail: `${absoluteWrong}/${wrong.length} distractors` });

  // GRAMMAR. The stem is an unfinished sentence and only one option continues it in lower case.
  if (/[a-z,]\s*$/.test(item.prompt.trim()) && !/[.?!:]$/.test(item.prompt.trim())) {
    const continues = (l: string) => /^[a-z]/.test(l.trim());
    if (continues(answer) && !wrong.some((o) => continues(o.label)))
      found.push({ code: "only-answer-completes-stem", detail: item.prompt.slice(-40) });
  }

  // ODD-ONE-OUT of FORM. The answer is the only number among words, or the only one carrying a unit.
  // U+2212 is the corpus's minus sign. The first cut used ASCII only, so "−5" read as non-numeric
  // and every signed distractor made its positive answer look like "the only number".
  const isNumeric = (l: string) => /^[-−]?[\d.,/\s]+$/.test(l.trim());
  /* S242 / MCQ-01, read against `rnsCompareRootDecimal` after its repair. The item asks "Which is
   * greater: √20 or 4.5?" with bare labels. On the seeds where the decimal wins, this tell fired —
   * `4.5` is the only string parsing as a number. But the learner's actual choice is between TWO
   * VALUES, √20 and 4.5, and which form wins varies seed to seed, so the shape carries no signal
   * about correctness. The tell's own concept is odd-one-out of FORM, and a root, a π-multiple or
   * a fraction IS a value form — an option like √20 makes a numeral key not-odd. `valueLike`
   * widens what counts as a value; it does not loosen the tell where all distractors are prose. */
  const valueLike = (l: string) => isNumeric(l) || /^[-−]?(?:√\d+|\d*π(?:\/\d+)?|\d+\/\d+|e)$/.test(l.trim());
  if (isNumeric(answer) && !wrong.some((o) => valueLike(o.label)))
    found.push({ code: "only-numeric-option", detail: answer.slice(0, 40) });
  /* Units must be UNAMBIGUOUS. The first cut matched "1s" as one second — it is a plural — and
   * "0.95 in magnitude" as inches. Single-letter and English-word units now require a space before
   * and a boundary after, and the bare plural "s" is gone entirely. */
  const hasUnit = (l: string) => /\d\s*(?:cm|mm|km|kg|ml|°|%)\b/i.test(l) || /\d\s+(?:m|g|l|ft|yd|in|min|hours?|seconds?|metres?|meters?)\b/i.test(l);
  if (hasUnit(answer) && !wrong.some((o) => hasUnit(o.label)))
    found.push({ code: "only-option-with-a-unit", detail: answer.slice(0, 40) });

  return found;
}

/* ---- collect items ---- */
const items: Item[] = [];
function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (e.isFile() && e.name.endsWith(".json")) out.push(full);
  }
  return out;
}
for (const file of walk(join(ROOT, "content"))) {
  let json: Record<string, any>;
  try { json = JSON.parse(readFileSync(file, "utf8")); } catch { continue; }
  const lesson = json.lesson ?? json;
  for (const [i, step] of (lesson.steps ?? []).entries()) {
    const w = step.widget;
    if (w?.type !== "mcq" || !Array.isArray(w.options)) continue;
    items.push({
      source: "authored", owner: String(lesson.id ?? "?"), unit: String(step.id ?? i),
      prompt: String(w.prompt ?? ""), path: relative(ROOT, file).split(sep).join("/"),
      options: w.options.map((o: any) => ({ label: String(o.label ?? ""), correct: Boolean(o.correct) }))
    });
  }
}
for (const generator of VARIANT_GENERATORS) {
  const forms = generator.forms?.length ? [...generator.forms] : ["default"];
  for (const form of forms) {
    for (let i = 0; i < 3; i++) {
      try {
        const w = generator.gen(mulberry32(hashSeed(`${generator.tag}|${form}|core|${i}`)), "core", form as never).widget as any;
        if (w?.type !== "mcq" || !Array.isArray(w.options)) continue;
        items.push({
          source: "generated", owner: generator.tag, unit: String(form),
          prompt: String(w.prompt ?? ""), path: "",
          options: w.options.map((o: any) => ({ label: String(o.label ?? ""), correct: Boolean(o.correct) }))
        });
      } catch { /* declaration-only default */ }
    }
  }
}

/* ---- score ---- */
type Row = Item & { leak: Leak };
const rows: Row[] = [];
for (const item of items) for (const leak of leaks(item)) rows.push({ ...item, leak });

const seen = new Set<string>();
const unique = rows.filter((r) => {
  const key = `${r.source}|${r.owner}|${r.unit}|${r.leak.code}`;
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

const byCode = new Map<string, number>();
for (const r of unique) byCode.set(r.leak.code, (byCode.get(r.leak.code) ?? 0) + 1);
const affected = new Set(unique.map((r) => `${r.source}|${r.owner}|${r.unit}`));

console.log(`mcq-leakage @ ${seal}`);
console.log(`  source input files        ${inputFiles.length}`);
console.log(`  mcq items measured        ${items.length} (${items.filter((i) => i.source === "authored").length} authored, ${items.filter((i) => i.source === "generated").length} generated)`);
console.log(`  items with any tell       ${affected.size}`);
console.log(`  findings by cause:`);
for (const [code, n] of [...byCode].sort((a, b) => b[1] - a[1])) console.log(`    ${String(n).padStart(4)}  ${code}`);
for (const r of unique.slice(0, 8))
  console.log(`      ${r.source.padEnd(9)} ${r.owner}#${r.unit} [${r.leak.code}] ${r.leak.detail.slice(0, 60)}`);

if (WRITE) {
  const out = join(ROOT, "reports", "mcq");
  mkdirSync(out, { recursive: true });
  const csv = (c: string[]) => c.map((x) => (/[",\n]/.test(x) ? `"${x.replace(/"/g, '""')}"` : x)).join(",");
  writeFileSync(join(out, "MCQ_LEAKAGE_INDEX.csv"), [
    `# sourceSeal=${seal} inputFiles=${inputFiles.length} generatedBy=scripts/audit/mcq-leakage.mts`,
    "# One row per (item, tell). Each tell is a documented multiple-choice writing failure, scored",
    "# independently — a length leak is a different repair from a lone-justification leak.",
    "# NOT a rewrite list: MCQ review is grouped by misconception family, and nothing is reworded by",
    "# string length alone. A row is a candidate for a human read that starts from a named cause.",
    csv(["source", "owner", "unit", "tell", "detail", "prompt", "correct", "distractors", "path"]),
    ...unique.map((r) => csv([
      r.source, r.owner, r.unit, r.leak.code, r.leak.detail, r.prompt.slice(0, 160),
      r.options.find((o) => o.correct)?.label.slice(0, 120) ?? "",
      r.options.filter((o) => !o.correct).map((o) => o.label).join(" · ").slice(0, 200), r.path
    ]))
  ].join("\n") + "\n");
  console.log(`  wrote reports/mcq/MCQ_LEAKAGE_INDEX.csv`);
}
